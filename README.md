# Installed Check Core

Checks that the installed modules fulfill the requirements of `package.json`, both when it comes to the version ranges of the modules themselves and when it comes to the version range of their engine requirements.

[![npm version](https://img.shields.io/npm/v/installed-check-core.svg?style=flat)](https://www.npmjs.com/package/installed-check-core)
[![npm downloads](https://img.shields.io/npm/dm/installed-check-core.svg?style=flat)](https://www.npmjs.com/package/installed-check-core)
[![Module type: ESM](https://img.shields.io/badge/module%20type-esm-brightgreen)](https://github.com/voxpelli/badges-cjs-esm)
[![Types in JS](https://img.shields.io/badge/types_in_js-yes-brightgreen)](https://github.com/voxpelli/types-in-js)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg)](https://github.com/voxpelli/eslint-config)
[![Follow @voxpelli@mastodon.social](https://img.shields.io/mastodon/follow/109247025527949675?domain=https%3A%2F%2Fmastodon.social&style=social)](https://mastodon.social/@voxpelli)

Exists as a CLI as well: [installed-check](https://www.npmjs.com/package/installed-check)

## Usage

```javascript
import { installedCheck } from 'installed-check-core';

const { errors } = await installedCheck({ versionCheck: true });

if (result.errors.length) {
  console.error('Dependency errors: \n\n' + result.errors.join('\n') + '\n');
}
```

### In CommonJS using available [`import()`](https://nodejs.org/api/esm.html#import-expressions) expression

```javascript
const { installedCheck } = await import('installed-check-core');
```

## Syntax

```javascript
const { errors, warnings, notices } = await installedCheck({
  path: 'path/to/module',
  engineCheck: true,
  engineIgnores: ['foo'],
  engineNoDev: true,
  versionCheck: true,
});
```

### Parameters

1. `options` – optional object containing additional options for the module

### Returns

A Promise resolving to:

```javascript
{
  notices: ['123'],
  warnings: ['Abc'],
  errors: ['Xyz']
};
```

## Options

* `path` – defaults to `.`. Specifies the path to where the target to be checked can be found, with its `package.json` being there and its `node_modules` as well.
* `engineCheck` – if set `installed-check` will check that the installed modules comply with the [engines requirements](https://docs.npmjs.com/files/package.json#engines) of the `package.json` and suggest an alternative requirement if the installed modules don't comply.
* `engineIgnores` – if set then the specified module names won't be included in the engine check. `engineIgnores` should an array of module names while the CLI flags should be set once for each module name.
* `engineNoDev` – if set then dev dependencies won't be included in the engine check.
* `versionCheck` – if set `installed-check` will check that the installed modules comply with the version requirements set for them the `package.json`.
