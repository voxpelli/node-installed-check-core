import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { join } from 'desm';

import { installedCheck } from '../lib/installed-check.js';

chai.use(chaiAsPromised);
chai.should();

describe('installedCheck()', () => {
  describe('basic errors', () => {
    it('should error when no options', async () => {
      // @ts-ignore
      await installedCheck()
        .should.be.rejectedWith(TypeError, 'Expected a "checks" array, got: undefined');
    });

    it('should error when invalid options', async () => {
      await installedCheck([])
        .should.be.rejectedWith(/Expected to run at least one check\. "checks" should include at least one of: engine,/);
    });

    it('should error on missing package.json file', async () => {
      await installedCheck(['engine', 'version'], {
        cwd: join(import.meta.url, 'fixtures/missing-package-json'),
      })
        .should.be.rejectedWith(/Failed to read package\.json/);
    });

    it('should not error on missing node_modules', async () => {
      await installedCheck(['engine', 'version'], {
        cwd: join(import.meta.url, 'fixtures/missing-node-modules'),
      })
        .should.eventually.deep.equal({
          errors: ["foo: Dependency is not installed. Can't check its version"],
          warnings: ["foo: Dependency is not installed. Can't check its requirements"],
        });
    });
  });

  describe('functionality', () => {
    it('should return an empty result on valid setup', async () => {
      await installedCheck(['engine', 'version'], {
        cwd: join(import.meta.url, 'fixtures/valid'),
      })
        .should.eventually.deep.equal({
          errors: [],
          warnings: [],
        });
    });

    it('should return an empty result on an aliased setup', async () => {
      await installedCheck(['engine', 'version'], {
        cwd: join(import.meta.url, 'fixtures/aliased'),
      })
        .should.eventually.deep.equal({
          errors: [],
          warnings: [],
        });
    });

    it('should return errors and warnings on invalid setup', async () => {
      await installedCheck(['engine', 'version'], {
        cwd: join(import.meta.url, 'fixtures/invalid'),
      })
        .should.eventually.deep.equal({
          'errors': [
            'invalid-aliased-name: Invalid name of aliased package, expected "bar" but got "foo"',
            'invalid-aliased-version: Invalid version, expected a ^2.0.0',
            "invalid-dependency-definition: Dependency is not installed. Can't check its version",
            'invalid-module-version: Invalid version, expected a ^1.0.0',
            'invalid-engine: Narrower "engines.node" is needed: >=10.0.0',
            'invalid-engine: Narrower "engines.abc" is needed: >=1.0.0',
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
        });
    });

    it('should check engine even when no target engines are set', async () => {
      await installedCheck(['engine'], {
        cwd: join(import.meta.url, 'fixtures/missing-engines'),
      })
        .should.eventually.deep.equal({
          'errors': [
            'foo: Narrower "engines.node" is needed: >=8.0.0',
            'Combined "engines.node" needs to be narrower: >=8.0.0',
          ],
          warnings: [
            'Missing "engines.node" in main package',
          ],
        });
    });

    it('should not suggest an engine configuration when engines are incompatible', async () => {
      await installedCheck(['engine'], {
        cwd: join(import.meta.url, 'fixtures/incompatible-engines'),
      })
        .should.eventually.deep.equal({
          'errors': [
            'foo: Incompatible "engines.node" requirement: <6.0.0',
            'Incompatible combined "engines.node" requirements.',
          ],
          warnings: [],
        });
    });

    it('should handle engine ranges', async () => {
      await installedCheck(['engine'], {
        cwd: join(import.meta.url, 'fixtures/engine-ranges'),
      })
        .should.eventually.deep.equal({
          'errors': [],
          warnings: [],
        });
    });

    it('should handle ignores', async () => {
      await installedCheck(
        ['engine'],
        { cwd: join(import.meta.url, 'fixtures/invalid') },
        { ignore: ['invalid-alias*', 'invalid-dependency-definition'] }
      )
        .should.eventually.deep.equal({
          'errors': [
            'invalid-engine: Narrower "engines.node" is needed: >=10.0.0',
            'invalid-engine: Narrower "engines.abc" is needed: >=1.0.0',
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
        });
    });

    it('should check peer dependencies', async () => {
      await installedCheck(['peer'], {
        cwd: join(import.meta.url, 'fixtures/peer'),
      })
        .should.eventually.deep.equal({
          'errors': [
            'foo: Narrower "peerDependencies.bar" is needed: >=4.6.8',
            'Combined "peerDependencies.bar" needs to be narrower: >=4.6.8',
          ],
          warnings: [
          ],
        });
    });

    it('should check workspaces', async () => {
      await installedCheck(['engine'], {
        cwd: join(import.meta.url, 'fixtures/workspace'),
      })
        .should.eventually.deep.equal({
          'errors': [
            'root: foo: Narrower "engines.node" is needed: >=10.4.0',
            'root: bar: Narrower "engines.node" is needed: >=12.0.0',
            'root: Combined "engines.node" needs to be narrower: >=12.0.0',
            '@voxpelli/workspace-a: foo: Narrower "engines.node" is needed: >=10.4.0',
            '@voxpelli/workspace-a: bar: Narrower "engines.node" is needed: >=10.5.0',
            '@voxpelli/workspace-a: abc: Narrower "engines.node" is needed: >=10.8.0',
            '@voxpelli/workspace-a: Combined "engines.node" needs to be narrower: >=10.8.0',
          ],
          warnings: [
          ],
        });
    });

    it('should support lookup options when checking workspaces', async () => {
      await installedCheck(['engine'], {
        cwd: join(import.meta.url, 'fixtures/workspace'),
        includeWorkspaceRoot: false,
      })
        .should.eventually.deep.equal({
          'errors': [
            '@voxpelli/workspace-a: foo: Narrower "engines.node" is needed: >=10.4.0',
            '@voxpelli/workspace-a: bar: Narrower "engines.node" is needed: >=10.5.0',
            '@voxpelli/workspace-a: abc: Narrower "engines.node" is needed: >=10.8.0',
            '@voxpelli/workspace-a: Combined "engines.node" needs to be narrower: >=10.8.0',
          ],
          warnings: [
          ],
        });
    });
  });
});
