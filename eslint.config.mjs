import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      quotes: ['error', 'single'],
      'no-console': 'warn',
      eqeqeq: ['error', 'always'],
      indent: ['error', 2],
      'no-unused-vars': 'warn',
      semi: ['error', 'always'],
    },
  },
];
