const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  // devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, '../server/public'),
    filename: 'bundle.js',
    publicPath: 'https://bfban-static.bamket.com/',
  },
});
