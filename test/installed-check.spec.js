import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'desm';

import { ROOT, installedCheck } from '../lib/installed-check.js';

describe('installedCheck()', () => {
  describe('basic errors', () => {
    it('should error when no options', async () => {
      // @ts-ignore
      await assert.rejects(() => installedCheck(), (err) => {
        assert.ok(err instanceof TypeError);
        assert.strictEqual(err.message, 'Expected a "checks" array, got: undefined');
        return true;
      });
    });

    it('should error when invalid options', async () => {
      await assert.rejects(
        () => installedCheck([]),
        /Expected to run at least one check\. "checks" should include at least one of: engine,/
      );
    });

    it('should error on missing package.json file', async () => {
      await assert.rejects(
        () => installedCheck(['engine', 'version'], {
          cwd: join(import.meta.url, 'fixtures/missing-package-json'),
        }),
        /Failed to read package\.json/
      );
    });

    it('should not error on missing node_modules', async () => {
      const result = await installedCheck(['engine', 'version'], {
        cwd: join(import.meta.url, 'fixtures/missing-node-modules'),
      });
      assert.deepStrictEqual(result, {
        errors: ["foo: Dependency is not installed. Can't check its version"],
        suggestions: [],
        warnings: ["foo: Dependency is not installed. Can't check its requirements"],
        workspaceSuccess: { [ROOT]: false },
      });
    });
  });

  describe('functionality', () => {
    it('should return an empty result on valid setup', async () => {
      const result = await installedCheck(['engine', 'version'], {
        cwd: join(import.meta.url, 'fixtures/valid'),
      });
      assert.deepStrictEqual(result, {
        errors: [],
        suggestions: [],
        warnings: [],
        workspaceSuccess: { [ROOT]: true },
      });
    });

    it('should return an empty result on an aliased setup', async () => {
      const result = await installedCheck(['engine', 'version'], {
        cwd: join(import.meta.url, 'fixtures/aliased'),
      });
      assert.deepStrictEqual(result, {
        errors: [],
        suggestions: [],
        warnings: [],
        workspaceSuccess: { [ROOT]: true },
      });
    });

    it('should return errors and warnings on invalid setup', async () => {
      const result = await installedCheck(['engine', 'version'], {
        cwd: join(import.meta.url, 'fixtures/invalid'),
      });
      assert.deepStrictEqual(result, {
        'errors': [
          'invalid-aliased-name: Invalid name of aliased package, expected "bar" but got "foo"',
          'invalid-aliased-version: Invalid version, expected a ^2.0.0',
          "invalid-dependency-definition: Dependency is not installed. Can't check its version",
          'invalid-module-version: Invalid version, expected a ^1.0.0',
          'invalid-engine: Narrower "engines.node" is needed: >=10.0.0',
          'invalid-engine: Narrower "engines.abc" is needed: >=1.0.0',
        ],
        suggestions: [
          'Combined "engines.node" needs to be narrower: >=10.0.0',
          'Combined "engines.abc" needs to be narrower: >=1.0.0',
        ],
        warnings: [
          "invalid-alias-syntax: Invalid npm alias. Can't match against dependency version",
          "invalid-dependency-definition: Target version is empty. Can't match against dependency version",
          "invalid-engine: Target version is not a semantic versioning range. Can't match against dependency version",
          "invalid-dependency-definition: Dependency is not installed. Can't check its requirements",
          'invalid-module-version: Missing "engines.node"',
          'Missing "engines.bar" in main package',
          'invalid-alias-syntax: Missing "engines.bar"',
          'invalid-aliased-name: Missing "engines.bar"',
          'invalid-aliased-version: Missing "engines.bar"',
          'invalid-engine: Missing "engines.bar"',
          'invalid-module-version: Missing "engines.bar"',
          'invalid-module-version: Missing "engines.abc"',
        ],
        workspaceSuccess: { [ROOT]: false },
      });
    });

    it('should check engine even when no target engines are set', async () => {
      const result = await installedCheck(['engine'], {
        cwd: join(import.meta.url, 'fixtures/missing-engines'),
      });
      assert.deepStrictEqual(result, {
        'errors': [
          'foo: Narrower "engines.node" is needed: >=8.0.0',
        ],
        suggestions: [
          'Combined "engines.node" needs to be narrower: >=8.0.0',
        ],
        warnings: [
          'Missing "engines.node" in main package',
        ],
        workspaceSuccess: { [ROOT]: false },
      });
    });

    it('should not suggest an engine configuration when engines are incompatible', async () => {
      const result = await installedCheck(['engine'], {
        cwd: join(import.meta.url, 'fixtures/incompatible-engines'),
      });
      assert.deepStrictEqual(result, {
        'errors': [
          'foo: Incompatible "engines.node" requirement: <6.0.0',
        ],
        suggestions: [
          'Incompatible combined "engines.node" requirements.',
        ],
        warnings: [],
        workspaceSuccess: { [ROOT]: false },
      });
    });

    it('should handle engine ranges', async () => {
      const result = await installedCheck(['engine'], {
        cwd: join(import.meta.url, 'fixtures/engine-ranges'),
      });
      assert.deepStrictEqual(result, {
        'errors': [],
        suggestions: [],
        warnings: [],
        workspaceSuccess: { [ROOT]: true },
      });
    });

    it('should handle ignores', async () => {
      const result = await installedCheck(
        ['engine'],
        { cwd: join(import.meta.url, 'fixtures/invalid') },
        { ignore: ['invalid-alias*', 'invalid-dependency-definition'] }
      );
      assert.deepStrictEqual(result, {
        'errors': [
          'invalid-engine: Narrower "engines.node" is needed: >=10.0.0',
          'invalid-engine: Narrower "engines.abc" is needed: >=1.0.0',
        ],
        suggestions: [
          'Combined "engines.node" needs to be narrower: >=10.0.0',
          'Combined "engines.abc" needs to be narrower: >=1.0.0',
        ],
        warnings: [
          'invalid-module-version: Missing "engines.node"',
          'Missing "engines.bar" in main package',
          'invalid-engine: Missing "engines.bar"',
          'invalid-module-version: Missing "engines.bar"',
          'invalid-module-version: Missing "engines.abc"',
        ],
        workspaceSuccess: { [ROOT]: false },
      });
    });

    it('should check peer dependencies', async () => {
      const result = await installedCheck(['peer'], {
        cwd: join(import.meta.url, 'fixtures/peer'),
      });
      assert.deepStrictEqual(result, {
        'errors': [
          'foo: Narrower "peerDependencies.bar" is needed: >=4.6.8',
        ],
        suggestions: [
          'Combined "peerDependencies.bar" needs to be narrower: >=4.6.8',
        ],
        warnings: [
        ],
        workspaceSuccess: { [ROOT]: false },
      });
    });

    it('should check workspaces', async () => {
      const result = await installedCheck(['engine'], {
        cwd: join(import.meta.url, 'fixtures/workspace'),
      });
      assert.deepStrictEqual(result, {
        'errors': [
          'root: foo: Narrower "engines.node" is needed: >=10.4.0',
          'root: bar: Narrower "engines.node" is needed: >=12.0.0',
          '@voxpelli/workspace-a: foo: Narrower "engines.node" is needed: >=10.4.0',
          '@voxpelli/workspace-a: bar: Narrower "engines.node" is needed: >=10.5.0',
          '@voxpelli/workspace-a: abc: Narrower "engines.node" is needed: >=10.8.0',
        ],
        suggestions: [
          'root: Combined "engines.node" needs to be narrower: >=12.0.0',
          '@voxpelli/workspace-a: Combined "engines.node" needs to be narrower: >=10.8.0',
        ],
        warnings: [
        ],
        workspaceSuccess: {
          [ROOT]: false,
          '@voxpelli/workspace-a': false,
        },
      });
    });

    it('should support lookup options when checking workspaces', async () => {
      const result = await installedCheck(['engine'], {
        cwd: join(import.meta.url, 'fixtures/workspace'),
        includeWorkspaceRoot: false,
      });
      assert.deepStrictEqual(result, {
        'errors': [
          '@voxpelli/workspace-a: foo: Narrower "engines.node" is needed: >=10.4.0',
          '@voxpelli/workspace-a: bar: Narrower "engines.node" is needed: >=10.5.0',
          '@voxpelli/workspace-a: abc: Narrower "engines.node" is needed: >=10.8.0',
        ],
        suggestions: [
          '@voxpelli/workspace-a: Combined "engines.node" needs to be narrower: >=10.8.0',
        ],
        warnings: [
        ],
        workspaceSuccess: {
          '@voxpelli/workspace-a': false,
        },
      });
    });
  });
});
