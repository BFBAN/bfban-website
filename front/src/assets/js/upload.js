/**
 * 上传模块
 * 微软
 */

import Print from "./print"
import { http, api, http_token} from "./index"
import store from '@/store'

export default class Upload extends Print {
    FILESIZE = 2*1024*1024;

    /**
     * On
     * @param file File
     * @returns {Promise<Object>}
     */
    async on (file) {
        try {
            if (!file) throw 'not file';

            return new Promise(  (resolve, reject)  => {
                if (file.size <= this.FILESIZE)
                {
                    this.upDatesmallFile(file).then(res => {
                        if (res.code >= 1) {
                            resolve({
                                code: res.code,
                                url: res.url,
                            });
                            return;
                        }

                        reject({ code: res.code, message: res.message })
                    }).catch(err => {
                        reject({ code: -1, message: err.message })
                    })
                }
                else
                {
                    this.upDateLargeFile(file).then(res => {
                        if (res.code >= 1) {
                            resolve({
                                code: res.code,
                                url: res.url,
                            });
                            return;
                        }

                        reject({ code: res.code, message: res.message })
                    }).catch(err => {
                        reject({ code: -1, message: err.message })
                    });
                }
            });
        } catch (e) {
            super.log(e);
        }
    }

    /**
     * 小文件
     * 2m以内
     * @param file new File
     * @returns {Promise<Object>}
     */
    upDatesmallFile (file) {
        return new Promise((resolve, reject) => {
            try {
                if (!file) {
                    reject({ code: -1, message: 'Missing parameter' })
                    throw 'Missing parameter';
                }
                super.log(http);
                fetch(http.location() + api["service_upload"], {
                    method: 'PUT',
                    headers: {
                        ["Content-Type"]: file.type,
                        ["Content-Length"]: file.size,
                        ['x-access-token']: store.state.user.token
                    },
                    body: file.slice(0, file.length)
                }).then(res => res.json()).then(res => {
                    this.service_file(res)
                        .then(file_detail => {
                            if (file_detail) {
                                resolve({
                                    code: 1,
                                    url:file_detail
                                })
                            } else {
                                resolve({  code: -1 })
                            }
                        })
                        .catch(err => reject({code: -1, message: err.message}));
                })
            } catch (e) {
                resolve({
                    code: -1,
                    message: e
                });
            }
        })
    }

    /**
     * 大文件
     * 超出2m以上
     * @param file new File
     * @returns {Promise<String>}
     */
    upDateLargeFile (file) {
        return new Promise((resolve, reject) => {
            try {
                if (!file) {
                    reject({ code: -1, message: 'Missing parameter' })
                    throw 'Missing parameter';
                }

                fetch(http.location() + api["service_uploadBigFile"], {
                    method: 'POST',
                    data: {
                        "size": file.type,
                        "mimeType": file.size
                    },
                    headers: {
                        ['x-access-token']: store.state.user.token
                    },
                    body: file.slice(0, file.length)
                }).then(res => res.json()).then(res => {
                    this.service_file(res)
                        .then(file_detail => {
                            if (file_detail) {
                                resolve({
                                    code: 1,
                                    url:file_detail
                                })
                            } else {
                                resolve({ code: -1 })
                            }
                        })
                        .catch(err => reject({code: -1, message: err.message}));
                })
            } catch (e) {
                resolve({
                    code: -1,
                    message: e
                });
            }
        })
    }

    /**
     * 文件详情
     * @param res update results
     * @returns {Promise<String>} 文件Url
     */
    async service_file(res) {
        try {
            return new Promise(function (resolve, reject) {
                if (!res && !res.data || res.error == 1) {
                    reject({
                        code: -1,
                        message: 'Missing parameter'
                    })
                    throw res;
                }

                http.get(api["service_file"], {
                    params: {
                        filename: res.data.name,
                        explain: true
                    }
                }).then(res => {
                    resolve({
                        code: 1,
                        url: res.data.data.downloadURL,
                        data: res.data.data
                    });
                }).catch(err => {
                    reject({
                        code: -1,
                        message: err
                    });
                })
            })
        } catch (e) {
            super.log(e);
        }
    }
}