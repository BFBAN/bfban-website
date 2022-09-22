/**
 * 时间
 */

export default class Time {
    DATE = new Date();

    now () {
        return new Date().getTime();
    }

    /**
     * 程序启动时间
     */
    appStart () {
        return new Date(1514764800000);
    }
}
