import semver from 'semver';

/**
 * @param {{ [moduleName: string]: string }} requiredDependencies
 * @param {Map<string, import('list-installed').NormalizedPackageJson>} installedDependencies
 * @param {{ [moduleName: string]: string }} optionalDependencies
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function checkPackageVersions (requiredDependencies, installedDependencies, optionalDependencies) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];

  for (const dependency of Object.keys(requiredDependencies)) {
    const targetVersion = requiredDependencies[dependency];
    const installed = installedDependencies.get(dependency);
    const installedVersion = installed ? installed.version : undefined;

    if (!installed && !optionalDependencies[dependency]) {
      errors.push(dependency + ': Dependency is not installed. Can\'t check its version');
    }

    if (!targetVersion) {
      warnings.push(dependency + ': Target version is empty. Can\'t match against dependency version');
    } else if (!semver.validRange(targetVersion)) {
      warnings.push(dependency + ': Target version is not a semantic versioning range. Can\'t match against dependency version');
    } else if (installed && (!installedVersion || !semver.satisfies(installedVersion, targetVersion))) {
      errors.push(dependency + ': Invalid version, expected a ' + targetVersion);
    }
  }

  return { errors, warnings };
}
