// 状态包装器

export default class Status {
    success (d = {data: {}, msg: ''}) {
        return Object.assign({
            code: 0,
            data: d.data,
        }, d.msg);
    }

    error (d = {data: {},msg: ''}) {
        return Object.assign({
            code: -1,
            data: d.data,
        }, {msg: d.msg});
    }
}