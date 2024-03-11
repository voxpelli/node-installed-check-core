import { checkEngineVersions } from './check-engine-versions.js';
import { checkPackageVersions } from './check-package-versions.js';

/**
 * @throws {Error}
 * @param {import('read-pkg').NormalizedPackageJson} mainPackage
 * @param {Map<string, import('list-installed').NormalizedPackageJson>} installedDependencies
 * @param {Omit<import('./installed-check.js').InstalledCheckOptions, 'path'>} options
 * @returns {Promise<import('./installed-check.js').InstalledCheckResult>}
 */
export async function performInstalledChecks (mainPackage, installedDependencies, options) {
  if (!mainPackage) throw new TypeError('Expected mainPackage to be set');
  if (!installedDependencies) throw new TypeError('Expected installedDependencies to be set');
  if (!options) throw new TypeError('Expected options to be set');

  const {
    engineCheck = false,
    engineIgnores = [],
    engineNoDev = false,
    strict = false,
    versionCheck = false,
  } = options;

  if (!engineCheck && !versionCheck) {
    throw new Error('Expected to run at least one check. Add engineCheck and/or versionCheck');
  }

  /** @type {string[]} */
  let errors = [];
  /** @type {string[]} */
  let warnings = [];

  const results = [
    versionCheck && checkPackageVersions(mainPackage, installedDependencies),
    engineCheck && checkEngineVersions(
      mainPackage,
      installedDependencies,
      {
        noDev: engineNoDev,
        ignore: engineIgnores,
        strict,
      }
    ),
  ];

  for (const result of results) {
    if (result) {
      errors = [...errors, ...result.errors];
      warnings = [...warnings, ...result.warnings];
    }
  }

  return { errors, warnings };
}
