const {app, BrowserWindow} = require('electron');

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

app.whenReady().then(() => createWindow(800, 600));