const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    contentBase: path.resolve(__dirname),
  },
  output: {
    path: path.resolve(__dirname),
    filename: 'bundle.js',
  },
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000,
  },
});
