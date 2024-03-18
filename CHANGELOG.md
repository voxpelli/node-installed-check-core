# Changelog

## [8.0.0](https://github.com/voxpelli/node-installed-check-core/compare/v7.1.4...v8.0.0) (2024-03-18)


### ⚠ BREAKING CHANGES

* support checking workspaces
* rename `path` to `cwd` in options
* require Node.js 18

### Features

* `checkVersionRange()` / `getInstalledData()` ([9c5ec35](https://github.com/voxpelli/node-installed-check-core/commit/9c5ec357d520d17e6c5c81c50ee0fa2a74bb7e9d))
* `performInstalledCheck()` ([c437f90](https://github.com/voxpelli/node-installed-check-core/commit/c437f9035329ca9531bbe3c7c243cc985fa17235))
* more granular `strict` checks ([149eabd](https://github.com/voxpelli/node-installed-check-core/commit/149eabdc15d51b1cd077f7918b587d85c3cf8ffa))
* support checking workspaces ([c80424f](https://github.com/voxpelli/node-installed-check-core/commit/c80424ffd81efd515382c10705f0848154c44005))
* support globs in ignore names ([95e41fe](https://github.com/voxpelli/node-installed-check-core/commit/95e41fe3fbba3cb1d160d6e3af706e88c91a26cf))
* validate peer dependency ranges ([#117](https://github.com/voxpelli/node-installed-check-core/issues/117)) ([9d3e67f](https://github.com/voxpelli/node-installed-check-core/commit/9d3e67f4c758e7c9751ec8b046e22408da54c802)), closes [#115](https://github.com/voxpelli/node-installed-check-core/issues/115)


### Bug Fixes

* accept different ways of writing a range ([211018c](https://github.com/voxpelli/node-installed-check-core/commit/211018c72be0e6b982cfa98a6167bb6c58768b94)), closes [#18](https://github.com/voxpelli/node-installed-check-core/issues/18)
* allow `InstalledDependencies` to be an object ([018ed1f](https://github.com/voxpelli/node-installed-check-core/commit/018ed1f4e663556d832d38acfe2640863780571b))
* don't ignore types from direct dependencies ([fe03536](https://github.com/voxpelli/node-installed-check-core/commit/fe0353644e5867579dcc9758852887b5818efe5f))
* dropping unused `notice` keys ([28f68dc](https://github.com/voxpelli/node-installed-check-core/commit/28f68dc6b6b9dd54db5cecc644d4151cfc9db944))
* use simpler `PackageJsonLike` reference type ([9631974](https://github.com/voxpelli/node-installed-check-core/commit/963197410df3024f9d9df90a431abe0c0a9a655b))


### Miscellaneous Chores

* require Node.js 18 ([c39fd6e](https://github.com/voxpelli/node-installed-check-core/commit/c39fd6e021d023ce287b9ebcba5e88dc62900957))


### Code Refactoring

* rename `path` to `cwd` in options ([76a1346](https://github.com/voxpelli/node-installed-check-core/commit/76a13469e4a32de8679d3cbe4948cb9075c64d7e))
