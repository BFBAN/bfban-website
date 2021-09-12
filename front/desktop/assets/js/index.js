// 桌面应用包装器

import Desktop from './desktop'
import status from './status'

import line from './line'
import notifications from './notifications'

export const desktopMain = new Desktop();

export default {desktopMain, line, notifications}

module.exports = {
    install: function (Vue) {
        Vue.prototype.$electron = require('electron')
    }
}