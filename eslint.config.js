import { voxpelli } from '@voxpelli/eslint-config';

export default [
  ...voxpelli({
    noMocha: true,
    ignores: ['test/fixtures/jsdoc-in-type-declaration/*'],
  }),
  {
    files: ['test/**/*.test-d.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
];
