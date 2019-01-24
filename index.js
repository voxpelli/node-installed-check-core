'use strict';

const { promisify } = require('util');

const readJson = promisify(require('read-package-json'));
const readInstalled = promisify(require('read-installed'));

const checkPackageVersions = require('./lib/check-package-versions');
const checkEngineVersions = require('./lib/check-engine-versions');

const installedCheck = async function (path = '.', options = {}) {
  if (typeof path === 'object') {
    return installedCheck(undefined, path);
  }

  const {
    engineCheck,
    engineIgnores,
    engineNoDev,
    noVersionCheck
  } = options;

  const [
    mainPackage,
    { dependencies: installedDependencies }
  ] = await Promise.all([
    readJson(path + '/package.json'),
    readInstalled(path, { dev: true, depth: 1 })
  ]);

  const requiredDependencies = Object.assign({}, mainPackage.dependencies, mainPackage.devDependencies);
  const optionalDependencies = Object.assign({}, mainPackage.optionalDependencies);

  let errors = [];
  let warnings = [];
  let notices = [];

  if (!noVersionCheck) {
    const packageResult = checkPackageVersions(requiredDependencies, installedDependencies, optionalDependencies);

    errors = errors.concat(packageResult.errors);
    notices = notices.concat(packageResult.notices);
  }

  if (engineCheck) {
    const dependencies = Object.assign({}, engineNoDev ? mainPackage.dependencies : requiredDependencies);

    (engineIgnores || []).forEach(name => {
      delete dependencies[name];
    });

    const engineResult = checkEngineVersions(
      mainPackage.engines || {},
      dependencies,
      installedDependencies
    );

    errors = errors.concat(engineResult.errors);
    warnings = warnings.concat(engineResult.warnings);
    notices = notices.concat(engineResult.notices);
  }

  return { errors, warnings, notices };
};

module.exports = installedCheck;
