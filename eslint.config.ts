import { rules } from 'eslint-config-airbnb-extended';
import type { Linter } from 'eslint';
import importX from 'eslint-plugin-import-x';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const config: Linter.Config[] = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      'import-x': importX,
      // Cast to any to avoid type incompatibility
      '@typescript-eslint': tsPlugin as any,
    },
  },
  rules.typescript.base,
  rules.typescript.imports,
  {
    rules: {
      'import-x/extensions': 'off',
    },
  },
];

export default config;
