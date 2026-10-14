import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: "Doctor Prescription App"
    });

    // In production, load the built index.html
    // In development, you could load the dev server URL, but for simplicity we'll focus on the built version
    const indexPath = path.join(__dirname, 'dist', 'index.html');

    // Check if build exists, otherwise show a helpful message or load dev (if we wanted to support both)
    win.loadFile(indexPath).catch(() => {
        win.loadURL('data:text/html,<html><body><h1>App not built</h1><p>Please run <code>npm run build</code> first.</p></body></html>');
    });

    // win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
