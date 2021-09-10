const {app, BrowserWindow} = require('electron');

let win;
let windowConfig = {
    width: 800,
    height: 600,
    min_height: 500,
    frame: false,
    transparent: true,
};

function createWindow() {
    win = new BrowserWindow(windowConfig);
    win.loadURL(`file://${__dirname}/views/index.html`);
    // win.webContents.openDevTools();

    win.on('close', () => {
        win = null;
    });
    win.on('resize', () => {
        win.reload();
    })
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    app.quit();
});
app.on('activate', () => {
    if (win == null) {
        createWindow();
    }
});