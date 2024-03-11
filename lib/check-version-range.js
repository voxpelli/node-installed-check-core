import { semverIntersect } from '@voxpelli/semver-set';
import { omit } from '@voxpelli/typed-utils';
import { validRange } from 'semver';

import { getStringValueByPath } from './utils.js';

/** @typedef {{ valid: boolean|undefined, suggested?: string|undefined, note: string|undefined }} VersionRangeItem */

/**
 * @typedef VersionRangeOptions
 * @property {boolean} [expectedInDependencies=false] When set a warning will be issued when the key is empty or not found in a dependency
 * @property {boolean} [noDev=false] If set then dev dependencies won't be included in the check
 * @property {string[]} [ignore] If set then the specified module names won't be included in the
 * @property {boolean} [strict=false] Converts most warnings into failures
 */

/** @typedef {VersionRangeItem & { packageNotes: Array<VersionRangeItem & { name: string }> }} VersionRangeResult */

/**
 * @param {import('./get-installed-data.js').PackageJsonLike} mainPackage
 * @param {string} key
 * @param {import('./get-installed-data.js').InstalledDependencies} installedDependencies
 * @param {VersionRangeOptions} [options]
 * @returns {VersionRangeResult}
 */
export function checkVersionRange (mainPackage, key, installedDependencies, options) {
  const {
    ignore,
    noDev = false,
    strict = false,
  } = options || {};

  const rawReferenceRange = getStringValueByPath(mainPackage, key);
  const referenceRange = rawReferenceRange || '*';

  /** @type {Array<VersionRangeItem & { name: string }>} */
  const packageNotes = [];

  const requiredDependencies = omit({
    ...mainPackage.dependencies,
    ...(noDev ? mainPackage.devDependencies : {}),
  }, ignore || []);
  const optionalDependencies = { ...mainPackage.optionalDependencies };

  /** @type {string | false} */
  let intersection = referenceRange;

  for (const dependency in requiredDependencies) {
    const dependencyPackage = installedDependencies instanceof Map ? installedDependencies.get(dependency) : installedDependencies[dependency];
    const isOptional = !!optionalDependencies[dependency];

    const dependencyNotes = checkDependencyRange(referenceRange, key, dependencyPackage, isOptional, options);

    if (!dependencyNotes) {
      continue;
    }

    packageNotes.push({ name: dependency, ...dependencyNotes });

    if (dependencyNotes.valid === false) {
      intersection = intersection && dependencyNotes.suggested
        ? semverIntersect(intersection, dependencyNotes.suggested) || false
        : false;
    }
  }

  const valid = intersection !== false && validRange(intersection) === validRange(referenceRange);

  return {
    valid: valid
      ? true
      : ((rawReferenceRange || strict) ? false : undefined),
    suggested: valid ? undefined : (intersection || undefined),
    packageNotes,
    note: rawReferenceRange === false
      ? `Invalid "${key}" in main package`
      : (rawReferenceRange ? undefined : `Missing "${key}" in main package`),
  };
}

/**
 * @param {string} referenceRange
 * @param {string} key
 * @param {import('./get-installed-data.js').PackageJsonLike|undefined} dependencyPackage
 * @param {boolean} [isOptional]
 * @param {Omit<VersionRangeOptions, 'noDev'>} [options]
 * @returns {(VersionRangeItem & { valid: false | undefined }) | undefined}
 */
export function checkDependencyRange (referenceRange, key, dependencyPackage, isOptional, options) {
  const {
    expectedInDependencies = false,
    strict = false,
  } = options || {};

  if (!dependencyPackage) {
    return {
      // Always a warning when optional, otherwise warning only when not strict
      valid: isOptional ? undefined : (strict ? false : undefined),
      note: 'Dependency is not installed. Can\'t check its requirements',
    };
  }

  const range = getStringValueByPath(dependencyPackage, key);

  if (range === false) {
    return { valid: strict ? false : undefined, note: `Invalid "${key}"` };
  }

  if (!range) {
    if (!expectedInDependencies) {
      return;
    }
    return strict
      ? { valid: false, note: `Required "${key}" is missing` }
      : { valid: undefined, note: `Missing "${key}"` };
  }

  const intersection = semverIntersect(referenceRange, range);

  if (!intersection) {
    return { valid: false, note: `Incompatible "${key}" requirement: ${range}` };
  }

  return validRange(intersection) === validRange(referenceRange)
    ? undefined
    : { valid: false, suggested: intersection, note: `Narrower "${key}" is needed: ${intersection}` };
}
