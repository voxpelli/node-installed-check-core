// @ts-check
/// <reference types="node" />

'use strict';

const { readdir } = require('fs').promises;
const pathModule = require('path');

const readPkg = require('read-pkg');

/**
 * @param {string} cwd
 * @param {boolean} [includeScoped]
 * @returns {AsyncGenerator<string>}
 */
const readdirScoped = async function * (cwd, includeScoped = true) {
  for (const file of await readdir(cwd, { withFileTypes: true })) {
    if (!file.isDirectory()) continue;

    const dirPath = pathModule.join(cwd, file.name);

    if (includeScoped && file.name.startsWith('@')) {
      yield * readdirScoped(dirPath, false);
    } else {
      yield dirPath;
    }
  }
};

/**
 * @param {AsyncGenerator<string>|string[]} packageDirs
 * @returns {AsyncGenerator<import('type-fest').PackageJson>}
 */
const readPackages = async function * (packageDirs) {
  for await (const dirPath of packageDirs) {
    yield readPkg({ cwd: dirPath });
  }
};

/**
 * @param {string} cwd
 * @returns {AsyncGenerator<import('type-fest').PackageJson>}
 */
const generateInstalledList = async function * (cwd) {
  yield * readPackages(readdirScoped(cwd));
};

/**
 * @param {string} cwd
 * @returns {Promise<Map<string, import('type-fest').PackageJson>>}
 */
const listInstalled = async (cwd) => {
  /** @type {Map<string, import('type-fest').PackageJson>} */
  const pkgs = new Map();

  for await (const pkg of generateInstalledList(cwd)) {
    if (pkg.name) pkgs.set(pkg.name, pkg);
  }

  return pkgs;
};

module.exports = {
  generateInstalledList,
  listInstalled,
};
