'use strict';

const semver = require('semver');

const checkPackageVersions = function (requiredDependencies, installedDependencies, optionalDependencies) {
  const errors = [];
  const notices = [];

  Object.keys(requiredDependencies).forEach(dependency => {
    const targetVersion = requiredDependencies[dependency];
    const installedVersion = (installedDependencies[dependency] || {}).version;

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
