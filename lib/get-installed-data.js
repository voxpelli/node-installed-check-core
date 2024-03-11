import { listInstalled } from 'list-installed';
import { ErrorWithCause } from 'pony-cause';
import { readPackage } from 'read-pkg';

/**
 * @typedef InstalledData
 * @property {Map<string, import('list-installed').NormalizedPackageJson>} installedDependencies
 * @property {import('read-pkg').NormalizedPackageJson} mainPackage
 */

/**
 * @throws {Error}
 * @param {string} [path]
 * @returns {Promise<InstalledData>}
 */
export async function getInstalledData (path = '.') {
  const [
    mainPackage,
    installedDependencies,
  ] = await Promise.all([
    readPackage({ cwd: path }).catch(/** @param {Error} err */ err => {
      throw new ErrorWithCause('Failed to read package.json', { cause: err });
    }),
    listInstalled(path).catch(/** @param {Error} err */ err => {
      throw new ErrorWithCause('Failed to list installed modules', { cause: err });
    }),
  ]);

  return {
    installedDependencies,
    mainPackage,
  };
}
