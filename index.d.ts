export type * from './lib/lookup-types.d.ts';

export type { VersionRangeItem, VersionRangeOptions, VersionRangeResult, VersionRangesOptions } from './lib/check-version-range.js';
export type { LookupOptions } from './lib/installed-check.js';
export type { InstalledChecks, InstalledCheckOptions, InstalledCheckResult } from './lib/perform-installed-check.js';

export { checkVersionRange, checkVersionRangeCollection } from './lib/check-version-range.js';
export { installedCheck } from './lib/installed-check.js';
export { performInstalledCheck } from './lib/perform-installed-check.js';
