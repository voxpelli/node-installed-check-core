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

  Object.keys(requiredDependencies).forEach(dependency => {
    const installed = installedDependencies.get(dependency);
    const dependencyEngines = (installed ? installed.engines : undefined) || {};

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

          const value = finalIntersections[engine];
          if (value) {
            finalIntersections[engine] = semverIntersect(value, dependencyEngines[engine]) || false;
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
