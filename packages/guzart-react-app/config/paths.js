const path = require('path');
const fs = require('fs');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.env.PWD || process.cwd());
function resolveAppPath(relativePath) {
  return path.resolve(appDirectory, relativePath);
}

function resolveRealAppPath(relativePath) {
  // Use fs.realpathSync because webpack resolves symlinks and
  // there is a mismatch with paths from packages
  // https://github.com/webpack/webpack/issues/1643
  return fs.realpathSync(resolveAppPath(relativePath));
}

// We support resolving modules according to `NODE_PATH`.
// This lets you use absolute paths in imports inside large monorepos:
// https://github.com/facebookincubator/create-react-app/issues/253.

// It works similar to `NODE_PATH` in Node itself:
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders

// We will export `nodePaths` as an array of absolute paths.
// It will then be used by Webpack configs.
// Jest doesn’t need this because it already handles `NODE_PATH` out of the box.

const nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .map(resolveAppPath);

function resolveOwn(relativePath) {
  return path.resolve(__dirname, relativePath);
}

// config before eject: we're in ./node_modules/react-scripts/config/
module.exports = {
  appBuild: resolveAppPath('build'),
  appPublic: resolveAppPath('public'),
  appHtml: resolveAppPath('public/index.html'),
  appIndexJs: resolveAppPath('src/index.js'),
  appPackageJson: resolveAppPath('package.json'),
  appSrc: resolveAppPath('src'),
  testsSetup: resolveAppPath('src/setupTests.js'),
  appNodeModules: resolveAppPath('node_modules'),
  // this is empty with npm3 but node resolution searches higher anyway:
  ownNodeModules: resolveOwn('../node_modules'),
  resolveAppPath,
  resolveRealAppPath,
  nodePaths,
};
