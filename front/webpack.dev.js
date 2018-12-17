const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    contentBase: '../server/public',
  },
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000,
  },
});
