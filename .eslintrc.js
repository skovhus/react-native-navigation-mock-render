module.exports = {
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
  parser: 'babel-eslint',
  plugins: ['prettier'],
  env: {
    node: true,
    es6: true,
  },
  root: true,
  rules: {
    'prettier/prettier': [
      'error',
      { trailingComma: 'es5', singleQuote: true, tabWidth: 2 },
    ],

    'react/prop-types': 'off',
    'prefer-const': 'error',
    'no-unused-vars': ['error', { vars: 'all', args: 'none' }],
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'no-console': 'off',
    'no-warning-comments': ['warn', { terms: ['fixme'], location: 'start' }],
  },
  parserOptions: {
    sourceType: 'module',
  },
};
