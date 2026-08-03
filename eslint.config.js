import { voxpelli } from '@voxpelli/eslint-config';

export default voxpelli({
  noMocha: true,
  ignores: ['test/fixtures/jsdoc-in-type-declaration/*'],
});
