const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  // devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, '../server/public'),
    filename: 'bundle.js',
    // publicPath: 'https://bfban.com/',
    // publicPath 会影响到请求 js 和 css 等静态资源时的路径问题
    publicPath: '/',

  },
});
