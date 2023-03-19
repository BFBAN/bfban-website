const path = require('path');

module.exports = {
    root: true,
    env: {
        "browser": true,
        "node": true
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/essential',
        'plugin:i18n-json/recommended'
    ],
    parserOptions: {
        ecmaVersion: 12,
        parser: 'babel-eslint'
    },
    rules: {
        "indent": [0, "tab"],
        "no-unused-vars": 0,
        "no-constant-condition": 0,
        "no-mixed-spaces-and-tabs": [0, "smart-tabs"],

        'i18n-json/valid-message-syntax': [2, {
            syntax: 'icu',
        }],
        'i18n-json/valid-json': 2,
        'i18n-json/sorted-keys': [2, {
            order: 'asc',
            indentSpaces: 2,
        }],
        'i18n-json/identical-keys': 0,
    }
}
