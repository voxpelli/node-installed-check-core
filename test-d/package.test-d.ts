import { expectType, expectAssignable, expectNotAssignable } from 'tsd';

import type { NormalizedPackageJson, PackageJson } from 'read-pkg';
import type { NormalizedPackageJson as ListInstalledNormalizedPackageJson } from 'list-installed';

import type { PackageJsonLike, InstalledDependencies } from '../lib/get-installed-data.js';
import { getInstalledData } from '../lib/get-installed-data.js';

const { mainPackage, installedDependencies } = await getInstalledData();

expectType<NormalizedPackageJson>(mainPackage);
expectType<Map<string, ListInstalledNormalizedPackageJson>>(installedDependencies);

expectAssignable<PackageJsonLike>(mainPackage);
expectAssignable<InstalledDependencies>(installedDependencies);

expectAssignable<PackageJsonLike>({} as ListInstalledNormalizedPackageJson);
expectAssignable<PackageJsonLike>({} as NormalizedPackageJson);
expectAssignable<PackageJsonLike>({} as PackageJson);

expectAssignable<NormalizedPackageJson>({} as ListInstalledNormalizedPackageJson);

expectAssignable<PackageJsonLike>({});
expectAssignable<PackageJsonLike>({} as object);
expectAssignable<PackageJsonLike>({} as Record<string,any>);
expectAssignable<PackageJsonLike>({} as Record<string,unknown>);

expectNotAssignable<PackageJsonLike>({ name: true });
expectNotAssignable<PackageJsonLike>(new Date());
expectNotAssignable<PackageJsonLike>([]);
expectNotAssignable<PackageJsonLike>(null);
