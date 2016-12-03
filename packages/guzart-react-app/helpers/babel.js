
// const exports = module.exports;

const paths = require('../config/paths');

const appPackageJson = require(paths.appPackageJson); // eslint-disable-line

const ensureArray = value => (value.push ? value : [value].filter(v => v));

exports.addCustomBabelInclude = function addCustomBabelInclude(baseInclude) {
  const base = baseInclude.push ? baseInclude : [baseInclude];
  const appConfig = appPackageJson.guzartReactApp;
  if (!appConfig || !appConfig.babel || !appConfig.babel.include) {
    return base;
  }

  const appInclude = ensureArray(appConfig.babel.include);
  return ensureArray(base)
    .concat(appInclude.map(paths.resolveRealAppPath));
};
