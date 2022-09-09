import Desktop from './desktop'
// const { app, BrowserWindow, Notification } = require('electron')

export default class Notifications extends Desktop {
    NOTIFICATIONS = this.DESKTOPMAIN.Notification;

    // docs [https://www.electronjs.org/docs/latest/api/notification/]
    send ({title, body}) {
        new this.NOTIFICATIONS({
            title,
            body
        });
    }

    // show( send( { title:'', body:'' } ) ).show()
    show ( fun ) {
        if (fun)
            fun.show();
    }
}