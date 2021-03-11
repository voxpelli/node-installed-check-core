// @ts-check
/// <reference types="node" />

'use strict';

const semver = require('semver');

/**
 * @param {{ [moduleName: string]: string }} requiredDependencies
 * @param {Map<string, import('type-fest').PackageJson>} installedDependencies
 * @param {{ [moduleName: string]: string }} optionalDependencies
 * @returns {{ errors: string[], warnings: string[] }}
 */
const checkPackageVersions = function (requiredDependencies, installedDependencies, optionalDependencies) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];

  for (const dependency of Object.keys(requiredDependencies)) {
    const targetVersion = requiredDependencies[dependency];
    const installed = installedDependencies.get(dependency);
    const installedVersion = installed ? installed.version : undefined;

    if (!targetVersion) {
      warnings.push(dependency + ': Target version is empty. Can\'t match against dependency version');
    } else if (!semver.validRange(targetVersion)) {
      warnings.push(dependency + ': Target version is not a semantic versioning range. Can\'t match against dependency version');
    } else if (!installedVersion) {
      if (!optionalDependencies[dependency]) {
        errors.push(dependency + ': Missing dependency');
      }
    } else if (!semver.satisfies(installedVersion, targetVersion)) {
      errors.push(dependency + ': Invalid version, expected a ' + targetVersion);
    }
  }

  return { errors, warnings };
};

module.exports = checkPackageVersions;
