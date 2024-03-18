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
      .with.keys('installed', 'pkg')
      .and.have.nested.property('pkg.name', 'installed-check-core');
  });

  it('should return data from cwd when specified', async () => {
    const result = await getInstalledData(join(import.meta.url, 'fixtures/valid'));

    result.should.be.an('object').with.keys('installed', 'pkg');

    result.pkg.should.deep.equal({
      _id: '@',
      engines: { node: '>=8.0.0' },
      dependencies: { foo: '^1.0.0' },
      name: '',
      readme: 'ERROR: No README data found!',
      version: '',
    });

    [...result.installed.entries()].should.deep.equal([
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
