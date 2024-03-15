import { checkVersionRangeCollection } from './check-version-range.js';

/**
 * @param {import('./get-installed-data.js').PackageJsonLike} mainPackage
 * @param {string} key
 * @param {import('./get-installed-data.js').InstalledDependencies} installedDependencies
 * @param {import('./check-version-range.js').VersionRangesOptions} options
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function checkVersions (mainPackage, key, installedDependencies, options) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];
  /** @type {string[]} */
  const summaries = [];

  const rangesResult = checkVersionRangeCollection(mainPackage, key, installedDependencies, options);

  for (const [name, rangeResult] of Object.entries(rangesResult)) {
    for (const result of [rangeResult, ...rangeResult.packageNotes]) {
      if (result.note) {
        (result.valid === false ? errors : warnings).push(('name' in result ? `${result.name}: ` : '') + result.note);
      }
    }

    if (!rangeResult.valid) {
      summaries.push((
        rangeResult.suggested
          ? `Combined "${name}" needs to be narrower: ${rangeResult.suggested}`
          : `Incompatible combined "${name}" requirements.`
      ));
    }
  }

  return {
    errors: [...new Set(errors), ...summaries],
    warnings: [...new Set(warnings)],
  };
}
