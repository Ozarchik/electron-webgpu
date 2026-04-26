const { app, BrowserWindow } = require('electron');

app.commandLine.appendSwitch('enable-unsafe-webgpu');

function createWindow(width, height) {
    const window = new BrowserWindow({
        width: width,
        height: height,
        title: 'Electron WebGPU',
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        }
    });

    window.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow(800, 600);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow(800, 600);
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
