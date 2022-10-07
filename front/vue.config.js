const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {InjectManifest} = require("workbox-webpack-plugin")
const SitemapPlugin = require('sitemap-webpack-plugin').default

const packageConf = require('./package.json')
const requestConf = require('./public/conf/requestConf.json')

const url = requestConf.child[requestConf.requestProductionName];

module.exports = {
    outputDir: 'dist',
    assetsDir: 'assets',
    filenameHashing: true,
    publicPath: '/',

    // PWA
    // https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
    pwa: {
        name: 'BFBAN',
        themeColor: '#ffd802',
        msTileColor: '#fff',
        manifestPath: 'manifest.json',
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            exclude: [/\.(?:png|jpg|jpeg|svg)$/],
            swSrc: "src/registerServiceWorker.js"
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
            filename: `assets/js/[name].${packageConf.version}.js`,
            chunkFilename: `assets/js/[name].${packageConf.version}.js`
        },
        plugins: [
            new SitemapPlugin({
                // Production Url
                base: url.protocol + '://' + url.host,
                paths: [{
                    path: '/',
                    priority: 1
                }, '/player', '/player/', '/sitestats', '/search', '/apps'],
                options: {
                    filename: 'sitemap.xml',
                    lastmod: true,
                    changefreq: 'hourly',
                    priority: .7
                }
            }),
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
