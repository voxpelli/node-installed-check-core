// eslint-disable-next-line n/no-unsupported-features/node-builtins
import { cp } from 'node:fs/promises';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { join } from 'desm';
import { temporaryDirectoryTask } from 'tempy';

import { ROOT, installedCheck } from '../lib/installed-check.js';

chai.use(chaiAsPromised);
chai.should();

describe('installedCheck() fix', () => {
  it('should be able to automatically fix a project', async () => {
    await temporaryDirectoryTask(async (tmpDir) => {
      await cp(join(import.meta.url, 'fixtures/workspace'), tmpDir, {
        recursive: true,
      });

      await installedCheck(['engine'], { cwd: tmpDir }, { fix: true })
        .should.eventually.deep.equal({
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
          warnings: [],
          fixFailures: [],
          workspaceSuccess: {
            [ROOT]: false,
            '@voxpelli/workspace-a': false,
          },
        });

      return installedCheck(['engine'], { cwd: tmpDir });
    })
      .should.eventually.deep.equal({
        'errors': [],
        suggestions: [],
        warnings: [],
        workspaceSuccess: {
          [ROOT]: true,
          '@voxpelli/workspace-a': true,
        },
      });
  });
});
