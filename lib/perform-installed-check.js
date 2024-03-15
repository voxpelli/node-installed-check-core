import { explainVariable, typedObjectKeys } from '@voxpelli/typed-utils';
import isGlob from 'is-glob';

import { checkPackageVersions } from './check-package-versions.js';
import { checkVersions } from './check-versions.js';

/**
 * @typedef InstalledCheckResult
 * @property {string[]} errors
 * @property {string[]} warnings
 */

/** @typedef {'engine' | 'peer' | 'version'} InstalledChecks */

/** @type {Record<InstalledChecks, true>} */
const checkTypeMap = {
  'engine': true,
  'peer': true,
  'version': true,
};

const checkTypes = typedObjectKeys(checkTypeMap);

/**
 * @typedef InstalledCheckOptions
 * @property {string[]|undefined} [ignore]
 * @property {boolean|undefined} [noDev]
 * @property {boolean|undefined} [strict]
 */

/**
 * @param {InstalledChecks[]} checks
 * @param {import('./get-installed-data.js').PackageJsonLike} mainPackage
 * @param {import('./get-installed-data.js').InstalledDependencies} installedDependencies
 * @param {InstalledCheckOptions} options
 * @returns {Promise<InstalledCheckResult>}
 */
export async function performInstalledCheck (checks, mainPackage, installedDependencies, options) {
  if (!checks || !Array.isArray(checks)) {
    throw new TypeError('Expected a "checks" array, got: ' + explainVariable(checks));
  }
  if (!mainPackage || typeof mainPackage !== 'object') {
    throw new TypeError('Expected a "mainPackage" object, got: ' + explainVariable(mainPackage));
  }
  if (!installedDependencies || typeof installedDependencies !== 'object') {
    throw new TypeError('Expected a "installedDependencies" object, got: ' + explainVariable(installedDependencies));
  }
  if (!options || typeof options !== 'object') {
    throw new TypeError('Expected a "options" object, got :' + explainVariable(options));
  }

  const { ignore, ...passthroughOptions } = options;

  const resolvedIgnores = (
    ignore?.some(value => isGlob(value))
      // eslint-disable-next-line unicorn/no-await-expression-member
      ? (await import('picomatch')).default(ignore)
      : ignore
  );

  /** @type {import('./check-version-range.js').VersionRangeOptions} */
  const checkOptions = { ignore: resolvedIgnores, ...passthroughOptions };

  let hasCheck = false;
  /** @type {string[]} */
  let errors = [];
  /** @type {string[]} */
  let warnings = [];

  const results = [
    checks.includes('version') && checkPackageVersions(mainPackage, installedDependencies),
    checks.includes('engine') && checkVersions(mainPackage, 'engines', installedDependencies, {
      ...checkOptions,
      defaultKeys: ['node'],
      expectedInDependencies: true,
    }),
    checks.includes('peer') && checkVersions(mainPackage, 'peerDependencies', installedDependencies, checkOptions),
  ];

  for (const result of results) {
    if (result) {
      hasCheck = true;
      errors = [...errors, ...result.errors];
      warnings = [...warnings, ...result.warnings];
    }
  }

  if (!hasCheck) {
    throw new Error('Expected to run at least one check. "checks" should include at least one of: ' + checkTypes.join(', '));
  }

  return { errors, warnings };
}
