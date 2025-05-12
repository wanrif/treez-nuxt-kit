module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
    'type-empty': [2, 'never'],
    'type-case': [2, 'always', ['lower-case']],
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert']],
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [0, 'always'], // Disable line length limit for body to allow detailed points
    'body-case': [0, 'always'],
    'body-full-stop': [0, 'never'],
    'body-empty': [0, 'never'], // Make body optional but encouraged
  },
}
