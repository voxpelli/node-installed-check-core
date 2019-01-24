'use strict';

const semverIntersect = require('@voxpelli/semver-set').intersect;

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

  const finalIntersections = Object.assign({}, engines);

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

module.exports = checkEngineVersions;
