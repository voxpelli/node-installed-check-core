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
 * @param {import('./get-installed-data.js').PackageJsonLike} pkg
 * @param {import('./get-installed-data.js').InstalledDependencies} installed
 * @param {InstalledCheckOptions} options
 * @returns {Promise<InstalledCheckResult>}
 */
export async function performInstalledCheck (checks, pkg, installed, options) {
  if (!checks || !Array.isArray(checks)) {
    throw new TypeError('Expected a "checks" array, got: ' + explainVariable(checks));
  }
  if (!pkg || typeof pkg !== 'object') {
    throw new TypeError('Expected a "pkg" object, got: ' + explainVariable(pkg));
  }
  if (!installed || typeof installed !== 'object') {
    throw new TypeError('Expected a "installed" object, got: ' + explainVariable(installed));
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
    checks.includes('version') && checkPackageVersions(pkg, installed),
    checks.includes('engine') && checkVersions(pkg, 'engines', installed, {
      ...checkOptions,
      defaultKeys: ['node'],
      expectedInDependencies: true,
    }),
    checks.includes('peer') && checkVersions(pkg, 'peerDependencies', installed, checkOptions),
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
