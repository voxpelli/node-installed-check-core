import { listInstalled } from 'list-installed';
import { ErrorWithCause } from 'pony-cause';
import { readPackage } from 'read-pkg';

import { checkPackageVersions } from './check-package-versions.js';
import { checkEngineVersions } from './check-engine-versions.js';

/**
 * @typedef InstalledCheckResult
 * @property {string[]} errors
 * @property {string[]} warnings
 */

/**
 * @typedef InstalledCheckOptions
 * @property {string|undefined} [path]
 * @property {boolean|undefined} engineCheck
 * @property {string[]|undefined} [engineIgnores]
 * @property {boolean|undefined} [engineNoDev]
 * @property {boolean} [strict]
 * @property {boolean|undefined} versionCheck
 */

/**
 * @throws {Error}
 * @param {InstalledCheckOptions} options
 * @returns {Promise<InstalledCheckResult>}
 */
export async function installedCheck (options) {
  if (!options) throw new Error('Expected options to be set');

  const {
    engineCheck = false,
    engineIgnores = [],
    engineNoDev = false,
    path = '.',
    strict = false,
    versionCheck = false,
  } = options;

  if (!engineCheck && !versionCheck) {
    throw new Error('Expected to run at least one check. Add engineCheck and/or versionCheck');
  }

  const [
    mainPackage,
    installedDependencies,
  ] = await Promise.all([
    readPackage({ cwd: path }).catch(/** @param {Error} err */ err => {
      throw new ErrorWithCause('Failed to read package.json', { cause: err });
    }),
    listInstalled(path).catch(/** @param {Error} err */ err => {
      throw new ErrorWithCause('Failed to list installed modules', { cause: err });
    }),
  ]);

  const requiredDependencies = Object.assign({}, mainPackage.dependencies || {}, mainPackage.devDependencies || {});
  const optionalDependencies = Object.assign({}, mainPackage.optionalDependencies || {});

  /** @type {string[]} */
  let errors = [];
  /** @type {string[]} */
  let warnings = [];

  if (versionCheck) {
    const packageResult = checkPackageVersions(requiredDependencies, installedDependencies, optionalDependencies);

    errors = [...errors, ...packageResult.errors];
    warnings = [...warnings, ...packageResult.warnings];
  }

  if (engineCheck) {
    const engineResult = checkEngineVersions(
      mainPackage,
      installedDependencies,
      {
        noDev: engineNoDev,
        ignore: engineIgnores,
        strict,
      }
    );

    errors = [...errors, ...engineResult.errors];
    warnings = [...warnings, ...engineResult.warnings];
  }

  return { errors, warnings };
}
