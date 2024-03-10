import { checkVersionRanges } from './check-version-ranges.js.js';

/**
 * @param {import('read-pkg').NormalizedPackageJson} mainPackage
 * @param {Map<string, import('list-installed').NormalizedPackageJson>} installedDependencies
 * @param {Omit<import('./check-version-ranges.js.js').VersionRangesOptions, 'expectedInDependencies'>} options
 * @returns {{ errors: string[], warnings: string[], notices: string[] }}
 */
export function checkEngineVersions (mainPackage, installedDependencies, options) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];
  /** @type {string[]} */
  const summaries = [];

  let engines = typeof mainPackage.engines === 'object' ? Object.keys(mainPackage.engines) : [];

  if (engines.length === 0) {
    engines = ['node'];
  }

  for (const engine of engines) {
    const key = `engines.${engine}`;
    const engineResult = checkVersionRanges(
      mainPackage,
      key,
      installedDependencies,
      {
        ...options,
        expectedInDependencies: true,
      }
    );

    for (const result of [engineResult, ...engineResult.packageNotes]) {
      if (result.note) {
        (result.valid === false ? errors : warnings).push(('name' in result ? `${result.name}: ` : '') + result.note);
      }
    }

    if (!engineResult.valid) {
      summaries.push(
        engineResult.suggested
          ? `Combined "${key}" needs to be narrower: ${engineResult.suggested}`
          : `Incompatible combined "${key}" requirements.`
      );
    }
  }

  return {
    errors: [...new Set(errors), ...summaries],
    warnings: [...new Set(warnings)],
    notices: [],
  };
}
