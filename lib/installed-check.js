import { getInstalledData } from './get-installed-data.js';
import { performInstalledCheck } from './perform-installed-check.js';

/**
 * @typedef InstalledCheckResult
 * @property {string[]} errors
 * @property {string[]} warnings
 */

/**
 * @typedef InstalledCheckOptions
 * @property {string|undefined} [path]
 * @property {boolean|undefined} engineCheck
 * @property {string[]|undefined} [engineIgnores]
 * @property {boolean|undefined} [engineNoDev]
 * @property {boolean} [strict]
 * @property {boolean|undefined} versionCheck
 */

/**
 * @throws {Error}
 * @param {InstalledCheckOptions} options
 * @returns {Promise<InstalledCheckResult>}
 */
export async function installedCheck (options) {
  if (!options) throw new TypeError('Expected options to be set');

  const { path = '.', ...checkOptions } = options;

  const { installedDependencies, mainPackage } = await getInstalledData(path);

  return performInstalledCheck(mainPackage, installedDependencies, checkOptions);
}
