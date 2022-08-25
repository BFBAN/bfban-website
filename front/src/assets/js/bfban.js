import packageInfo from '../../../package.json';

export default class BFBAN {
    BFBANLOG = 0;

    constructor(data) {
        this.log();
        return data;
    }

    log () {
        if (window.BFBANLOG >= 1) return;

        this.BFBANLOG+=1;
        console.dir(`🦖 v: ${packageInfo.version}`)
        console.log('=========================================');
        console.log('你也对BFBAN感兴趣？加入BFBAN，请联系关于内邮箱📮');
        console.log('=========================================');
    }
}