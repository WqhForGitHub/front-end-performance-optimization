import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

// === File pattern groups ===
const reactFiles = ['**/*.{tsx,jsx}']
const vue3VueFiles = ['**/*.vue']
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
  ...pluginVue.configs['flat/recommended'].map((config) => ({
    ...config,
    files: vue3VueFiles,
  })),
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

  // === Global rule overrides (no plugin-specific rules) ===
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },

  // === React-specific rule overrides ===
  {
    files: reactFiles,
    rules: {
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/jsx-no-comment-textnodes': 'off',
      'react/display-name': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },

  // === Vue-specific rule overrides ===
  {
    files: vue3VueFiles,
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
    },
  },

  // === Prettier (must be last) ===
  eslintConfigPrettier,
]
