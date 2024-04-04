import { semverIntersect } from '@voxpelli/semver-set';
import { omit, pick } from '@voxpelli/typed-utils';
import { validRange } from 'semver';

import { getObjectValueByPath, getStringValueByPath } from './utils.js';

/** @typedef {{ valid: boolean|undefined, suggested?: string|undefined, note: string|undefined }} VersionRangeItem */

/**
 * @typedef VersionRangeOptions
 * @property {boolean|undefined} [expectedInDependencies=false] When set a warning will be issued when the key is empty or not found in a dependency
 * @property {boolean|undefined} [noDev=false] If set then dev dependencies won't be included in the check
 * @property {string[]|((test: string) => boolean)|undefined} [ignore] If set then the specified module names won't be included in the
 * @property {boolean|undefined} [strict=false] Converts most warnings into failures
 */

/** @typedef {VersionRangeItem & { packageNotes: Array<VersionRangeItem & { name: string }> }} VersionRangeResult */

/**
 * @param {import('./lookup-types.d.ts').PackageJsonLike} pkg
 * @param {string} key
 * @param {import('./lookup-types.d.ts').InstalledDependencies} installed
 * @param {VersionRangeOptions} [options]
 * @returns {VersionRangeResult}
 */
export function checkVersionRange (pkg, key, installed, options) {
  const {
    ignore,
    noDev = false,
    strict = false,
  } = options || {};

  const ignoreMatcher = ignore && !Array.isArray(ignore) ? ignore : undefined;

  const rawReferenceRange = getStringValueByPath(pkg, key);
  const invalidReferenceRange = rawReferenceRange && !validRange(rawReferenceRange);
  const referenceRange = (!rawReferenceRange || invalidReferenceRange) ? '*' : rawReferenceRange;

  /** @type {Array<VersionRangeItem & { name: string }>} */
  const packageNotes = [];

  const requiredDependencies = omit({
    ...pkg.dependencies,
    ...(
      noDev
        // Always include peer dependency dev deps
        ? pick(pkg.devDependencies || {}, Object.keys(pkg.peerDependencies || {}))
        : pkg.devDependencies
    ),
  }, Array.isArray(ignore) ? ignore : []);

  const optionalDependencies = { ...pkg.optionalDependencies };

  /** @type {string | false} */
  let intersection = referenceRange;

  for (const dependency in requiredDependencies) {
    if (ignoreMatcher && ignoreMatcher(dependency)) {
      continue;
    }
    if (dependency === pkg.name) {
      continue;
    }

    const dependencyPackage = installed instanceof Map ? installed.get(dependency) : installed[dependency];
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

  /** @type {string|undefined} */
  let note;

  if (rawReferenceRange === false) {
    note = `Invalid "${key}" in main package`;
  } else if (!rawReferenceRange) {
    note = `Missing "${key}" in main package`;
  } else if (invalidReferenceRange && !rawReferenceRange.startsWith('workspace:')) {
    note = `Invalid "${key}" range in main package: "${rawReferenceRange}"`;
  }

  return {
    valid: valid
      ? true
      : ((rawReferenceRange || strict) ? false : undefined),
    suggested: valid ? undefined : (intersection || undefined),
    packageNotes,
    note,
  };
}

/** @typedef {VersionRangeOptions & { defaultKeys?: string[]|undefined }} VersionRangesOptions */

/**
 * @param {import('./lookup-types.d.ts').PackageJsonLike} pkg
 * @param {string} topKey
 * @param {import('./lookup-types.d.ts').InstalledDependencies} installed
 * @param {VersionRangesOptions} [options]
 * @returns {{ [key: string]: VersionRangeResult }}
 */
export function checkVersionRangeCollection (pkg, topKey, installed, options) {
  const { defaultKeys, ...restOptions } = options || {};

  let foundKeys = Object.keys(getObjectValueByPath(pkg, topKey) || {});

  if (foundKeys.length === 0 && defaultKeys) {
    foundKeys = defaultKeys;
  }

  /** @type {{ [key: string]: VersionRangeResult }} */
  const result = {};

  for (const childKey of foundKeys) {
    const key = `${topKey}.${childKey}`;

    result[key] = checkVersionRange(pkg, key, installed, restOptions);
  }

  return result;
}

/**
 * @param {string} referenceRange
 * @param {string} key
 * @param {import('./lookup-types.d.ts').PackageJsonLike|undefined} dependencyPackage
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

  if (!validRange(range)) {
    if (range.startsWith('workspace:')) {
      return;
    }
    return { valid: strict ? false : undefined, note: `Invalid "${key}" range: "${range}"` };
  }

  const intersection = semverIntersect(referenceRange, range);

  if (!intersection) {
    return { valid: false, note: `Incompatible "${key}" requirement: ${range}` };
  }

  return validRange(intersection) === validRange(referenceRange)
    ? undefined
    : { valid: false, suggested: intersection, note: `Narrower "${key}" is needed: ${intersection}` };
}
