const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  // devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, '../server/public'),
    filename: 'bundle.[contenthash].js',
    // publicPath: 'https://bfban.com/',
    // publicPath 会影响到请求 js 和 css 等静态资源时的路径问题
    publicPath: '/',
  },
  // https://webpack.js.org/plugins/mini-css-extract-plugin/#minimizing-for-production
  optimization: {
    minimizer: [
      new TerserJSPlugin({}),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      }
    })
  ]
});
