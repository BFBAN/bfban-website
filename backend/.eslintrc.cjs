module.exports = {
    "env": {
        "browser": false,
        "es2021": true,
		"node": true
    },
    "extends": "eslint:recommended",
	"parser": "@babel/eslint-parser",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module",
        "requireConfigFile": false
    },
	"ignorePatterns": ["typedef.js"],
    "rules": {
		"no-unused-vars": 0,
		"no-constant-condition": 0,
    }
};
