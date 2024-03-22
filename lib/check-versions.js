import { checkVersionRangeCollection } from './check-version-range.js';

/**
 * @param {import('./lookup-types.d.ts').PackageJsonLike} pkg
 * @param {string} key
 * @param {import('./lookup-types.d.ts').InstalledDependencies} installed
 * @param {import('./check-version-range.js').VersionRangesOptions} options
 * @returns {import('./perform-installed-check.js').InstalledCheckResult}
 */
export function checkVersions (pkg, key, installed, options) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];
  /** @type {string[]} */
  const suggestions = [];

  const rangesResult = checkVersionRangeCollection(pkg, key, installed, options);

  for (const [name, rangeResult] of Object.entries(rangesResult)) {
    for (const result of [rangeResult, ...rangeResult.packageNotes]) {
      if (result.note) {
        (result.valid === false ? errors : warnings).push(('name' in result ? `${result.name}: ` : '') + result.note);
      }
    }

    if (!rangeResult.valid) {
      suggestions.push((
        rangeResult.suggested
          ? `Combined "${name}" needs to be narrower: ${rangeResult.suggested}`
          : `Incompatible combined "${name}" requirements.`
      ));
    }
  }

  return {
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
    suggestions,
  };
}
