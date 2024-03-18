import chai from 'chai';

import { checkVersionRange, checkDependencyRange } from '../lib/check-version-range.js';

const should = chai.should();

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
    checkVersionRange(...baseVersionRangeArguments()).should.deep.equal({
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

    it('should handle ignore array', async () => {
      checkVersionRange(
        ...baseVersionRangeArguments(),
        {
          ignore: ['bar'],
        }
      ).should.deep.equal({
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
      checkVersionRange(
        ...baseVersionRangeArguments(),
        {
          ignore: name => name === 'bar',
        }
      ).should.deep.equal({
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
      const installed = new Map();

      installed.set('foo', {
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
