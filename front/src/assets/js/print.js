/**
 * 打印模块
 */
import conf from '../../../package.json';

export default class Print {
    styles = [
        'color：green',
        'background：yellow',
        'font-size：30px',
        'border：1px solid red',
        'text-shadow：2px 2px black',
        'padding：10px',
    ];

    log (v) {
        const that = this;
        if ( (process.env.NODE_ENV || 'development') == 'development') return;
        console.log('%c' + v, that.styles.join(';') );
    }
}