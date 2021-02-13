// @ts-check
/// <reference types="node" />

'use strict';

const readPkg = require('read-pkg');
const { listInstalled } = require('list-installed');

const checkPackageVersions = require('./lib/check-package-versions');
const checkEngineVersions = require('./lib/check-engine-versions');

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
    installedDependencies,
  ] = await Promise.all([
    readPkg({ cwd: path }),
    listInstalled(path),
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

    for (const name of (engineIgnores || [])) {
      delete dependencies[name];
    }

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
