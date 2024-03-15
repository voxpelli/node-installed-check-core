import chai from 'chai';
import { join } from 'desm';
import { ErrorWithCause } from 'pony-cause';

import { getInstalledData } from '../lib/get-installed-data.js';

chai.should();

process.on('unhandledRejection', cause => {
  throw new ErrorWithCause('Unhandled rejection', { cause });
});

describe('getInstalledData', () => {
  it('should return data', async () => {
    await getInstalledData().should.eventually
      .be.an('object')
      .with.keys('installedDependencies', 'mainPackage')
      .and.have.nested.property('mainPackage.name', 'installed-check-core');
  });

  it('should return data from path when specified', async () => {
    const result = await getInstalledData(join(import.meta.url, 'fixtures/valid'));

    result.should.be.an('object').with.keys('installedDependencies', 'mainPackage');

    result.mainPackage.should.deep.equal({
      _id: '@',
      engines: { node: '>=8.0.0' },
      dependencies: { foo: '^1.0.0' },
      name: '',
      readme: 'ERROR: No README data found!',
      version: '',
    });

    [...result.installedDependencies.entries()].should.deep.equal([
      ['foo', {
        '_id': 'foo@1.0.0',
        'engines': {
          'node': '>=8.0.0',
        },
        'name': 'foo',
        'private': true,
        'readme': 'ERROR: No README data found!',
        'version': '1.0.0',
      }],
    ]);
  });
});
