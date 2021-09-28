
export default class Regular {
    A = 'a';

    REGULARTYPE = {
        'link': {
            tipError: '没有',
            v: /(http(preview.svg?):)([/|.|\w|\preview.svg|-])*\.(?:jpe?g|gif|png|bmp)/
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