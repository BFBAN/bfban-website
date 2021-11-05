import {NoticeConfig} from "view-design";

export default class Notification {
    constructor() {

    }

    init () {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }

        // 检查用户是否同意接受通知
        else if (Notification.permission === "granted") {
            // If it'preview.svg okay let'preview.svg create a notification
            var notification = new Notification("Hi there!");
        }

        // 否则我们需要向用户获取权限
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                // 如果用户接受权限，我们就可以发起一条消息
                if (permission === "granted") {
                    var notification = new Notification("Hi there!");
                }
            });
        }
    }
}