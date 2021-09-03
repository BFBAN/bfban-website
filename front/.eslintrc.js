module.exports = {
	root: true,
	env: {
		"browser": true,
		"node": true
	},
	'extends': [
		'plugin:vue/essential',
		'eslint:recommended'
	],
	parserOptions: {
		ecmaVersion: 12,
		parser: 'babel-eslint'
	},
	rules: {
		"indent": [0, "tab"],
		"no-unused-vars": 0,
		"no-constant-condition": 0,
		"no-mixed-spaces-and-tabs": [0, "smart-tabs"]
	}
}
