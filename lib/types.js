'use strict';

/** @typedef {{ [engineName: string]: string }} PackageEngines */
/** @typedef {{ [moduleName: string]: string }} DependencyList */
/**
 * @typedef PackageJson
 * @property {PackageEngines} [engines]
 * @property {DependencyList} [dependencies]
 * @property {DependencyList} [devDependencies]
 * @property {DependencyList} [optionalDependencies]
 * @property {string} [version]
 */

module.exports = {};
