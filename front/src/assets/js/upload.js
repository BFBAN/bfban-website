/**
 * 上传模块
 * 微软
 */

import Print from "./print"
import {conf, http, api, http_token} from "./index"
import store from '@/store'
import Conf from "@/assets/js/conf";

export default class Upload extends (Print, Conf) {
    FILESIZE = 2 * 1024 * 1024;

    GETURL = {}

    constructor(props) {
        super(props);
        super.initConf();
    }

    /**
     * 重写Http类的location指向配置环境
     * 由于上传在本地服务启动繁琐，选择使用线上
     * 需要走本地测试，启动上传服务，请查看backend/docs/msGraphHowTo.md文档
     * @returns {URL}
     */
    location = () => {
        this.GETURL = this.CONF.child[this.CONF.requestUploadName]
        return `${this.GETURL.protocol || 'http'}://${this.GETURL.host}${this.GETURL.pathname}`;
    }

    /**
     * On
     * @param file File
     * @returns {Promise<Object>}
     */
    async on(file) {
        try {
            if (!file) throw 'not file';
            return new Promise((resolve, reject) => {
                if (file.size <= this.FILESIZE) {
                    this.uploadDateSmallFile(file).then(res => {
                        if (res.code >= 1) {
                            resolve({
                                code: res.code,
                                url: res.url,
                            });
                            return;
                        }

                        reject({code: res.code, message: res.message})
                    }).catch(err => {
                        reject({code: -1, message: err.message})
                    })
                } else {
                    this.uploadDateLargeFile(file).then(res => {
                        if (res.code >= 1) {
                            resolve({
                                code: res.code,
                                url: res.url,
                            });
                            return;
                        }

                        reject({code: res.code, message: res.message})
                    }).catch(err => {
                        reject({code: -1, message: err.message})
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
    uploadDateSmallFile(file) {
        return new Promise((resolve, reject) => {
            try {
                console.log(file.slice(0, file.length));
                if (!file) {
                    reject({code: -1, message: 'Missing parameter'})
                    throw 'Missing parameter';
                }
                fetch(this.location() + api["service_upload"], {
                    method: 'PUT',
                    headers: {
                        ["Content-Type"]: file.type,
                        ["Content-Length"]: file.size,
                        ['x-access-token']: store.state.user.token
                    },
                    body: file.slice(0, file.length)
                }).then(res => res.json()).then(res => {
                    resolve({
                        code: 1,
                        url:  `${this.location()}service/file?filename=${res.data.name}`
                    })
                    // this.service_file(res)
                    //     .then(file_detail => {
                    //         if (file_detail) {
                    //             resolve({
                    //                 code: 1,
                    //                 url: file_detail.data.downloadURL
                    //             })
                    //         } else {
                    //             resolve({code: -1})
                    //         }
                    //     })
                    //     .catch(err => reject({code: -1, message: err.message}));

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
    uploadDateLargeFile(file) {
        return new Promise((resolve, reject) => {
            try {
                if (!file) {
                    reject({code: -1, message: 'Missing parameter'})
                    throw 'Missing parameter';
                }

                fetch(this.location() + api["service_uploadBigFile"], {
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
                                    url: file_detail
                                })
                            } else {
                                resolve({code: -1})
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
            const that = this;
            return new Promise(function (resolve, reject) {
                if (!res && !res.data || res.error == 1) {
                    reject({
                        code: -1,
                        message: 'Missing parameter'
                    })
                    throw res;
                }
                resolve({

                })
                http.get(api["service_file"], {
                    params: {
                        filename: res.data.name,
                        explain: true
                    }
                }).then(detailRes => {
                    resolve({
                        code: 1,
                        data: detailRes.data.data
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
