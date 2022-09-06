const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const conf = require('./package.json');

module.exports = {
  outputDir: 'dist',
  assetsDir: 'assets',
  filenameHashing: true,

  publicPath: '/',

  pwa: {
    workboxPluginMode: 'InjectManifest',
    name: 'BFBAN',
    workboxOptions: {
      swSrc: 'src/service-worker.js'
    }
  },

  pluginOptions: {
    i18n: {
      locale: 'zh-cn',
      fallbackLocale: 'en-US',
      localeDir: 'lang',
      enableInSFC: false
    }
  },

  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true
        }
      }
    }
  },

  // 定义资源方式
  configureWebpack: {
    output: {
      filename: `assets/js/[name].${conf.version}.js`,
      chunkFilename: `assets/js/[name].${conf.version}.js`
    },
    plugins: [
      new CopyWebpackPlugin(
          [{
            from: `src/lang`,
            to: `lang`
          }],
          {
            // 无论是否修改，全部复制
            copyUnmodified: true
          }
      ),
    ],
  },
}
