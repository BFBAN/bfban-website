import Status from './status'
import electron from 'electron'

export default class Desktop extends Status {
    DESKTOPMAIN;
    IPC;

    constructor() {
        super();

        this.checkDesktop();
        this.ready();
    }

    async ready (data) {

        // this.DESKTOPMAIN = electron;
        // this.IPC = electron.IpcRenderer;
    }

    unDesktop () {}

    // 检查是否在桌面应用内
    checkDesktop () {
        return navigator.userAgent == 'Bfban desktop' ? true : false;
    }

    // 关闭桌面
    closeDesktop () {
        console.log('11')
        console.log(this.closeDesktop())
        if (!this.closeDesktop()) {
            this.error({ msg: 'not in desktop?' })
            return;
        }
        this.unDesktop();

        if (this.IPC)
            this.IPC.send('desktop-all-closed');
    }
}