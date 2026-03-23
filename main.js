const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.loadFile(path.join(__dirname, 'src/index.html'));
    // win.webContents.openDevTools(); // Open DevTools for debugging
};

app.whenReady().then(() => {
    ipcMain.handle('save-photo', async (event, dataUrl) => {
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
        const photosDir = path.join(__dirname, 'photos');
        if (!fs.existsSync(photosDir)) {
            fs.mkdirSync(photosDir);
        }
        const filename = `photo-${Date.now()}.png`;
        const filePath = path.join(photosDir, filename);
        
        try {
            fs.writeFileSync(filePath, base64Data, 'base64');
            console.log('Photo saved:', filePath);
            return { success: true, filePath };
        } catch (error) {
            console.error('Error saving photo:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('print-photo', async (event, filePath) => {
        const printWindow = new BrowserWindow({ show: false });
        printWindow.loadURL(`file://${filePath}`);
        
        printWindow.webContents.on('did-finish-load', () => {
            // silent: true prints to default printer without dialog
            printWindow.webContents.print({ silent: true, printBackground: true }, (success, errorType) => {
                if (!success) console.error('Print failed:', errorType);
                printWindow.close();
            });
        });
        return { success: true };
    });

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

// IPC handlers will be added here for saving photos and printing
