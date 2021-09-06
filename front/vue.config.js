module.exports = {
  outputDir: 'dist',
  assetsDir: 'assets',
  filenameHashing: true,

  publicPath: '/',

  pwa: {
    workboxPluginMode: 'InjectManifest',
    name: 'bfban_2.0',
    workboxOptions: {
      swSrc: 'src/service-worker.js'
    }
  },
  // devServer: {
  //   proxy: {
  //     '/cheaters': {
  //       target: '127.0.0.1:8080', //要转发的目标网址
  //       changeOrigin: true,
  //     }
  //   }
  // },
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
}
