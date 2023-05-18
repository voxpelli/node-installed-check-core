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
    let targetVersion = requiredDependencies[dependency];
    const installed = installedDependencies.get(dependency);
    const installedVersion = installed ? installed.version : undefined;

    if (!installed && !optionalDependencies[dependency]) {
      errors.push(dependency + ": Dependency is not installed. Can't check its version");
    }

    if (!targetVersion) {
      warnings.push(dependency + ": Target version is empty. Can't match against dependency version");
      continue;
    }

    if (targetVersion.startsWith('npm:')) {
      const [, targetPackage] = targetVersion.split(':');
      const lastIndex = targetPackage?.lastIndexOf('@');
      if (!targetPackage || lastIndex === undefined || lastIndex < 1) {
        warnings.push(dependency + ": Invalid npm alias. Can't match against dependency version");
        continue;
      }
      const name = targetPackage.slice(0, lastIndex);
      const version = targetPackage.slice(lastIndex + 1);

      if (installed && installed.name !== name) {
        errors.push(`${dependency}: Invalid name of aliased package, expected "${name}" but got "${installed.name}"`);
      }

      targetVersion = version;
    }

    if (!semver.validRange(targetVersion)) {
      warnings.push(dependency + ": Target version is not a semantic versioning range. Can't match against dependency version");
    } else if (installed && (!installedVersion || !semver.satisfies(installedVersion, targetVersion))) {
      errors.push(dependency + ': Invalid version, expected a ' + targetVersion);
    }
  }

  return { errors, warnings };
}
