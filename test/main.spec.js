import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { join } from 'desm';

import { installedCheck } from '../index.js';

chai.use(chaiAsPromised);
chai.should();

process.on('unhandledRejection', reason => { throw reason; });

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
        versionCheck: true
      })
        .should.be.rejectedWith(/Failed to read package\.json/);
    });

    it('should error on inability to list installed modules', async () => {
      await installedCheck({
        path: join(import.meta.url, 'fixtures/missing-node-modules'),
        engineCheck: true,
        versionCheck: true
      })
        .should.be.rejectedWith(/Failed to list installed modules/);
    });
  });

  describe('functionality', () => {
    it('should return an empty result on valid setup', async () => {
      await installedCheck({
        path: join(import.meta.url, 'fixtures/valid'),
        engineCheck: true,
        versionCheck: true
      })
        .should.eventually.deep.equal({
          errors: [],
          notices: [],
          warnings: []
        });
    });

    it('should return errors and warnings on invalid setup', async () => {
      await installedCheck({
        path: join(import.meta.url, 'fixtures/invalid'),
        engineCheck: true,
        versionCheck: true
      })
        .should.eventually.deep.equal({
          'errors': [
            "invalid-dependency-definition: Dependency is not installed. Can't check its version",
            'invalid-module-version: Invalid version, expected a ^1.0.0',
            "invalid-dependency-definition: Dependency is not installed. Can't check its engine requirement",
            'invalid-engine: Narrower "node" engine requirement needed: >=10.0.0',
            'invalid-engine: Narrower "abc" engine requirement needed: >=1.0.0',
            'Combined "node" engine requirement needs to be narrower: >=10.0.0',
            'Combined "abc" engine requirement needs to be narrower: >=1.0.0',
          ],
          notices: [],
          warnings: [
            "invalid-dependency-definition: Target version is empty. Can't match against dependency version",
            "invalid-engine: Target version is not a semantic versioning range. Can't match against dependency version",
            'Empty engine definition: bar',
            'Empty engine definition: abc',
            'invalid-engine: Missing engine: bar',
            'invalid-module-version: Missing engine: node',
            'invalid-module-version: Missing engine: bar',
            'invalid-module-version: Missing engine: abc',
          ]
        });
    });

    it('should check engine even when no target engines are set', async () => {
      await installedCheck({
        path: join(import.meta.url, 'fixtures/missing-engines'),
        engineCheck: true,
        versionCheck: false
      })
        .should.eventually.deep.equal({
          'errors': [
            'foo: Narrower "node" engine requirement needed: >=8.0.0',
            'Combined "node" engine requirement needs to be narrower: >=8.0.0',
          ],
          notices: [],
          warnings: []
        });
    });

    it('should not suggest an engine configuration when engines are incompatible', async () => {
      await installedCheck({
        path: join(import.meta.url, 'fixtures/incompatible-engines'),
        engineCheck: true,
        versionCheck: false
      })
        .should.eventually.deep.equal({
          'errors': [
            'foo: Incompatible "node" engine requirement: <6.0.0',
            'Incompatible combined "node" requirements.',
          ],
          notices: [],
          warnings: []
        });
    });
  });
});
