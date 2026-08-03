import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { checkDependencyRange, checkVersionRange } from '../lib/check-version-range.js';

const baseVersionRangeArguments = () => /** @type {const} */ ([
  {
    engines: { node: '>=10.10.0' },
    dependencies: { bar: '^1.0.0', foo: '^1.0.0' },
  },
  'engines.node',
  {
    bar: { engines: { node: '^10.2.0 || ^14.5.0 || ^16.0.0' } },
    foo: { engines: { node: '^12.0.0 || ^14.0.0 || ^16.5.0' } },
  },
]);

describe('checkVersionRange', () => {
  it('should suggest new version range', async () => {
    assert.deepStrictEqual(checkVersionRange(...baseVersionRangeArguments()), {
      valid: false,
      note: undefined,
      packageNotes: [
        {
          'name': 'bar',
          'note': 'Narrower "engines.node" is needed: ^10.10.0 || ^14.5.0 || ^16.0.0',
          'suggested': '^10.10.0 || ^14.5.0 || ^16.0.0',
          'valid': false,
        },
        {
          'name': 'foo',
          'note': 'Narrower "engines.node" is needed: ^12.0.0 || ^14.0.0 || ^16.5.0',
          'suggested': '^12.0.0 || ^14.0.0 || ^16.5.0',
          'valid': false,
        },
      ],
      suggested: '^14.5.0 || ^16.5.0',
    });
  });

  describe('checkVersionRange()', () => {
    it('should handle engine ranges', () => {
      assert.deepStrictEqual(checkVersionRange(
        {
          engines: { node: '^12 || ^14 || ^16' },
          dependencies: { foo: '^1.0.0' },
        },
        'engines.node',
        {
          foo: { engines: { node: '^12 || ^14 || ^16' } },
        }
      ), {
        valid: true,
        note: undefined,
        packageNotes: [],
        suggested: undefined,
      });
    });

    it('should handle ignore array', async () => {
      assert.deepStrictEqual(checkVersionRange(
        ...baseVersionRangeArguments(),
        {
          ignore: ['bar'],
        }
      ), {
        valid: false,
        note: undefined,
        packageNotes: [
          {
            'name': 'foo',
            'note': 'Narrower "engines.node" is needed: ^12.0.0 || ^14.0.0 || ^16.5.0',
            'suggested': '^12.0.0 || ^14.0.0 || ^16.5.0',
            'valid': false,
          },
        ],
        suggested: '^12.0.0 || ^14.0.0 || ^16.5.0',
      });
    });

    it('should handle ignore callback', async () => {
      assert.deepStrictEqual(checkVersionRange(
        ...baseVersionRangeArguments(),
        {
          ignore: name => name === 'bar',
        }
      ), {
        valid: false,
        note: undefined,
        packageNotes: [
          {
            'name': 'foo',
            'note': 'Narrower "engines.node" is needed: ^12.0.0 || ^14.0.0 || ^16.5.0',
            'suggested': '^12.0.0 || ^14.0.0 || ^16.5.0',
            'valid': false,
          },
        ],
        suggested: '^12.0.0 || ^14.0.0 || ^16.5.0',
      });
    });
  });

  describe('checkDependencyRange()', () => {
    it('should handle engine ranges', () => {
      const result = checkDependencyRange(
        '^12 || ^14 || ^16',
        'engines.node',
        {
          engines: { node: '^12 || ^14 || ^16' },
        }
      );

      assert.strictEqual(result, undefined);
    });
  });
});
