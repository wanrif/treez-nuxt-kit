// @ts-check
import prettierVue from 'eslint-plugin-prettier-vue'

import stylistic from '@stylistic/eslint-plugin'

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  files: ['**/*.ts', '**/*.vue'],
  plugins: {
    '@stylistic': stylistic,
    'prettier-vue': prettierVue,
  },
  ignores: ['node_modules', 'dist', 'build', 'coverage'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    '@stylistic/linebreak-style': ['error', 'unix'],
    '@stylistic/semi': 'off',
    '@stylistic/quotes': 'off',
    // Disable stylistic indent rule as Prettier handles it
    '@stylistic/indent': 'off',
    'vue/html-self-closing': [
      'warn',
      {
        html: {
          void: 'any',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    // Rely on .prettierrc via settings
    'prettier-vue/prettier': 'error',
  },
  settings: {
    'prettier-vue': {
      usePrettierrc: true,
    },
  },
})
