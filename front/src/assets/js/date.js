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
        return new Date('2018 11-04').toJSON().replaceAll('Z', '');
    }
}
