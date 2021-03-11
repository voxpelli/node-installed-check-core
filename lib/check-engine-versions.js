// @ts-check
/// <reference types="node" />

'use strict';

const semverIntersect = require('@voxpelli/semver-set').intersect;

/**
 * @param {{ [engineName: string]: string }} engines
 * @param {{ [moduleName: string]: string }} requiredDependencies
 * @param {Map<string, import('type-fest').PackageJson>} installedDependencies
 * @returns {{ errors: string[], warnings: string[], notices: string[] }}
 */
const checkEngineVersions = function (engines, requiredDependencies, installedDependencies) {
  let engineKeys = Object.keys(engines);

  if (!engineKeys.length) {
    engines = {
      node: '*',
      npm: '*'
    };
    engineKeys = Object.keys(engines);
  }

  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];
  /** @type {string[]} */
  const notices = [];

  /** @type {{ [engineName: string]: string | false }} */
  const finalIntersections = Object.assign({}, engines);

  for (const dependency of Object.keys(requiredDependencies)) {
    const installed = installedDependencies.get(dependency);
    const dependencyEngines = (installed ? installed.engines : undefined) || {};

    for (const engine of engineKeys) {
      const referenceEngine = engines[engine];
      const dependencyEngine = dependencyEngines[engine];

      if (!referenceEngine) {
        warnings.push('Empty value for engine: ' + engine);
      } else if (!dependencyEngine) {
        warnings.push(dependency + ': Missing engine: ' + engine);
      } else {
        const intersection = semverIntersect(referenceEngine, dependencyEngine);

        if (!intersection) {
          errors.push(dependency + ': Incompatible "' + engine + '" engine requirement: ' + dependencyEngine);
          finalIntersections[engine] = false;
        } else if (intersection !== engines[engine]) {
          errors.push(dependency + ': Narrower "' + engine + '" engine requirement needed: ' + dependencyEngine);

          const value = finalIntersections[engine];
          if (value) {
            finalIntersections[engine] = semverIntersect(value, dependencyEngine) || false;
          }
        }
      }
    }
  }

  for (const engine of Object.keys(finalIntersections)) {
    const intersection = finalIntersections[engine];
    if (!intersection) {
      errors.push('Incompatible combined "' + engine + '" requirements.');
    } else if (intersection !== engines[engine]) {
      errors.push('Combined "' + engine + '" engine requirement needs to be narrower: ' + intersection);
    }
  }

  return { errors, warnings, notices };
};

module.exports = checkEngineVersions;
