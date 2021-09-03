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

	pluginOptions: {
		i18n: {
			locale: 'zh-cn',
			fallbackLocale: 'en-US',
			localeDir: 'lang',
			enableInSFC: false
		}
	}
}
