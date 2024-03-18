export type PackageJsonLike = {
  name?: string | undefined;
  version?: string | undefined;
  engines?: Record<string, string | undefined>;
  dependencies?: Record<string, string | undefined>;
  devDependencies?: Record<string, string | undefined>;
  optionalDependencies?: Record<string, string | undefined>;
  peerDependencies?: Record<string, string | undefined>;
};

export type InstalledDependencies = Map<string, PackageJsonLike> | Record<string, PackageJsonLike>;
