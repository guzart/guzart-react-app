module.exports = {
  extends: 'airbnb',
  rules: {
    'comma-dangle': [2, {
      arrays: 'never',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'ignore',
    }]
  },
};
