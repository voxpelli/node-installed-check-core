import { semverIntersect } from '@voxpelli/semver-set';
import { omit } from '@voxpelli/typed-utils';

import { getStringValueByPath } from './utils.js';

/** @typedef {{ valid: boolean|undefined, suggested?: string|undefined, note: string|undefined }} VersionRangeItem */

/**
 * @typedef VersionRangeOptions
 * @property {boolean} [expectedInDependencies]
 * @property {boolean} [noDev]
 * @property {string[]} [ignore]
 * @property {boolean} [strict]
 */

/** @typedef {VersionRangeItem & { packageNotes: Array<VersionRangeItem & { name: string }> }} VersionRangeResult */

/**
 * @param {import('read-pkg').NormalizedPackageJson} mainPackage
 * @param {string} key
 * @param {Map<string, import('list-installed').NormalizedPackageJson>} installedDependencies
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

  for (const dependency of Object.keys(requiredDependencies)) {
    const dependencyPackage = installedDependencies.get(dependency);
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

  return {
    valid: intersection === referenceRange
      ? true
      : (!rawReferenceRange && !strict ? undefined : false),
    suggested: intersection || undefined,
    packageNotes,
    note: rawReferenceRange === false
      ? `Invalid "${key}" in main package`
      : (rawReferenceRange ? undefined : `Missing "${key}" in main package`),
  };
}

/**
 * @param {string} referenceRange
 * @param {string} key
 * @param {import('list-installed').NormalizedPackageJson|undefined} dependencyPackage
 * @param {boolean} isOptional
 * @param {Omit<VersionRangeOptions, 'noDev'>} [options]
 * @returns {VersionRangeItem | undefined}
 */
function checkDependencyRange (referenceRange, key, dependencyPackage, isOptional, options) {
  const {
    expectedInDependencies = false,
    strict = false,
  } = options || {};

  if (!dependencyPackage) {
    return {
      valid: isOptional || !strict ? undefined : false,
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

  return intersection === referenceRange
    ? undefined
    : { valid: false, suggested: intersection, note: `Narrower "${key}" is needed: ${intersection}` };
}
