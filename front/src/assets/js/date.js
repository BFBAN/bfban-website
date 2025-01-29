/**
 * 时间
 */

export default class Time {
    constructor() {
        this.DATE = new Date()
    }

    get nowTimeStamp() {
        return this.DATE.getTime();
    }

    update() {
        this.DATE = new Date()
        return this
    }

    /**
     * 程序启动时间
     */
    appStart() {
        return new Date(1541260800000);
    }
}
