# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 5.0.0 - 2021-11-14

All changes from previous pre-releases:

* **Breaking change:** Now requires Node.js version matching `^12.20.0 || ^14.13.1 || >=16.0.0`, to ensure compatibility with ESM-based dependencies
* **Possibly breaking change:** The engine checks are now driven by `@voxpelli/semver-set` version `3.x`, which is rewritten from scratch, only keeping the tests and the exported API from before. This to fix the license of the project as the author of the original project never assigned a license to his code + it fixed a bug in the process.
* **Possibly breaking change:** As a result of new tests for edge cases, some alterations was made to what was warnings or notices as well as when errors was thrown. Thanks to tests this can now be guaranteed over time
* **Improvement:** Swap non-standard [`VError`](https://github.com/joyent/node-verror) for [`pony-cause` pony-fill](https://github.com/voxpelli/pony-cause#errorwithcause-creating-an-error-with-a-cause) of [standard Error Causes](https://v8.dev/features/error-cause)
* **Stability:** Added tests to ensure consistent functionality over time as well as in edge cases
* Lots of dependency updates and some test hardening

## 5.0.0-2 - 2021-10-21

* **Improvement:** Swap non-standard [`VError`](https://github.com/joyent/node-verror) for [`pony-cause` pony-fill](https://github.com/voxpelli/pony-cause#errorwithcause-creating-an-error-with-a-cause) of [standard Error Causes](https://v8.dev/features/error-cause)

## 5.0.0-1 - 2021-10-19

* **Breaking change:** Now requires Node.js version matching `^12.20.0 || ^14.13.1 || >=16.0.0`, to ensure compatibility with ESM-based dependencies
* Lots of dependency updates and some test hardening

## 5.0.0-0 - 2021-03-11

* **Possibly breaking change:** The engine checks are now driven by `@voxpelli/semver-set` version `3.x`, which is rewritten from scratch, only keeping the tests and the exported API from before. This to fix the license of the project as the author of the original project never assigned a license to his code + it fixed a bug in the process.
* **Possibly breaking change:** As a result of new tests for edge cases, some alterations was made to what was warnings or notices as well as when errors was thrown. Thanks to tests this can now be guaranteed over time
* **Stability:** Added tests to ensure consistent functionality over time as well as in edge cases

## 4.0.0 - 2020-10-21

* **Breaking change:** Now requires at least Node.js 12.x (somewhat following the LTS of Node.js itself)
* **Dependencies**: Moved to newer [`@voxpelli/semver-set`](https://www.npmjs.com/package/@voxpelli/semver-set) module, which has fewer sub-dependencies and is now typed
* **Dependencies**: Created new [`list-installed`](https://www.npmjs.com/package/list-installed) module, replacing [`read-installed`](https://www.npmjs.com/package/read-installed) in this module, making it natively async as well as adds types
* **Dependencies**: Moved to [`read-pkg`](https://www.npmjs.com/package/read-pkg) instead of [`read-package-json`](https://www.npmjs.com/package/read-package-json), making it natively async as well as adds types


## 3.0.0 - 2019-08-09

* **Breaking change:** Now requires at least Node.js 10.x (somewhat following the LTS of Node.js itself)

## 3.0.0-0 - 2019-01-24

* **Breaking change:** Now requires at least Node.js 8.x (somewhat following the LTS of Node.js itself)
* **Breaking change:** Does not default to do version checking anymore. Requires new `versionCheck` parameter to do that.
* **Breaking change:** Only takes a single argument now. `path` is moved to a key on that `options` object.
* **Feature**: Split this core module out of the CLI module

## 2.2.0 - 2018-07-26

* **Feature**: New `engineIgnores` / `--engine-ignore` / `-i` option enables one to exclude one or more modules from the engine check
* **Feature**: New `noVersionCheck` / `--no-version-check` / `-n` option enables one to only use the engine check and skip the check of the versions installed
* **Dependencies**: Updated [`@voxpelli/semver-set`](https://www.npmjs.com/package/@voxpelli/semver-set) module to fix some bugs

## 2.1.2 - 2017-11-07

* **Dependencies**: Moved to published [`@voxpelli/semver-set`](https://www.npmjs.com/package/@voxpelli/semver-set) module, fixes some errenous version checks

## 2.1.1 - 2016-11-06

* Widen version range, support Node 4

## 2.1.0 - 2016-07-10

### Added
- New `engineNoDev` / `--engine-no-dev` / `-d` option that will exclude dev dependencies from the `engines` requirements check. Eg. makes it possible to use this module while still supporting a node version that isn't compatible with `>=5.0.0`.

### Fixed
- Removed empty line that would be printed on a successful run in non-verbose mode when there were hidden warnings or notices.

## 2.0.0 - 2016-07-05

### Added
- New `engineCheck` / `--engine-check` / `-e` option that will add validation of the installed dependencies `engines` requirements against the the `engines` requirement of the tested module

### Changed
- Improved the CLI tool to expose all options, include a help feature and provide improved presentation of errors
- Changed the format of the data returned when calling the module programmatically.

## 1.0.0 - 2016-02-16

### Added
- Initial release
