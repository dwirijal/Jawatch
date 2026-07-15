// Flat config (ESLint v10) for jawatch.
// - TypeScript via @typescript-eslint
// - Next.js-specific rules via @next/next
// - jsx-a11y (works in flat config)
// Note: eslint-plugin-react (legacy) is incompatible with ESLint v10 context API,
// so we skip it. Run `npm install --save-dev eslint-plugin-react@latest` when a
// flat-config-compatible version ships.
import next from '@next/eslint-plugin-next';
import tsParser from '@typescript-eslint/parser';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      '.claude/**',
      'next-env.d.ts',
      'deploy/**',
      'scripts/**',
      'public/**',
      '.hermes/**',
      '*.config.{js,ts,mjs}',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        Buffer: 'readonly',
        React: 'readonly',
        JSX: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        global: 'readonly',
        globalThis: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'writable',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
      },
    },
    plugins: {
      '@next/next': next,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
      ...jsxA11y.configs.recommended.rules,
    },
  },
];
