const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    contentBase: path.resolve(__dirname),

    historyApiFallback: true,
  },
  output: {
    path: path.resolve(__dirname),
    filename: 'bundle.js',
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
      title: '战地风云联BAN调查局',
      template: 'index.html',
      favicon: 'favicon.ico',
    }),
  ]
});
