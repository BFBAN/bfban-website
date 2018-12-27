const path = require('path');

// https://vue-loader.vuejs.org/zh/guide/#%E6%89%8B%E5%8A%A8%E9%85%8D%E7%BD%AE
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  plugins: [
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'fonts'),
        to: 'fonts',
      },
    ]),
    new HtmlWebpackPlugin({
      title: '战地风云联BAN调查局',
      template: 'index.html',
      favicon: 'favicon.ico',
    }),
  ],
  module: {
    rules: [
      {
        // extract-text-webpack-plugin
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {},
          },
          {
            loader: 'iview-loader',
            options: {
              prefix: false,
            },
          },
        ],
      },
      {
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            cacheDirectory: true,
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
        exclude: /(node_modules|bower_components)/,
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
          },
        }],
      },
    ],
  }
};
