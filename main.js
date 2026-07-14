const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 480,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0f0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('download-mp3', async (event, url) => {
  const downloadsPath = app.getPath('downloads');

  return new Promise((resolve, reject) => {
    try {
      const ytDlpPath = path.join(__dirname, 'bin', 'yt-dlp_macos');
      
      const args = [
        url,
        '-x',
        '--audio-format', 'mp3',
        '--ffmpeg-location', ffmpegStatic,
        '-o', path.join(downloadsPath, '%(title)s.%(ext)s'),
        '--no-playlist'
      ];

      const ytDlpProcess = spawn(ytDlpPath, args);

      ytDlpProcess.stdout.on('data', (data) => {
        const output = data.toString();
        // yt-dlp çıktıları arasında yüzdeyi yakala (örn: 45.2%)
        const percentMatch = output.match(/(\d{1,3}\.\d)%/);
        if (percentMatch && mainWindow) {
            mainWindow.webContents.send('download-progress', percentMatch[0]);
        }
      });

      ytDlpProcess.stderr.on('data', (data) => {
        console.log(`yt-dlp stderr: ${data}`);
      });

      ytDlpProcess.on('close', (code) => {
        if (code === 0) {
            shell.openPath(downloadsPath);
            resolve({ success: true, message: 'Dönüştürme tamamlandı!' });
        } else {
            resolve({ success: false, message: `Hata oluştu (Kod: ${code}). Geçersiz link olabilir.` });
        }
      });
      
      ytDlpProcess.on('error', (err) => {
          resolve({ success: false, message: `İşlem hatası: ${err.message}` });
      });

    } catch (err) {
      resolve({ success: false, message: err.message });
    }
  });
});
