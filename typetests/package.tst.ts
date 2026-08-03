import { describe, expect, it } from 'tstyche';

import type { NormalizedPackageJson as ListInstalledNormalizedPackageJson } from 'list-installed';
import type { NormalizedPackageJson, PackageJson } from 'read-pkg';

import type { InstalledDependencies, PackageJsonLike } from '../index.js';

describe('PackageJsonLike', () => {
  it('should accept NormalizedPackageJson', () => {
    expect({} as NormalizedPackageJson).type.toBeAssignableTo<PackageJsonLike>();
  });

  it('should accept ListInstalledNormalizedPackageJson', () => {
    expect({} as ListInstalledNormalizedPackageJson).type.toBeAssignableTo<PackageJsonLike>();
  });

  it('should accept PackageJson', () => {
    expect({} as PackageJson).type.toBeAssignableTo<PackageJsonLike>();
  });

  it('should accept empty object', () => {
    expect({}).type.toBeAssignableTo<PackageJsonLike>();
  });

  it('should accept object', () => {
    expect({} as object).type.toBeAssignableTo<PackageJsonLike>();
  });

  it('should accept Record<string, any>', () => {
    expect({} as Record<string, any>).type.toBeAssignableTo<PackageJsonLike>();
  });

  it('should accept Record<string, unknown>', () => {
    expect({} as Record<string, unknown>).type.toBeAssignableTo<PackageJsonLike>();
  });

  it('should not accept { name: true }', () => {
    expect({ name: true }).type.not.toBeAssignableTo<PackageJsonLike>();
  });

  it('should not accept Date', () => {
    expect(new Date()).type.not.toBeAssignableTo<PackageJsonLike>();
  });

  it('should not accept array', () => {
    expect([]).type.not.toBeAssignableTo<PackageJsonLike>();
  });

  it('should not accept null', () => {
    // eslint-disable-next-line unicorn/no-null
    expect(null).type.not.toBeAssignableTo<PackageJsonLike>();
  });
});

describe('InstalledDependencies', () => {
  it('should accept Map<string, ListInstalledNormalizedPackageJson>', () => {
    const installed: Map<string, ListInstalledNormalizedPackageJson> = new Map();
    expect(installed).type.toBeAssignableTo<InstalledDependencies>();
  });
});

describe('NormalizedPackageJson', () => {
  it('should accept ListInstalledNormalizedPackageJson', () => {
    expect({} as ListInstalledNormalizedPackageJson).type.toBeAssignableTo<NormalizedPackageJson>();
  });
});
