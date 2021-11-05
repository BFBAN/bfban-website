
export default class Regular {
    A = 'a';

    REGULARTYPE = {
        'link': {
            tipError: '没有',
            v: /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&amp;:/~+#]*[\w\-@?^=%&amp;/~+#])?/
        },
        'image': {},
        'video': {},
    };

    check(regularType = '', value, regularConf = {tipError: ''}) {
        if (regularType) true;
        let res = this.REGULARTYPE[regularType].v.test(value);

        if (res) {
            return {
                code: 0
            };
        }

        return {
            code: -1,
            msg: regularConf.tipError || res.tipError
        }
    }
}