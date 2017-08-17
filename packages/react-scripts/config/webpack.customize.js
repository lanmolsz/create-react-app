'use strict';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const paths = require('./paths');
const getClientEnvironment = require('./env');
const env = getClientEnvironment('');
const webpack = require(paths.appPackageJson).webpack;

let rules = [];
let setupFunction = function() {};
let externals = webpack.externals || {};

let entry = { main: paths.appIndexJs };
let htmlTemplatePlugins = [];

if (webpack) {
  if (webpack.module && webpack.module.rules) {
    webpack.module.rules.forEach(function(loader) {
      if (loader === 'less') {
        rules.push({
          test: /\.less$/,
          use: ['style-loader', 'css-loader', 'less-loader'],
        });
      }
    });
  }
  if (webpack.devServer && webpack.devServer.setup) {
    setupFunction = require(path.resolve(
      process.cwd(),
      webpack.devServer.setup
    ));
  }
  if (webpack.entry) {
    entry = webpack.entry;
  }
}

let clients = [require.resolve('./polyfills')];

if (env.raw.NODE_ENV === 'development') {
  clients.push(
    require.resolve('react-dev-utils/webpackHotDevClient'),
    require.resolve('react-error-overlay')
  );
}
Object.keys(entry).forEach(function(entryItem) {
  let scripts = entry[entryItem];
  scripts = scripts instanceof Array ? scripts : [scripts];
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i] !== paths.appIndexJs) {
      scripts[i] = path.resolve(process.cwd(), scripts[i]);
    }
  }
  entry[entryItem] = clients.concat(scripts);
  htmlTemplatePlugins.push(htmlTemplatePlugin(entryItem));
});

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
  externals: externals,
};
