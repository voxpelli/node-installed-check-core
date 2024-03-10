import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { join } from 'desm';
import { ErrorWithCause } from 'pony-cause';

import { installedCheck } from '../index.js';

chai.use(chaiAsPromised);
chai.should();

process.on('unhandledRejection', cause => {
  throw new ErrorWithCause('Unhandled rejection', { cause });
});

describe('installedCheck()', () => {
  describe('basic errors', () => {
    it('should error when no options', async () => {
      // @ts-ignore
      await installedCheck()
        .should.be.rejectedWith('Expected options to be set');
    });

    it('should error when invalid options', async () => {
      // @ts-ignore
      await installedCheck({})
        .should.be.rejectedWith('Expected to run at least one check. Add engineCheck and/or versionCheck');
    });

    it('should error on missing package.json file', async () => {
      await installedCheck({
        path: join(import.meta.url, 'fixtures/missing-package-json'),
        engineCheck: true,
        versionCheck: true,
      })
        .should.be.rejectedWith(/Failed to read package\.json/);
    });

    it('should error on inability to list installed modules', async () => {
      await installedCheck({
        path: join(import.meta.url, 'fixtures/missing-node-modules'),
        engineCheck: true,
        versionCheck: true,
      })
        .should.be.rejectedWith(/Failed to list installed modules/);
    });
  });

  describe('functionality', () => {
    it('should return an empty result on valid setup', async () => {
      await installedCheck({
        path: join(import.meta.url, 'fixtures/valid'),
        engineCheck: true,
        versionCheck: true,
      })
        .should.eventually.deep.equal({
          errors: [],
          notices: [],
          warnings: [],
        });
    });

    it('should return an empty result on an aliased setup', async () => {
      await installedCheck({
        path: join(import.meta.url, 'fixtures/aliased'),
        engineCheck: true,
        versionCheck: true,
      })
        .should.eventually.deep.equal({
          errors: [],
          notices: [],
          warnings: [],
        });
    });

    it('should return errors and warnings on invalid setup', async () => {
      await installedCheck({
        path: join(import.meta.url, 'fixtures/invalid'),
        engineCheck: true,
        versionCheck: true,
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
          notices: [],
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
      await installedCheck({
        path: join(import.meta.url, 'fixtures/missing-engines'),
        engineCheck: true,
        versionCheck: false,
      })
        .should.eventually.deep.equal({
          'errors': [
            'foo: Narrower "engines.node" is needed: >=8.0.0',
            'Combined "engines.node" needs to be narrower: >=8.0.0',
          ],
          notices: [],
          warnings: [
            'Missing "engines.node" in main package',
          ],
        });
    });

    it('should not suggest an engine configuration when engines are incompatible', async () => {
      await installedCheck({
        path: join(import.meta.url, 'fixtures/incompatible-engines'),
        engineCheck: true,
        versionCheck: false,
      })
        .should.eventually.deep.equal({
          'errors': [
            'foo: Incompatible "engines.node" requirement: <6.0.0',
            'Incompatible combined "engines.node" requirements.',
          ],
          notices: [],
          warnings: [],
        });
    });
  });
});
