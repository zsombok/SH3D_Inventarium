const { app, BrowserWindow } = require('electron');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nativeWindowOpen: true
    }
  });

  mainWindow.setFullScreen(false);

  mainWindow.loadFile('index.html');
  //mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

});

app.on('window-all-closed', function () {
  app.quit();
});