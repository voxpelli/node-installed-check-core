import { listInstalled } from 'list-installed';
import { ErrorWithCause } from 'pony-cause';
import { readPackage } from 'read-pkg';

/**
 * @typedef PackageJsonLike
 * @property {string | undefined} [name]
 * @property {string | undefined} [version]
 * @property {Record<string, string | undefined>} [engines]
 * @property {Record<string, string | undefined>} [dependencies]
 * @property {Record<string, string | undefined>} [devDependencies]
 * @property {Record<string, string | undefined>} [optionalDependencies]
 * @property {Record<string, string | undefined>} [peerDependencies]
 */

/** @typedef {Map<string, PackageJsonLike> | Record<string, PackageJsonLike>} InstalledDependencies */

/**
 * @typedef InstalledData
 * @property {Map<string, import('list-installed').NormalizedPackageJson>} installed
 * @property {import('read-pkg').NormalizedPackageJson} pkg
 */

/**
 * @throws {Error}
 * @param {string} [cwd] Specifies the path to the package to be checked, with its `package.json` expected to be there and its installed `node_modules` as well
 * @returns {Promise<InstalledData>}
 */
export async function getInstalledData (cwd = '.') {
  const [
    pkg,
    installed,
  ] = await Promise.all([
    readPackage({ cwd }).catch(/** @param {Error} err */ err => {
      throw new ErrorWithCause('Failed to read package.json', { cause: err });
    }),
    listInstalled(cwd).catch(/** @param {Error} err */ err => {
      throw new ErrorWithCause('Failed to list installed modules', { cause: err });
    }),
  ]);

  return {
    installed,
    pkg,
  };
}
