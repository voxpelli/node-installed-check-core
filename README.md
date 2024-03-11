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

const { errors } = await installedCheck({ versionCheck: true });

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

* `mainPackage`: Type `NormalizedPackageJson` – the content of the `package.json` file to check
* `key`: Type `string` – the key of the version range to check, eg `engines.node`
* `installedDependencies`: Type `InstalledDependencies` – the installed dependencies to use when checking
* `options`: Type `VersionRangeOptions` – optional options

#### Types

```ts
import type { NormalizedPackageJson } from 'read-pkg'

type InstalledDependencies = Map<string, NormalizedPackageJson>

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

 * `expectedInDependencies = false` – when set a warning will be issued when the key is empty or not found in a dependency
 * `noDev = false` – if set then dev dependencies won't be included in the check
 * `ignore = string[]` – if set then the specified module names won't be included in the check.
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
import type { NormalizedPackageJson } from 'read-pkg'

type InstalledDependencies = Map<string, NormalizedPackageJson>

type InstalledData = {
  mainPackage: NormalizedPackageJson,
  installedDependencies: InstalledDependencies,
}
```

#### Example

See example of [`checkVersionRange()`](#checkversionrange)

### installedCheck()

The full on `installed-check` experience, returning error and warning strings only.

#### Syntax

```ts
installedCheck(options) => Promise<InstalledCheckResult>
```

#### Types

```ts
type InstalledCheckResult = { errors: string[], warnings: string[] }
```

#### Options

* `path = '.'` – specifies the path to the package to be checked, with its `package.json` expected to be there and its installed `node_modules` as well.
* `engineCheck = false` – if set `installed-check` will check that the installed modules comply with the [engines requirements](https://docs.npmjs.com/files/package.json#engines) of the `package.json` and suggest an alternative requirement if the installed modules don't comply.
* `engineIgnores = string[]` – if set then the specified module names won't be included in the engine check. `engineIgnores` should an array of module names while the CLI flags should be set once for each module name.
* `engineNoDev = false` – if set then dev dependencies won't be included in the engine check.
* `strict = false` – converts most warnings into failures.
* `versionCheck = false` – if set `installed-check` will check that the installed modules comply with the version requirements set for them the `package.json`.

#### Example

```javascript
import { installedCheck } from 'installed-check-core';

const { errors, warnings } = await installedCheck({
  path: 'path/to/module',
  engineCheck: true,
  engineIgnores: ['foo'],
  engineNoDev: true,
  versionCheck: true,
});
```
