// const path = require('path');
// const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const findCacheDir = require('find-cache-dir');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const SvgStore = require('webpack-svgstore-plugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const babelHelpers = require('../helpers/babel');

const appPackageJson = require(paths.appPackageJson); // eslint-disable-line

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = '/';

// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = '';

// // Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = {
  devtool: 'cheap-module-source-map',

  // These are the "entry points" to our application.
  // This means they will be the "root" imports that are included in JS bundle.
  // The first two entry points enable "hot" CSS and auto-refreshes for JS.
  entry: [
    // Use the webpack stock client, but lose the create-react-app overlay
    // TODO: Verify that js files are hot reloaded, otherwise there is no point
    // using the stock client, when we can have better error reporting with create-react-app's
    // require.resolve('react-dev-utils/webpackHotDevClient'),
    require.resolve('react-hot-loader/patch'),
    `${require.resolve('webpack-dev-server/client')}?/`,
    require.resolve('webpack/hot/dev-server'),

    // We ship a few polyfills by default:
    require.resolve('./polyfills'),

    // Finally, this is your app's code:
    paths.appIndexJs
    // We include the app code last so that if there is a runtime error during
    // initialization, it doesn't blow up the WebpackDevServer client, and
    // changing JS code would still trigger a refresh.
  ],

  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: paths.appPublic,
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: 'static/js/bundle.js',
    // This is the URL that app is served from. We use "/" in development.
    publicPath,
  },

  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
    // We use `fallback` instead of `root` because we want `node_modules` to "win"
    // if there any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebookincubator/create-react-app/issues/253
    modules: ['node_modules'].concat(paths.nodePaths),

    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebookincubator/create-react-app/issues/290
    extensions: ['.js', '.json', '.jsx'],

    alias: {
      // Support the own application as a package
      [appPackageJson.name]: paths.appSrc,
    },
  },

  // Resolve loaders (webpack plugins for CSS, images, transpilation) from the
  // directory of `react-scripts` itself rather than the project directory.
  resolveLoader: {
    modules: [paths.ownNodeModules, 'node_modules'],
    moduleExtensions: ['-loader'],
  },

  module: {
    rules: [
      {
        // First, run the linter.
        // It's important to do this before Babel processes the JS.
        enforce: 'pre',
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: 'eslint',
      },
      // Process JS with Babel.
      {
        test: /\.(js|jsx)$/,
        include: babelHelpers.addCustomBabelInclude(paths.appSrc),
        loader: 'babel',
        options: {
          babelrc: false,
          presets: [require.resolve('babel-preset-guzart-react-app')],
          plugins: [require.resolve('react-hot-loader/babel')],
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/react-scripts/
          // directory for faster rebuilds. We use findCacheDir() because of:
          // https://github.com/facebookincubator/create-react-app/issues/483
          cacheDirectory: findCacheDir({
            name: 'react-scripts',
          }),
        },
      },
      // "postcss" loader applies autoprefixer to our CSS.
      // "css" loader resolves paths in CSS and adds assets as dependencies.
      // "style" loader turns CSS into JS modules that inject <style> tags.
      // In production, we use a plugin to extract that CSS to a file, but
      // in development "style" loader enables hot editing of CSS.
      {
        test: /\.s?css$/,
        use: [
          'style',
          {
            loader: 'css',
            options: {
              localIdentName: '[path][name]___[local]___[hash:base64:5]',
              modules: true,
              importLoaders: 1,
              sourceMap: true,
            },
          },
          // We use PostCSS for autoprefixing only.
          // TODO: Re-enable post css with autoprefixer, issues with configuration for webpack 2
          // {
          //   loader: 'postcss',
          //   options: {
          //     plugins: () => [
          //       autoprefixer({
          //         browsers: [
          //           '>1%',
          //           'last 4 versions',
          //           'Firefox ESR',
          //           'not ie < 9', // React doesn't support IE8 anyway
          //         ],
          //       }),
          //     ],
          //     sourceMap: 'inline',
          //   },
          // },
          {
            loader: 'sass',
            options: {
              sourceMap: true,
            },
          }
        ],
      },
      // JSON is not enabled by default in Webpack but both Node and Browserify
      // allow it implicitly so we also enable it.
      {
        test: /\.json$/,
        loader: 'json',
      },
      // "file" loader makes sure those assets get served by WebpackDevServer.
      // When you `import` an asset, you get its (virtual) filename.
      // In production, they would get copied to the `build` folder.
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        loader: 'file',
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      // "url" loader works just like "file" loader but it also embeds
      // assets smaller than specified size as data URLs to avoid requests.
      {
        test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
        loader: 'url',
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      }
    ],
  },

  plugins: [
    // Makes the public URL available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In development, this will be an empty string.
    new InterpolateHtmlPlugin({
      PUBLIC_URL: publicUrl,
    }),

    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),

    // SVG Sprites
    new SvgStore({ svgoOptions: { plugins: [{ removeTitle: true }] } }),

    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env),

    new webpack.NamedModulesPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),

    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebookincubator/create-react-app/issues/186
    new WatchMissingNodeModulesPlugin(paths.appNodeModules)
  ],

  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
};
