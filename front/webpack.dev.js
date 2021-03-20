const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    disableHostCheck: true,
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    contentBase: path.resolve(__dirname),

    historyApiFallback: true,
  },
  output: {
    path: path.resolve(__dirname),
    filename: 'bundle.js',
    publicPath: '/',
  },
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000,
  },
  plugins: [
    new webpack.DefinePlugin({
      CDN_BASE_PATH: JSON.stringify('https://bfban-static.bamket.com/')
    }),
    new HtmlWebpackPlugin({
      title: 'BFBAN',
      template: 'index.html',
    }),
  ]
});
