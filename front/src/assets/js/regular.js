
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

    /**
     * 正则校验
     * @param regularType
     * @param value
     * @param regularConf
     * @returns {{msg: (string|*), code: number}|{code: number}}
     */
    check(regularType = '', value, regularConf = {tipError: ''}) {
        if (!regularType) return;
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

    /**
     * TODO
     * AUTH
     * 对校验文件资源校验，get请求资源是否存在
     */
}