const fs = require('fs');
const path = require('path');

const appDirectory = fs.realpathSync(process.env.PWD || process.cwd());
const resolve = require.resolve;

module.exports = {
  extends: [
    resolve('eslint-config-airbnb'),
  ],
  parser: resolve('babel-eslint'),
  rules: {},
  settings: {
    'import/resolver': {
      [resolve('eslint-import-resolver-webpack')]: {
        config: path.join(appDirectory, 'node_modules', 'guzart-react-app', 'config', 'webpack.config.dev.js'),
      },
    },
  },
};
