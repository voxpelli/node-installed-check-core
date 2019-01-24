'use strict';

const { promisify } = require('util');

const readJson = promisify(require('read-package-json'));
const readInstalled = promisify(require('read-installed'));
const semver = require('semver');
const semverIntersect = require('@voxpelli/semver-set').intersect;

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

const checkEngineVersions = function (engines, requiredDependencies, installedDependencies) {
  let engineKeys = Object.keys(engines);

  if (!engineKeys.length) {
    engines = {
      node: '*',
      npm: '*'
    };
    engineKeys = Object.keys(engines);
  }

  const errors = [];
  const warnings = [];
  const notices = [];

  let finalIntersections = Object.assign({}, engines);

  Object.keys(requiredDependencies).forEach(dependency => {
    const dependencyEngines = (installedDependencies[dependency] || {}).engines || {};

    engineKeys.forEach(engine => {
      if (!dependencyEngines[engine]) {
        warnings.push(dependency + ': Missing engine: ' + engine);
      } else {
        const intersection = semverIntersect(engines[engine], dependencyEngines[engine]);

        if (!intersection) {
          errors.push(dependency + ': Incompatible "' + engine + '" engine requirement: ' + dependencyEngines[engine]);
          finalIntersections[engine] = false;
        } else if (intersection !== engines[engine]) {
          errors.push(dependency + ': Narrower "' + engine + '" engine requirement needed: ' + dependencyEngines[engine]);

          if (finalIntersections[engine]) {
            finalIntersections[engine] = semverIntersect(finalIntersections[engine], dependencyEngines[engine]);
          }
        }
      }
    });
  });

  Object.keys(finalIntersections).forEach(engine => {
    const intersection = finalIntersections[engine];
    if (!intersection) {
      errors.push('Incompatible combined "' + engine + '" requirements.');
    } else if (intersection !== engines[engine]) {
      errors.push('Combined "' + engine + '" engine requirement needs to be narrower: ' + intersection);
    }
  });

  return { errors, warnings, notices };
};

const installedCheck = function (path = '.', options = {}) {
  if (typeof path === 'object') {
    return installedCheck(undefined, path);
  }

  const {
    engineCheck,
    engineIgnores,
    engineNoDev,
    noVersionCheck
  } = options;

  return Promise.all([
    readJson(path + '/package.json'),
    readInstalled(path, { dev: true, depth: 1 })
  ])
    .then(result => {
      const mainPackage = result[0];
      const requiredDependencies = Object.assign({}, mainPackage.dependencies, mainPackage.devDependencies);
      const installedDependencies = result[1].dependencies;
      const optionalDependencies = Object.assign({}, mainPackage.optionalDependencies);

      let errors = [];
      let warnings = [];
      let notices = [];

      if (!noVersionCheck) {
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
    });
};

module.exports = installedCheck;
