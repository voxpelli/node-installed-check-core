<div align="center">
  <img
    src="installed-check-core.svg"
    width="650"
    height="auto"
    alt="installed-check-core"
  />
</div>

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

const { errors } = await installedCheck(['version']);

if (result.errors.length) {
  console.error('Dependency errors: \n\n' + result.errors.join('\n') + '\n');
}
```

### In CommonJS using dynamic [`import()`](https://nodejs.org/api/esm.html#import-expressions) expression

```javascript
const { installedCheck } = await import('installed-check-core');
```

## API

### checkVersionRange()

The rich version range check that `installed-check` itself uses.

#### Syntax

```ts
checkVersionRange(mainPackage, key, installedDependencies, [options]) => VersionRangeResult
```

#### Arguments

* `mainPackage`: Type `PackageJsonLike` – the content of the `package.json` file to check, see [`getInstalledData()`](#getinstalleddata)
* `key`: Type `string` – the key of the version range to check, eg `engines.node`
* `installedDependencies`: Type `InstalledDependencies` – the installed dependencies to use when checking, see [`getInstalledData()`](#getinstalleddata)
* `options`: Type `VersionRangeOptions` – optional options

#### Types

```ts
type VersionRangeItem = {
  valid: boolean|undefined,
  suggested?: string|undefined,
  note: string|undefined,
}
type VersionRangeResult = VersionRangeItem & {
  packageNotes: Array<
    VersionRangeItem & { name: string }
  >
}
```

#### Options

 * `expectedInDependencies = false` – a warning will be issued when the key is empty or not found in a dependency
 * `noDev = false` – dev dependencies won't be included in the check
 * `ignore = string[]|((test: string) => boolean)` – names of modules to exclude from checks or a function that returns `true` for those that should be ignores (the latter handy for supporting eg. glob patterns)
 * `strict = false` – converts most warnings into failures.

#### Example

```javascript
import { checkVersionRange, getInstalledData } from 'installed-check-core';

const { installedDependencies, mainPackage } = await getInstalledData(path);

const result = await checkVersionRange(
  mainPackage,
  'engines.node',
  installedDependencies,
  {
    expectedInDependencies: true,
    noDev: true,
    ignore: ['example'],
    strict: true,
  }
);

for (const item of result.packageNotes) {
  if (item.note) {
    console.log(`${item.valid === false ? 'Error' : 'Warning'} in ${item.name}: ${item.note}`);
  }
}

if (result.note) {
  console.log(`${result.valid === false ? 'Error' : 'Warning'}: ${result.note}`);
}

if (result.valid === true) {
  console.log('All good!');
} else if (result.suggested) {
  console.log('Combined engines.node needs to be narrower:', result.suggested);
} else {
  console.log('Incompatible combined engines.node requirements.');
}
```

### getInstalledData()

Companion method to eg. `checkVersionRange()` that which makes it easy to get the correct data required. Not meant for any other use.

Is a simple wrapper around [`read-pkg`](https://github.com/sindresorhus/read-pkg) and [`list-installed`](https://github.com/voxpelli/list-installed) – those or similar modules can be used directly just as well.

#### Syntax

```ts
getInstalledData(path = '.') => Promise<InstalledData>
```

#### Arguments

* `path` – specifies the path to the package to be checked, with its `package.json` expected to be there and its installed `node_modules` as well.

#### Types

```ts
// Subset of import('type-fest').PackageJson / import('read-pkg').NormalizedPackageJson
export type PackageJsonLike = {
  name?:    string | undefined;
  version?: string | undefined;
  engines?:              Record<string, string | undefined>;
  dependencies?:         Record<string, string | undefined>;
  devDependencies?:      Record<string, string | undefined>;
  optionalDependencies?: Record<string, string | undefined>;
  peerDependencies?:     Record<string, string | undefined>;
};

// A map is allowed since that's what import('list-installed).listInstalled returns
export type InstalledDependencies = Map<string, PackageJsonLike> | Record<string, PackageJsonLike>;
```

#### Example

See example of [`checkVersionRange()`](#checkversionrange)

### installedCheck()

The full on `installed-check` experience, returning error and warning strings only.

#### Syntax

```ts
installedCheck(checks, options) => Promise<InstalledCheckResult>
```

#### Arguments

* `checks`: Type `('engine' | 'version')[]` – the checks to run
* `options`: Type `InstalledCheckOptions`

#### Types

```ts
type InstalledCheckResult = { errors: string[], warnings: string[] }
```

#### Checks

* `engine` – will check that the installed modules comply with the [engines requirements](https://docs.npmjs.com/files/package.json#engines) of the `package.json` and suggest an alternative requirement if the installed modules don't comply.
* `version` – will check that the installed modules comply with the version requirements set for them the `package.json`.

#### Options

* `path = '.'` – specifies the path to the package to be checked, with its `package.json` expected to be there and its installed `node_modules` as well.
* `ignores = string[]` – names of modules to exclude from checks. Supports [`picomatch`](https://www.npmjs.com/package/picomatch) globbing syntax, eg. `@types/*`. (Not supported by `version` checks)
* `noDev = false` – exclude dev dependencies from checks (Not supported by `version` checks)
* `strict = false` – converts most warnings into failures

#### Example

```javascript
import { installedCheck } from 'installed-check-core';

const { errors, warnings } = await installedCheck(['engine', 'version'], {
  path: 'path/to/module',
  ignore: ['foo'],
  noDev: true,
});
```

### performInstalledCheck()

Same as [`installedCheck()`](#installedcheck) but without looking up any data on its own but instead expects the data from [`getInstalledData()`](#getinstalleddata) or similar to be given to it.

#### Syntax

```ts
performInstalledCheck(checks, mainPackage, installedDependencies, options) => Promise<InstalledCheckResult>
```

#### Arguments

* `checks`: Type `('engine' | 'version')[]` – same as for [`installedCheck()`](#installedcheck)
* `mainPackage`: Type `PackageJsonLike` – the content of the `package.json` file to check, see [`getInstalledData()`](#getinstalleddata)
* `installedDependencies`: Type `InstalledDependencies` – the installed dependencies to use when checking, see [`getInstalledData()`](#getinstalleddata)
* `options`: Type `InstalledCheckOptions` – same as for [`installedCheck()`](#installedcheck), but without the `path` option

## Used by

* Used by the [`installed-check`](https://github.com/voxpelli/node-installed-check) CLI tool
  * ...and eg. pretty much all of my ([@voxpelli](https://github.com/voxpelli)'s) node.js projects uses the `installed-check` CLI tool
* Find more on [GitHub](https://github.com/voxpelli/node-installed-check-core/network/dependents) or [npm](https://www.npmjs.com/package/installed-check-core?activeTab=dependents)

## Similar modules

* [`knip`](https://github.com/webpro/knip) – finds unused files, dependencies and exports in your JavaScript and TypeScript projects – a great companion module to `installed-check`
