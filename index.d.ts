export type * from './lib/lookup-types.d.ts';

export type { VersionRangeItem, VersionRangeOptions, VersionRangeResult, VersionRangesOptions } from './lib/check-version-range.js';
export type { LookupOptions, WorkspaceSuccess, InstalledCheckResult } from './lib/installed-check.js';
export type { InstalledChecks, InstalledCheckOptions, PerformInstalledCheckResult } from './lib/perform-installed-check.js';

export { checkVersionRange, checkVersionRangeCollection } from './lib/check-version-range.js';
export { installedCheck, ROOT } from './lib/installed-check.js';
export { performInstalledCheck } from './lib/perform-installed-check.js';
