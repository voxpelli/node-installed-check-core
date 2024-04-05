# Changelog

## [8.3.0](https://github.com/voxpelli/node-installed-check-core/compare/v8.2.3...v8.3.0) (2024-04-05)


### Features

* add a `fix` option for autofixing ([#134](https://github.com/voxpelli/node-installed-check-core/issues/134)) ([5f0ab6c](https://github.com/voxpelli/node-installed-check-core/commit/5f0ab6c8ade1f77f7784e7fc5b13b50e609cbfbf))

## [8.2.3](https://github.com/voxpelli/node-installed-check-core/compare/v8.2.2...v8.2.3) (2024-04-05)


### Bug Fixes

* update to `list-installed@5.3.0` ([6791ba5](https://github.com/voxpelli/node-installed-check-core/commit/6791ba5cb1c69cadfeaf7f6442f59293dc5e97da))

## [8.2.2](https://github.com/voxpelli/node-installed-check-core/compare/v8.2.1...v8.2.2) (2024-04-04)


### Bug Fixes

* handle pnpm `workspace:` version range ([01ff126](https://github.com/voxpelli/node-installed-check-core/commit/01ff126a26e9b2e271195730b68eccdc1cea8dbe))
* ignore `@types/*` packages in engine check ([f87823e](https://github.com/voxpelli/node-installed-check-core/commit/f87823e05788e6eebb67d888456582c669ee9d70))
* latest `list-installed`, supports symlinks ([3c432bf](https://github.com/voxpelli/node-installed-check-core/commit/3c432bf5353ed64c0e4439cb58aca0e5da9aa1e7))

## [8.2.1](https://github.com/voxpelli/node-installed-check-core/compare/v8.2.0...v8.2.1) (2024-04-04)


### Bug Fixes

* export `ROOT` and the `WorkspaceSuccess` type ([2dd8c39](https://github.com/voxpelli/node-installed-check-core/commit/2dd8c39b76efbe394a4160f6816500e98a33085f))

## [8.2.0](https://github.com/voxpelli/node-installed-check-core/compare/v8.1.0...v8.2.0) (2024-04-04)


### Features

* return workspace success status ([#127](https://github.com/voxpelli/node-installed-check-core/issues/127)) ([9950e8a](https://github.com/voxpelli/node-installed-check-core/commit/9950e8ab1ac6a06e5b938aaf1095fa802f496e35))
* use latest `list-installed` to support pnpm ([5dde95a](https://github.com/voxpelli/node-installed-check-core/commit/5dde95ab976fb5aa2204ca810c46330f74d72c4b))

## [8.1.0](https://github.com/voxpelli/node-installed-check-core/compare/v8.0.3...v8.1.0) (2024-03-22)


### Features

* return `suggestions` separate from `errors` ([1723b7b](https://github.com/voxpelli/node-installed-check-core/commit/1723b7be1d165a1bc9865454ddac45115392ccf9))

## [8.0.3](https://github.com/voxpelli/node-installed-check-core/compare/v8.0.2...v8.0.3) (2024-03-22)


### Bug Fixes

* ensure use of latest `list-installed` ([76439fc](https://github.com/voxpelli/node-installed-check-core/commit/76439fcf6cc953a1a30a3b0d3efa8a6e94b8b38a))

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
