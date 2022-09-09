// 状态包装器

export default class Status {
    susseed (data = {}) {
        return {
            code: 0,
            data,
        };
    }

    error (data = {}) {
        return {
            code: -1,
            data,
        };
    }
}