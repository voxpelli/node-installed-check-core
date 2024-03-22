# Changelog

## [8.0.2](https://github.com/voxpelli/node-installed-check-core/compare/v8.0.1...v8.0.2) (2024-03-22)


### Bug Fixes

* allow `undefined` in all option keys ([0734e0f](https://github.com/voxpelli/node-installed-check-core/commit/0734e0ff6b792abea029dea5309b77194c6c86f5))

## [8.0.1](https://github.com/voxpelli/node-installed-check-core/compare/v8.0.0...v8.0.1) (2024-03-18)


### Bug Fixes

* move `read-pkg` to dev dependencies ([9ddb0c0](https://github.com/voxpelli/node-installed-check-core/commit/9ddb0c079af022622f06408135b0c38afad95ed3))
* remove unused `pony-cause` dependency ([aa5b5b6](https://github.com/voxpelli/node-installed-check-core/commit/aa5b5b6005f115b359b056e060f6a8a1dbd9988a))

## [8.0.0](https://github.com/voxpelli/node-installed-check-core/compare/v7.1.4...v8.0.0) (2024-03-18)


### ⚠ BREAKING CHANGES

* require Node.js >=18.6.0
* changed arguments: `installedCheck(checks, lookupOptions, options)`

### Features

* added `checkVersionRange()` for granular responses ([9c5ec35](https://github.com/voxpelli/node-installed-check-core/commit/9c5ec357d520d17e6c5c81c50ee0fa2a74bb7e9d))
* added `checkVersionRangeCollection()` as a companion to `checkVersionRange()` ([#117](https://github.com/voxpelli/node-installed-check-core/issues/117)) ([9d3e67f](https://github.com/voxpelli/node-installed-check-core/commit/9d3e67f4c758e7c9751ec8b046e22408da54c802))
* added `performInstalledCheck()` for lookup-less checks ([c437f90](https://github.com/voxpelli/node-installed-check-core/commit/c437f9035329ca9531bbe3c7c243cc985fa17235))
* support workspaces ([#118](https://github.com/voxpelli/node-installed-check-core/issues/118)) ([c80424f](https://github.com/voxpelli/node-installed-check-core/commit/c80424ffd81efd515382c10705f0848154c44005))
* support globs when ignoring dependencies ([95e41fe](https://github.com/voxpelli/node-installed-check-core/commit/95e41fe3fbba3cb1d160d6e3af706e88c91a26cf))
* new `peer` check for checking peer dependency ranges ([#117](https://github.com/voxpelli/node-installed-check-core/issues/117)) ([9d3e67f](https://github.com/voxpelli/node-installed-check-core/commit/9d3e67f4c758e7c9751ec8b046e22408da54c802)), closes [#115](https://github.com/voxpelli/node-installed-check-core/issues/115)


### Bug Fixes

* accept more ways of writing a range ([211018c](https://github.com/voxpelli/node-installed-check-core/commit/211018c72be0e6b982cfa98a6167bb6c58768b94)), closes [#18](https://github.com/voxpelli/node-installed-check-core/issues/18)


### Code Refactoring

* rename `path` to `cwd` in options ([76a1346](https://github.com/voxpelli/node-installed-check-core/commit/76a13469e4a32de8679d3cbe4948cb9075c64d7e))
* dropping unused `notice` keys ([28f68dc](https://github.com/voxpelli/node-installed-check-core/commit/28f68dc6b6b9dd54db5cecc644d4151cfc9db944))
