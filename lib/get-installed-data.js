import { listInstalled } from 'list-installed';
import { ErrorWithCause } from 'pony-cause';
import { readPackage } from 'read-pkg';

/** @typedef {import('read-pkg').NormalizedPackageJson} NormalizedPackageJson */
/** @typedef {Map<string, NormalizedPackageJson>} InstalledDependencies */

/**
 * @typedef InstalledData
 * @property {InstalledDependencies} installedDependencies
 * @property {NormalizedPackageJson} mainPackage
 */

/**
 * @throws {Error}
 * @param {string} [path] Specifies the path to the package to be checked, with its `package.json` expected to be there and its installed `node_modules` as well
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
