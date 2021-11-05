import Desktop from './desktop'
import Status from './status'

export default class Line extends Desktop {

    // 获取网络状态
    // docs [https://www.electronjs.org/docs/latest/tutorial/online-offline-events]
    getStatus () {
        !this.NAVIGATOR.onLine ? super.error({ msg:'offline' }) : super.susseed({ msg: 'online' });
    }
}