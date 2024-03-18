import { getInstalledData } from './get-installed-data.js';
import { performInstalledCheck } from './perform-installed-check.js';

/**
 * @param {import('./perform-installed-check.js').InstalledChecks[]} checks
 * @param {import('./perform-installed-check.js').InstalledCheckOptions & { cwd?: string }} [options]
 * @returns {Promise<import('./perform-installed-check.js').InstalledCheckResult>}
 */
export async function installedCheck (checks, options) {
  const { cwd = '.', ...checkOptions } = options || {};

  const { installed, pkg } = await getInstalledData(cwd);

  return performInstalledCheck(checks, pkg, installed, checkOptions);
}
