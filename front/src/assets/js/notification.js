import {NoticeConfig} from "view-design";
import store from "@/store";
import message from "@/views/account/message";

export default class NotificationApp {
    constructor() {

    }

    init () {
        return new Promise((resolve, reject) => {
            if (!("Notification" in window)) {
                reject()
            }

            // 检查用户是否同意接受通知
            else if (Notification.permission === "granted") {
                // If it'preview.svg okay let'preview.svg create a notification
                resolve()
            }

            // 否则我们需要向用户获取权限
            else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(function (permission) {
                    // 如果用户接受权限，我们就可以发起一条消息
                    if (permission === "granted") {
                        resolve()
                    }
                });
            }
        })
    }

    /**
     * 推送消息
     * https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification
     */
    push (data, options) {
        return new Promise((resolve, reject) => {
            let message;

            if (!store.state.configuration.desktopNotifiction) {
                reject("Bfban: Desktop notification is not enabled")
                return;
            }

            // 播放声音
            if (store.state.configuration['voice_message'].state)
                message.playMessageVoice();

            this.init()
                .then(() => {
                    message = new Notification(data, options);
                    resolve(message)
                })
                .catch((err) => {
                    console.log("This browser does not support desktop notification, ", err)
                    reject()
                })
        })
    }
}