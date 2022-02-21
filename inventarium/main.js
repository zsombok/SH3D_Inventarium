const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
// const path = require('path');
// const express = require('express');
// const server = express();
// const port = 3000;

// server.use('/', express.static(path.join(__dirname, '/')))
// // server.get('/', (req, res) => {
// //   res.send('inventarium.html')
// // })

// server.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

let mainWindow;
let subWindow;


function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nativeWindowOpen: true,
    },
    backgroundColor: '#000000',
  });

  // mainWindow.setPosition(-1000,1000);
  mainWindow.setFullScreen(true);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('index.html');
  // mainWindow.webContents.openDevTools();
}

function createSubWindow () {

  subWindow = new BrowserWindow({
    parent: mainWindow,
    width: 1920,
    height: 1080,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nativeWindowOpen: true,
    },
    backgroundColor: '#000000',
  });
  
  // subWindow.setPosition(1000,1000);
  subWindow.loadFile('inventarium_sajat.html');

}

app.whenReady().then(() => {
  createWindow();
  // createSubWindow();
});

app.on('window-all-closed', function (e) {
  app.quit();
});

// ipcMain.on('preload', (e, a) => {
//   console.log(e);
// });

ipcMain.on('capture', (e) => {
  mainWindow.capturePage({x: 40, y: 220, width: 1840, height: 840}).then(img => {
    fs.writeFileSync(`${__dirname}/saved_images/${Date.now()}.png`, img.toPNG(), e => { if (e) throw err})
  })
})