/**
 * 时间
 */

export default class Time {
    DATE = new Date();

    now() {
        return new Date().getTime();
    }

    /**
     * 程序启动时间
     */
    appStart() {
        return new Date(1541260800000);
    }

    getUTCTimeStamp() {
        const now = new Date();
        const utcTimeStamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        return utcTimeStamp;
    }
}
