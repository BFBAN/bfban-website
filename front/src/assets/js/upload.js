/**
 * 上传模块
 * 微软
 */

import Print from "./print"
import { http, api, http_token} from "./index"
import store from '@/store'

export default class Upload extends Print {
    FILESIZE = 2*1024*1024;

    async on (file) {
        return new Promise(function (resolve, reject) {
            resolve(file.size <= this.FILESIZE ? this.upDatesmallFile(file) : this.upDateLargeFile(file))
        });
    }

    /**
     * 小文件
     * 2m以内
     */
    upDatesmallFile (file) {
        try {
            if (!file) return;

            fetch(http.getUrl() + api["service_upload"], {
                method: 'PUT',
                headers: {
                    ["Content-Type"]: file.type,
                    ["Content-Length"]: file.size,
                    ['x-access-token']: store.state.user.token
                },
                body: file.slice(0, file.length)
            }).then(res => res.json()).then(res => {
                this.service_file(res)
            })
        } catch (e) {
            super.log(e);
        }
    }

    /**
     * 大文件
     * 超出2m以上
     */
    upDateLargeFile (file) {
        try {
            if (!file) return;

            fetch(http.getUrl() + api["service_uploadBigFile"], {
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
            })
        } catch (e) {
            super.log(e);
        }
    }

    /**
     * 文件详情
     * @param res
     * @returns {Promise<Object>}
     */
    async service_file(res) {
        try {
            if (!res) return ;

            return new Promise(function (resolve, reject) {
                http.get(api["service_file"], {
                    params: {
                        filename: res.data.name,
                        explain: true
                    }
                }).then(res => {
                    resolve(res.data.data.downloadURL);
                })
            })
        } catch (e) {
            super.log(e);
        }
    }
}