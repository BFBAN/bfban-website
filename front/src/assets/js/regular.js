export default class Regular {
    A = 'a';

    REGULARTYPE = {
        'username': {
            v: /^[a-zA-Z0-9_-]{4,40}$/g
        },
        'email': {
            v: /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$/
        },
        'link': {
            v: /^(ftp|http|https):\/\/[^ "]+$/g
        },
        'image': {},
        'video': {},
        'date': {
            // yyyy-MM-dd HH:mm:ss
            v: /^(?:19|20)[0-9][0-9]-(?:(?:0[1-9])|(?:1[0-2]))-(?:(?:[0-2][1-9])|(?:[1-3][0-1])) (?:(?:[0-2][0-3])|(?:[0-1][0-9])):[0-5][0-9]:[0-5][0-9]$/
        },
        'mobile': {
            v: /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
        }
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
        const checkRes = new RegExp(this.REGULARTYPE[regularType].v).test(value);

        if (checkRes) {
            return {
                code: 0,
                checkRes,
            };
        }

        return {
            code: -1,
            msg: regularConf.tipError || checkRes.tipError
        }
    }

    checkJSON(jsonValue = "") {
        const t = /^[\],:{}\s]*$/;

        if (
            t.test(
                jsonValue.toString()
                    .replace(/\\["\\/bfnrtu]/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, '')
            )
        ) return true;

        return false;
    }

    getCheckText(regularType = '', value) {
        if (!regularType || !value) return;
        let res = value.match(this.REGULARTYPE[regularType].v);
        return res;
    }

    /**
     * TODO
     * AUTH
     * 对校验文件资源校验，get请求资源是否存在
     */

    // 图片验证
    authImage(url) {
        if (!url) return false;
        return new Promise(function (resolve, reject) {
            let img = new Image()
            img.src = url;
            img.onload = function (res) {
                resolve(true);
            }
            img.onerror = function () {
                resolve(false)
            }
        })
    }
}
