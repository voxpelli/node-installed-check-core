import assert from 'node:assert/strict';
import { cp } from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { temporaryDirectoryTask } from 'tempy';

import { installedCheck, ROOT } from '../lib/installed-check.js';

describe('installedCheck() fix', () => {
  it('should be able to automatically fix a project', async () => {
    await temporaryDirectoryTask(async (tmpDir) => {
      await cp(path.join(import.meta.dirname, 'fixtures/workspace'), tmpDir, {
        recursive: true,
      });

      assert.deepStrictEqual(
        await installedCheck(['engine'], { cwd: tmpDir }, { fix: true }),
        {
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
        }
      );

      assert.deepStrictEqual(
        await installedCheck(['engine'], { cwd: tmpDir }),
        {
          'errors': [],
          suggestions: [],
          warnings: [],
          workspaceSuccess: {
            [ROOT]: true,
            '@voxpelli/workspace-a': true,
          },
        }
      );
    });
  });
});
