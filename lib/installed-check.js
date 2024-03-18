import { getInstalledData } from './get-installed-data.js';
import { performInstalledCheck } from './perform-installed-check.js';

/**
 * @param {import('./perform-installed-check.js').InstalledChecks[]} checks
 * @param {import('./perform-installed-check.js').InstalledCheckOptions & { path?: string }} [options]
 * @returns {Promise<import('./perform-installed-check.js').InstalledCheckResult>}
 */
export async function installedCheck (checks, options) {
  const { path = '.', ...checkOptions } = options || {};

  const { installed, pkg } = await getInstalledData(path);

  return performInstalledCheck(checks, pkg, installed, checkOptions);
}
