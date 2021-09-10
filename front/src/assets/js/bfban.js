import packageInfo from '../../../package.json';

export default class BFBAN {
    constructor(data) {
        this.log();
        return data;
    }

    log () {
        console.dir(`🦖 v: ${packageInfo.version}`)
        console.log('=========================================');
        console.log('你也对BFBAN感兴趣？加入BFBAN，请联系关于内邮箱📮');
        console.log('=========================================');
    }
}