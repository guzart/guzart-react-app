const REACT_APP_REGEX = /^REACT_APP_/i;

function isReactAppKey(key) {
  return REACT_APP_REGEX.test(key);
}

function getClientEnvironment(publicUrl) {
  const processEnv = Object
    .keys(process.env)
    .filter(isReactAppKey)
    .reduce((env, key) => {
      env[key] = JSON.stringify(process.env[key]); // eslint-disable-line no-param-reassign
      return env;
    }, {
      NODE_ENV: JSON.stringify(process.node.NODE_ENV || 'development'),
      PUBLIC_URL: JSON.stringify(publicUrl),
    });

  return { 'process.env': processEnv };
}

module.exports = getClientEnvironment;
