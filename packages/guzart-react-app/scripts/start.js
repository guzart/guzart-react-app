process.env.NODE_ENV = 'development';

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true });

const chalk = require('chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const detect = require('detect-port');
const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const prompt = require('react-dev-utils/prompt');
const config = require('../config/webpack.config.dev');
const paths = require('../config/paths');

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = process.env.PORT || 3000;

function log(...messages) {
  console.log(...messages); // eslint-disable-line no-console
}

function setupCompiler(host, port, protocol) {
  // "Compiler" is a low-level interface to Webpack.
  // It lets us listen to some events and provide our own custom messages.
  const compiler = webpack(config);

  // "invalid" event fires when you have changed a file, and Webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.plugin('invalid', () => {
    clearConsole();
    log('Compiling...');
  });

  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.plugin('done', (stats) => {
    clearConsole();

    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    const messages = formatWebpackMessages(stats.toJson({}, true));
    if (!messages.errors.length && !messages.warnings.length) {
      log(chalk.green('Compiled successfully!'));
      log();
      log('The app is running at:');
      log();
      log(`  ${chalk.cyan(`${protocol}://${host}:${port}/`)}`);
      log();
      log('Note that the development build is not optimized.');
      log(`To create a production build, use ${chalk.cyan('npm run build')}.`);
      log();
    }

    // If errors exist, only show errors.
    if (messages.errors.length) {
      log(chalk.red('Failed to compile.'));
      log();
      messages.errors.forEach((message) => {
        log(message);
        log();
      });
      return;
    }

    // Show warnings if no errors were found.
    if (messages.warnings.length) {
      log(chalk.yellow('Compiled with warnings.'));
      log();
      messages.warnings.forEach((message) => {
        log(message);
        log();
      });
      // Teach some ESLint tricks.
      log('You may use special comments to disable some warnings.');
      log(`Use ${chalk.yellow('// eslint-disable-next-line')} to ignore the next line.`);
      log(`Use ${chalk.yellow('/* eslint-disable */')} to ignore all warnings in a file.`);
    }
  });

  return compiler;
}

function runDevServer(compiler, host, port, protocol) {
  const devServer = new WebpackDevServer(compiler, {
    // Silence WebpackDevServer's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    clientLogLevel: 'none',
    // By default WebpackDevServer serves physical files from current directory
    // in addition to all the virtual build products that it serves from memory.
    // This is confusing because those files won’t automatically be available in
    // production build folder unless we copy them. However, copying the whole
    // project directory is dangerous because we may expose sensitive files.
    // Instead, we establish a convention that only files in `public` directory
    // get served. Our build script will copy `public` into the `build` folder.
    // In `index.html`, you can get URL of `public` folder with %PUBLIC_PATH%:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In JavaScript code, you can access it with `process.env.PUBLIC_URL`.
    // Note that we only recommend to use `public` folder as an escape hatch
    // for files like `favicon.ico`, `manifest.json`, and libraries that are
    // for some reason broken when imported through Webpack. If you just want to
    // use an image, put it in `src` and `import` it from JavaScript instead.
    contentBase: paths.appPublic,
    // Enable hot reloading server. It will provide /sockjs-node/ endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the Webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    hot: true,
    // It is important to tell WebpackDevServer to use the same "root" path
    // as we specified in the config. In development, we always serve from /.
    publicPath: config.output.publicPath,
    // WebpackDevServer is noisy by default so we emit custom message instead
    // by listening to the compiler events with `compiler.plugin` calls above.
    quiet: true,
    // Reportedly, this avoids CPU overload on some systems.
    // https://github.com/facebookincubator/create-react-app/issues/293
    watchOptions: {
      ignored: /node_modules/,
    },
    // Enable HTTPS if the HTTPS environment variable is set to 'true'
    https: protocol === 'https',
    // Server index.html instead of 404 to account for react-router
    historyApiFallback: true,
    host,
  });

  // Launch WebpackDevServer.
  devServer.listen(port, (err/* , result*/) => {
    if (err) {
      return log(err);
    }

    clearConsole();
    log(chalk.cyan('Starting the development server...'));
    return log();
  });

  return devServer;
}

function run(port) {
  const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
  const host = process.env.HOST || 'localhost';
  const compiler = setupCompiler(host, port, protocol);
  runDevServer(compiler, host, port, protocol);
}

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `detect()` Promise resolves to the next free port.
detect(DEFAULT_PORT).then((port) => {
  if (port === DEFAULT_PORT) {
    run(port);
    return;
  }

  clearConsole();
  const message = chalk.yellow(`Something is already running on port ${DEFAULT_PORT}.`);
  const question = `${message}\n\nWould you like to run the app on another port instead?`;

  prompt(question, true).then((shouldChangePort) => {
    if (shouldChangePort) {
      run(port);
    }
  });
});
