'use strict';

const { promisify } = require('util');

/** @typedef {import('./lib/types').PackageJson} PackageJson */

/** @type {(filename: string, logFunction?: function, strict?: boolean) => Promise<PackageJson>} */
const readJson = promisify(require('read-package-json'));

/** @typedef {{ dependencies: { [moduleName: string]: PackageJson }}} ReadInstalledResponse */
/** @type {(path: string, { dev: boolean, depth: number }) => Promise<ReadInstalledResponse>} */
const readInstalled = promisify(require('read-installed'));

const checkPackageVersions = require('./lib/check-package-versions');
const checkEngineVersions = require('./lib/check-engine-versions');

/**
 * @typedef InstalledCheckResult
 * @property {string[]} errors
 * @property {string[]} warnings
 * @property {string[]} notices
 */

/**
 * @throws {Error}
 * @param {object} options
 * @param {string} [options.path]
 * @param {boolean} options.engineCheck
 * @param {string[]} options.engineIgnores
 * @param {boolean} options.engineNoDev
 * @param {boolean} options.versionCheck
 * @returns {Promise<InstalledCheckResult>}
 */
const installedCheck = async function ({
  path = '.',
  engineCheck,
  engineIgnores,
  engineNoDev,
  versionCheck
}) {
  if (!engineCheck && !versionCheck) {
    throw new Error('Expected to run at least one check. Add engineCheck and/or versionCheck');
  }

  const [
    mainPackage,
    { dependencies: installedDependencies }
  ] = await Promise.all([
    readJson(path + '/package.json'),
    readInstalled(path, { dev: true, depth: 1 })
  ]);

  const requiredDependencies = Object.assign({}, mainPackage.dependencies || {}, mainPackage.devDependencies || {});
  const optionalDependencies = Object.assign({}, mainPackage.optionalDependencies || {});

  /** @type {string[]} */
  let errors = [];
  /** @type {string[]} */
  let warnings = [];
  /** @type {string[]} */
  let notices = [];

  if (versionCheck) {
    const packageResult = checkPackageVersions(requiredDependencies, installedDependencies, optionalDependencies);

    errors = errors.concat(packageResult.errors);
    notices = notices.concat(packageResult.notices);
  }

  if (engineCheck) {
    const dependencies = Object.assign({}, engineNoDev ? mainPackage.dependencies : requiredDependencies);

    (engineIgnores || []).forEach(name => {
      delete dependencies[name];
    });

    const engineResult = checkEngineVersions(
      mainPackage.engines || {},
      dependencies,
      installedDependencies
    );

    errors = errors.concat(engineResult.errors);
    warnings = warnings.concat(engineResult.warnings);
    notices = notices.concat(engineResult.notices);
  }

  return { errors, warnings, notices };
};

module.exports = installedCheck;
