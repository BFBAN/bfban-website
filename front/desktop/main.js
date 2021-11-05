const {app, BrowserWindow} = require('electron');

let win;
let windowConfig = {
    target: 'electron-renderer',
    width: 800,
    height: 600,
    min_height: 500,
    frame: false,
    transparent: true,
    webPreferences: {
        nodeIntegration: true,
    }
};

function createWindow() {
    win = new BrowserWindow(windowConfig);
    win.loadURL(`http://localhost:8080`, {
        userAgent: 'Bfban desktop'
    });
    win.webContents.openDevTools();

    win.on('close', () => {
        win = null;
    });
    win.on('resize', () => {
        win.reload();
    })
}

app.on('ready', createWindow);
app.on('desktop-all-closed', () => {
    app.quit();
});
app.on('activate', () => {
    if (win == null) {
        createWindow();
    }
});