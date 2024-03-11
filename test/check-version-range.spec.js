import chai from 'chai';
import { ErrorWithCause } from 'pony-cause';

import { checkVersionRange, checkDependencyRange } from '../lib/check-version-range.js';

const should = chai.should();

process.on('unhandledRejection', cause => {
  throw new ErrorWithCause('Unhandled rejection', { cause });
});

describe('checkVersionRange', () => {
  describe('checkVersionRange()', () => {
    it('should handle engine ranges', () => {
      checkVersionRange(
        {
          engines: { node: '^12 || ^14 || ^16' },
          dependencies: { foo: '^1.0.0' },
        },
        'engines.node',
        {
          foo: { engines: { node: '^12 || ^14 || ^16' } },
        }
      ).should.deep.equal({
        valid: true,
        note: undefined,
        packageNotes: [],
        suggested: undefined,
      });
    });
  });

  describe('checkDependencyRange()', () => {
    it('should handle engine ranges', () => {
      const installedDependencies = new Map();

      installedDependencies.set('foo', {
        engines: { node: '^12 || ^14 || ^16' },
      });

      const result = checkDependencyRange(
        '^12 || ^14 || ^16',
        'engines.node',
        {
          engines: { node: '^12 || ^14 || ^16' },
        }
      );

      should.not.exist(result);
    });
  });
});
