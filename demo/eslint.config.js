import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

// === File pattern groups ===
const reactFiles = ['**/react-ts-vite/**/*.{ts,tsx,js,jsx}']

const vue3VueFiles = [
  '**/vue3-ts-vite/**/*.vue',
  '**/v-cloak/**/*.vue',
  '**/v-text/**/*.vue',
  '**/skeleton/**/*.vue',
]

const vue2Files = ['**/vue2/**/*.{vue,js}']

export default [
  // === Global ignores ===
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/package-lock.json',
      '**/*.config.js',
      '**/*.config.ts',
      '**/env.d.ts',
    ],
  },

  // === Base JS recommended ===
  js.configs.recommended,

  // === TypeScript recommended ===
  ...tseslint.configs.recommended,

  // === Common language options ===
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
  },

  // === React projects ===
  {
    files: reactFiles,
    ...reactPlugin.configs.flat.recommended,
    settings: {
      react: { version: '18' },
    },
  },
  {
    files: reactFiles,
    ...reactPlugin.configs.flat['jsx-runtime'],
  },
  {
    files: reactFiles,
    ...reactHooks.configs['recommended-latest'],
  },
  {
    files: reactFiles,
    ...reactRefresh.configs.vite,
  },

  // === Vue 3 projects ===
  // eslint-plugin-vue flat configs are arrays, spread + map to scope files
  ...pluginVue.configs['flat/recommended'].map((config) => ({
    ...config,
    files: vue3VueFiles,
  })),
  // Use TypeScript parser for <script setup lang="ts"> in Vue 3 SFCs
  {
    files: vue3VueFiles,
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // === Vue 2 projects ===
  ...pluginVue.configs['flat/vue2-recommended'].map((config) => ({
    ...config,
    files: vue2Files,
  })),

  // === Custom rule overrides ===
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-unused-vars': 'off',
      'react/prop-types': 'off',
    },
  },

  // === Prettier (must be last) ===
  eslintConfigPrettier,
]
