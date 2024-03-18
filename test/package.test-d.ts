import { expectTypeOf } from 'expect-type';

import type { NormalizedPackageJson, PackageJson } from 'read-pkg';
import type { NormalizedPackageJson as ListInstalledNormalizedPackageJson } from 'list-installed';

import type { PackageJsonLike, InstalledDependencies } from '../lib/lookup-types.d.ts';

const pkg = {} as NormalizedPackageJson;
const installed: Map<string, ListInstalledNormalizedPackageJson> = new Map();

expectTypeOf(pkg).toMatchTypeOf<PackageJsonLike>();
expectTypeOf(installed).toMatchTypeOf<InstalledDependencies>();

expectTypeOf({} as ListInstalledNormalizedPackageJson).toMatchTypeOf<PackageJsonLike>();
expectTypeOf({} as NormalizedPackageJson).toMatchTypeOf<PackageJsonLike>();
expectTypeOf({} as PackageJson).toMatchTypeOf<PackageJsonLike>();

expectTypeOf({} as ListInstalledNormalizedPackageJson).toMatchTypeOf<NormalizedPackageJson>();

expectTypeOf({}).toMatchTypeOf<PackageJsonLike>();
expectTypeOf({} as object).toMatchTypeOf<PackageJsonLike>();
expectTypeOf({} as Record<string,any>).toMatchTypeOf<PackageJsonLike>();
expectTypeOf({} as Record<string,unknown>).toMatchTypeOf<PackageJsonLike>();

// @ts-expect-error
expectTypeOf({ name: true }).toMatchTypeOf<PackageJsonLike>;
// @ts-expect-error
expectTypeOf(new Date()).toMatchTypeOf<PackageJsonLike>;
// @ts-expect-error
expectTypeOf([]).toMatchTypeOf<PackageJsonLike>;
// @ts-expect-error
expectTypeOf(null).toMatchTypeOf<PackageJsonLike>;
