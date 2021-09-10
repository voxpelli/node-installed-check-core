// @ts-check
/// <reference types="node" />

'use strict';

const { listInstalled } = require('list-installed');
const VError = require('verror');

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
const installedCheck = async function (options) {
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
    (await import('read-pkg')).readPackage({ cwd: path }).catch(/** @param {Error} err */ err => { throw new VError(err, 'Failed to read package.json'); }),
    listInstalled(path).catch(/** @param {Error} err */ err => { throw new VError(err, 'Failed to list installed modules'); }),
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

module.exports = installedCheck;
