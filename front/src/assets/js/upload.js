/**
 * 上传模块
 */

import { http, api, http_token} from "./"
import store from '@/store'

export default class Upload {
    on (file) {
        const size = 2*1024*1024;

        return new Promise(function (resolve, reject) {
            if(file.size <= size) {
                fetch(http.getUrl() + api["service_upload"], {
                    method: 'PUT',
                    headers: {
                        ["Content-Type"]: file.type,
                        ["Content-Length"]: file.size,
                        ['x-access-token']: store.state.user.token
                    },
                    body: file.slice(0, file.length)
                }).then(res => res.json()).then(res => {
                    service_file(res)
                })
            }else {
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
                    service_file(res)
                })
            }
            function service_file(res) {
                http.get(api["service_file"], {
                    params: {
                        filename: res.data.name, explain: true
                    }
                }).then(res => {
                    resolve(res.data.data.downloadURL)
                })
            }
        });
    }
}