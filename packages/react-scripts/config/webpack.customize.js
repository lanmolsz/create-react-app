'use strict';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const paths = require('./paths');
const getClientEnvironment = require('./env');
const env = getClientEnvironment('');
const webpackCustomize = require(paths.appPackageJson).webpackCustomize;

let rules = [];
let setupFunction = function() {};

let entry = { main: [paths.appIndexJs] };
let htmlTemplatePlugins = [];

if (webpackCustomize) {
  if (
    webpackCustomize.lessEnable === 'true' ||
    webpackCustomize.lessEnable === true
  ) {
    rules.push({
      test: /\.less$/,
      use: ['style-loader', 'css-loader', 'less-loader'],
    });
  }
  if (webpackCustomize.devServerSetup) {
    setupFunction = require(path.resolve(
      process.cwd(),
      webpackCustomize.devServerSetup
    ));
  }
  if (webpackCustomize.entry) {
    entry = webpackCustomize.entry;
  }
}

let clients = [require.resolve('./polyfills')];

if (env.raw.NODE_ENV === 'development') {
  clients.push(
    require.resolve('react-dev-utils/webpackHotDevClient'),
    require.resolve('react-error-overlay')
  );

  Object.keys(entry).forEach(function(entryItem) {
    entry[entryItem] = clients.concat(entry[entryItem]);
    htmlTemplatePlugins.push(htmlTemplatePlugin(entryItem));
  });
}

function htmlTemplatePlugin(key) {
  let filename = key === 'main' ? `index.html` : `./${key}/index.html`;
  let chunks = [key];
  return new HtmlWebpackPlugin({
    inject: true,
    template: paths.appHtml,
    filename,
    chunks,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    },
  });
}

module.exports = {
  entry: entry,
  plugins: htmlTemplatePlugins,
  rules: rules,
  setupFunction: setupFunction,
};
