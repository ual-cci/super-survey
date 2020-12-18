module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-plusplus': 'off',
    'no-multi-assign': 'off',
    'no-param-reassign': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
