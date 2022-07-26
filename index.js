import { listInstalled } from 'list-installed';
import { ErrorWithCause } from 'pony-cause';
import { readPackage } from 'read-pkg';

import { checkPackageVersions } from './lib/check-package-versions.js';
import { checkEngineVersions } from './lib/check-engine-versions.js';

/**
 * @typedef InstalledCheckResult
 * @property {string[]} errors
 * @property {string[]} warnings
 * @property {string[]} notices
 */

/**
 * @typedef InstalledCheckOptions
 * @property {string|undefined} [path]
 * @property {boolean|undefined} engineCheck
 * @property {string[]|undefined} [engineIgnores]
 * @property {boolean|undefined} [engineNoDev]
 * @property {boolean|undefined} versionCheck
 */

/**
 * @throws {Error}
 * @param {InstalledCheckOptions} options
 * @returns {Promise<InstalledCheckResult>}
 */
export const installedCheck = async function (options) {
  if (!options) throw new Error('Expected options to be set');

  const {
    path = '.',
    engineCheck = false,
    engineIgnores = [],
    engineNoDev = false,
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
    const dependencies = Object.assign({}, engineNoDev ? mainPackage.dependencies : requiredDependencies);

    for (const name of (engineIgnores || [])) {
      delete dependencies[name];
    }

    const engineResult = checkEngineVersions(
      mainPackage.engines || {},
      dependencies,
      installedDependencies,
      optionalDependencies
    );

    errors = [...errors, ...engineResult.errors];
    warnings = [...warnings, ...engineResult.warnings];
  }

  return { errors, warnings, notices: [] };
};
