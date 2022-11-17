import { semverIntersect } from '@voxpelli/semver-set';

/**
 * @param {{ [engineName: string]: string }} engines
 * @param {{ [moduleName: string]: string }} requiredDependencies
 * @param {Map<string, import('list-installed').NormalizedPackageJson>} installedDependencies
 * @param {{ [moduleName: string]: string }} optionalDependencies
 * @returns {{ errors: string[], warnings: string[], notices: string[] }}
 */
export function checkEngineVersions (engines, requiredDependencies, installedDependencies, optionalDependencies) {
  let engineKeys = Object.keys(engines);

  if (!engineKeys.length) {
    engines = {
      node: '*'
    };
    engineKeys = Object.keys(engines);
  }

  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];
  /** @type {string[]} */
  const notices = [];

  for (const engine of engineKeys) {
    if (!engines[engine]) {
      warnings.push('Empty engine definition: ' + engine);
    }
  }

  /** @type {{ [engineName: string]: string | false }} */
  const finalIntersections = Object.assign({}, engines);

  for (const dependency of Object.keys(requiredDependencies)) {
    const installed = installedDependencies.get(dependency);

    if (!installed) {
      (optionalDependencies[dependency] ? warnings : errors)
        .push(dependency + ': Dependency is not installed. Can\'t check its engine requirement');
      continue;
    }

    const dependencyEngines = installed.engines || {};

    for (const engine of engineKeys) {
      const referenceEngine = engines[engine];
      const dependencyEngine = dependencyEngines[engine];

      if (!dependencyEngine) {
        warnings.push(dependency + ': Missing engine: ' + engine);
      } else {
        const intersection = semverIntersect(referenceEngine || '*', dependencyEngine);

        if (!intersection) {
          errors.push(dependency + ': Incompatible "' + engine + '" engine requirement: ' + dependencyEngine);
          finalIntersections[engine] = false;
        } else if (intersection !== engines[engine]) {
          errors.push(dependency + ': Narrower "' + engine + '" engine requirement needed: ' + dependencyEngine);

          const value = finalIntersections[engine];
          if (value !== false) {
            finalIntersections[engine] = semverIntersect(value || '*', dependencyEngine) || false;
          }
        }
      }
    }
  }

  for (const engine of Object.keys(finalIntersections)) {
    const intersection = finalIntersections[engine];
    if (intersection === false) {
      errors.push('Incompatible combined "' + engine + '" requirements.');
    } else if (intersection !== engines[engine]) {
      errors.push('Combined "' + engine + '" engine requirement needs to be narrower: ' + intersection);
    }
  }

  return { errors, warnings, notices };
}
