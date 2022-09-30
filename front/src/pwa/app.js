import {account_storage, api, http, notification} from "@/assets/js";
import router from "@/router";
import store from "@/store";

let _oldPlayerLength = 0;
let _playerListInterval;
let _intervalTime = 1 * 60 * 1000; // 2m
let _notification;

export default class PwaApp {
    /**
     * 轮查管理员待处理案件
     * @returns {Promise<void>}
     */
    async asyncAutoUpdatePlayerList () {
        const that = this;
        const autoUpdatePlayerList = account_storage.getConfiguration('autoUpdatePlayerList');

        if (autoUpdatePlayerList) {
            this.listeningPlayerList().then(async backres => {
                store.state.$desktop.autoUpdatePlayerList = backres.data;

                _playerListInterval = setInterval(async function () {
                    await that.asyncAutoUpdatePlayerList();
                    clearInterval(_playerListInterval);
                }, _intervalTime);

                // 避免重复通知
                // 在数量不一致时再次通知
                if (backres.data.result.length != _oldPlayerLength) {

                    _notification = await notification.push('查阅通知', {
                        body: `管理员! 网站有${backres.data.result.length || 0}条，待检查举报信息`,
                        icon: '/img/icons/maskable_icon_x48.png',
                        requireInteraction: true,
                    });
                }

                _oldPlayerLength = backres.data.result.length;
            });
        }

        if (_notification) {
            // 单击通知横幅时
            _notification.addEventListener('click', (event) => {
                _notification.close();
                event.preventDefault();
                router.push({
                    name: 'player_list',
                    query: {
                        status: 5,
                        limit: 10,
                        game: 'all'
                    }
                })
            });

            _notification.addEventListener('close', (event) => {
                clearInterval(_playerListInterval);
            })
        }
    }

    /**
     * 检查待审核贴纸
     * @returns {Promise<unknown>}
     */
    async listeningPlayerList () {
        let config = {
            params: {
                game: 'all',
                skip: 0,
                sort: 'updateTime',
                status: 0,
                limit: 100,
            },
        };

        return new Promise((resolve, reject) => {
            http.get(api['players'], config).then(res => {
                resolve(res.data);
            }).catch((err) => {
                reject(err);
            });
        })
    }
}