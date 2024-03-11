/** @typedef {import('./lib/check-version-range.js').VersionRangeItem} VersionRangeItem */
/** @typedef {import('./lib/check-version-range.js').VersionRangeOptions} VersionRangeOptions */
/** @typedef {import('./lib/check-version-range.js').VersionRangeResult} VersionRangeResult */
/** @typedef {import('./lib/get-installed-data.js').NormalizedPackageJson} NormalizedPackageJson */
/** @typedef {import('./lib/get-installed-data.js').InstalledDependencies} InstalledDependencies */
/** @typedef {import('./lib/installed-check.js').InstalledCheckOptions} InstalledCheckOptions */
/** @typedef {import('./lib/installed-check.js').InstalledCheckResult} InstalledCheckResult */

export { checkVersionRange } from './lib/check-version-range.js';
export { getInstalledData } from './lib/get-installed-data.js';
export { installedCheck } from './lib/installed-check.js';
