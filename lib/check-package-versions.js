'use strict';

const semver = require('semver');

/** @typedef {import('./types').PackageJson} PackageJson */

/**
 * @param {{ [moduleName: string]: string }} requiredDependencies
 * @param {{ [moduleName: string]:PackageJson }} installedDependencies
 * @param {{ [moduleName: string]: string }} optionalDependencies
 * @returns {{ errors: string[], notices: string[] }}
 */
const checkPackageVersions = function (requiredDependencies, installedDependencies, optionalDependencies) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const notices = [];

  Object.keys(requiredDependencies).forEach(dependency => {
    const targetVersion = requiredDependencies[dependency];
    const installedVersion = installedDependencies[dependency] ? installedDependencies[dependency].version : undefined;

    if (!semver.validRange(targetVersion)) {
      notices.push(dependency + ': Target version is not a semantic versioning range. Can\'t check');
    } else if (!installedVersion) {
      if (!optionalDependencies[dependency]) {
        errors.push(dependency + ': Missing dependency');
      }
    } else if (!semver.satisfies(installedVersion, targetVersion)) {
      errors.push(dependency + ': Invalid version, expected a ' + targetVersion);
    }
  });

  return { errors, notices };
};

module.exports = checkPackageVersions;
