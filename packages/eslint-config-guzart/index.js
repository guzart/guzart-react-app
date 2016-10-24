module.exports = {
  extends: [
    require.resolve('eslint-config-airbnb'),
  ],
  parser: require.resolve('babel-eslint'),
  rules: {},
  settings: {
    'import/resolver': {
      [require.resolve('eslint-import-resolver-webpack')]: {
        config: require.resolve('guzart-react-app/config/webpack.config.dev.js'),
      },
    },
  },
};
