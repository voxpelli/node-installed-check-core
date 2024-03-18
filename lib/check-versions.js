import { checkVersionRangeCollection } from './check-version-range.js';

/**
 * @param {import('./get-installed-data.js').PackageJsonLike} pkg
 * @param {string} key
 * @param {import('./get-installed-data.js').InstalledDependencies} installed
 * @param {import('./check-version-range.js').VersionRangesOptions} options
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function checkVersions (pkg, key, installed, options) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];
  /** @type {string[]} */
  const summaries = [];

  const rangesResult = checkVersionRangeCollection(pkg, key, installed, options);

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
