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
[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-7fffff?style=flat&labelColor=ff80ff)](https://github.com/neostandard/neostandard)
[![Follow @voxpelli@mastodon.social](https://img.shields.io/mastodon/follow/109247025527949675?domain=https%3A%2F%2Fmastodon.social&style=social)](https://mastodon.social/@voxpelli)

Exists as a CLI as well: [installed-check](https://www.npmjs.com/package/installed-check)

## Usage

```javascript
import { installedCheck } from 'installed-check-core';

const { errors, suggestions } = await installedCheck(['version']);

if (result.errors.length) {
  console.error('Dependency errors: \n\n' + result.errors.join('\n') + '\n');
}
if (result.suggestions.length) {
  console.error('Suggestions: \n\n' + result.suggestions.join('\n') + '\n');
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
checkVersionRange(pkg, key, installed, [options]) => VersionRangeResult
```

#### Arguments

* `pkg`: Type [`PackageJsonLike`](#packagejsonlike) – the content of the `package.json` file to check
* `key`: Type `string` – the key of the version range to check, eg `engines.node`
* `installed`: Type [`InstalledDependencies`](#installeddependencies) – the `package.json` files of the installed dependencies
* `options`: Type `VersionRangeOptions` – optional options

#### Types

```ts
type VersionRangeItem = {
  valid: boolean | undefined,
  suggested?: string | undefined,
  note: string | undefined,
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
import { checkVersionRange } from 'installed-check-core';
import { listInstalled } from 'list-installed';
import { readPackage } from 'read-pkg';

const cwd = '.';

const [pkg, installed] = await Promise.all([
  readPackage({ cwd }),
  listInstalled(cwd),
]);

const result = await checkVersionRange(
  pkg,
  'engines.node',
  installed,
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

### checkVersionRangeCollection()


Wrapper around as [`checkVersionRange()`](#checkversionrange) that differs from it in three ways:

* `key` is for a collection of range, eg `engines` rather than `engines.node`
* The results for every individual version range is returned in an `object` keyed with the full key for that range, eg: `{ 'engines.node': ... }`
* Accepts an additional optional `defaultKeys` option that's used if the collection for `key` is empty. Eg: `{ defaultKeys: ['node'] }`

#### Syntax

```ts
checkVersionRangeCollection(pkg, key, installed, [options]) => VersionRangeCollectionResult
```

#### Arguments

See main description of [`checkVersionRangeCollection()`](#checkversionrangecollection) and full docs for [`checkVersionRange()`](#checkversionrange).

### installedCheck()

The full on `installed-check` experience, returning error and warning strings only.

#### Syntax

```ts
installedCheck(checks, [lookupOptions], [options]) => Promise<InstalledCheckResult>
```

#### Arguments

* `checks`: Type `InstalledChecks[]` – the checks to run, an array of one or more of: `'engine'`, `'peer'`, `'version'`
* `lookupOptions`: Type `LookupOptions` – optional – defaults to `cwd='.'` and `includeWorkspaceRoot: true`
* `options`: Type `InstalledCheckOptions` – optional

#### Types

```ts
type LookupOptions = {
  cwd?: string | undefined;
  ignorePaths?: string[] | undefined;
  includeWorkspaceRoot?: boolean | undefined;
  skipWorkspaces?: boolean | undefined;
  workspace?: string[] | undefined;
};
type InstalledChecks = 'engine' | 'peer' | 'version'
type InstalledCheckOptions = {
  fix?: boolean | undefined;
  ignore?: string[] | undefined;
  noDev?: boolean | undefined;
  prefix?: string | undefined;
  strict?: boolean | undefined;
};
type InstalledCheckResult = {
  errors: string[],
  warnings: string[],
  suggestions: string[],
}
```

#### Checks

* `engine` – will check that the installed modules comply with the [engines requirements](https://docs.npmjs.com/files/package.json#engines) of the `package.json` and suggest an alternative requirement if the installed modules don't comply.
* `peer` – like `engine` but for `peerDependencies` instead. Will check that the promised `peerDependencies` are not wider than those of ones required dependencies.
* `version` – will check that the installed modules comply with the version requirements set for them the `package.json`.

#### Lookup options

The same as from [`read-workspaces`](https://github.com/voxpelli/read-workspaces?tab=readme-ov-file#readworkspacesoptions) / [`list-installed`](https://github.com/voxpelli/list-installed?tab=readme-ov-file#workspacelookupoptions)

#### Options

* `fix = false` – when set it will modify the `package.json` files to apply fixes whenever possible
* `ignores = string[]` – names of modules to exclude from checks. Supports [`picomatch`](https://www.npmjs.com/package/picomatch) globbing syntax, eg. `@types/*`. (Not supported by `version` checks)
* `noDev = false` – exclude `devDependencies` from checks. `devDependencies` that are also in `peerDependencies` will not be ignored. (Not supported by `version` checks)
* `strict = false` – converts most warnings into failures

#### Example

```javascript
import { installedCheck } from 'installed-check-core';

const { errors, warnings, suggestions } = await installedCheck(['engine', 'version'], {
  cwd: 'path/to/module',
  ignore: ['foo'],
  noDev: true,
});
```

### performInstalledCheck()

Similar to [`installedCheck()`](#installedcheck) but expects to be given package data instead of looking it up itself..

#### Syntax

```ts
performInstalledCheck(checks, pkg, installed, options) => Promise<PerformInstalledCheckResult>
```

#### Arguments

* `checks`: Type `InstalledChecks[]` – same as for [`installedCheck()`](#installedcheck)
* `pkg`: Type [`PackageJsonLike`](#packagejsonlike) – the content of the `package.json` file to check
* `installed`: Type [`InstalledDependencies`](#installeddependencies) – the `package.json` files of the installed dependencies
* `options`: Type `InstalledCheckOptions` – same as for [`installedCheck()`](#installedcheck), but without the `cwd` option

## Types

### PackageJsonLike

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
```

### InstalledDependencies

```ts
// A map is allowed since that's what import('list-installed).listInstalled returns
export type InstalledDependencies = Map<string, PackageJsonLike> | Record<string, PackageJsonLike>;
```

## Used by

* Used by the [`installed-check`](https://github.com/voxpelli/node-installed-check) CLI tool
  * ...and eg. pretty much all of my ([@voxpelli](https://github.com/voxpelli)'s) node.js projects uses the `installed-check` CLI tool
* Find more on [GitHub](https://github.com/voxpelli/node-installed-check-core/network/dependents) or [npm](https://www.npmjs.com/package/installed-check-core?activeTab=dependents)

## Similar modules

* [`knip`](https://github.com/webpro/knip) – finds unused files, dependencies and exports in your JavaScript and TypeScript projects – a great companion module to `installed-check`
