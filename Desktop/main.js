const { app, BrowserWindow } = require('electron') //dafür muss electron hier installiert sein

//icon
const nativeImage = require('electron').nativeImage;
var image = nativeImage.createFromPath(__dirname + '/resources/images/icon_white.ico');
image.setTemplateImage(true);

function createWindow () {
  // Erstelle das Browser-Fenster.
  const win = new BrowserWindow({
    icon: image,
    minWidth: 500,
    minHeight: 500,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }

  });
  win.webContents.openDevTools();
  win.loadFile('main.html');
  win.maximize();
  

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Einige APIs können nur nach dem Auftreten dieses Events genutzt werden.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
