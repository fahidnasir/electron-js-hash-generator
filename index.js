const { app, BrowserWindow, ipcMain } = require('electron');

require('electron-context-menu')({
  append: (params, browserWindow) => [
    {
      label: 'Actions',
      labels: {
        cut: 'Configured Cut',
        copy: 'Configured Copy',
        paste: 'Configured Paste'
      }
    }
  ]
});

var crypto = require('crypto');
var fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 500 });

  // and load the index.html of the app.
  win.loadFile('index.html');

  ipcMain.on('calculateHash', (event, filePath) => {
    // console.log(filePath);

    // change the algo to sha1, sha256 etc according to your requirements
    calculateHash(filePath, checksumCalculated => {
      const stats = fs.statSync(filePath);
      const fileSizeInBytes = stats.size;
      event.sender.send(
        'checksumCalculated',
        checksumCalculated,
        fileSizeInBytes
      );
    });
  });

  ipcMain.on('validateHash', (event, filePath, checksumValue) => {
    calculateHash(filePath, checksumCalculated => {
      const result = checksumCalculated === checksumValue;
      event.sender.send('checksumValidated', result);
    });
  });

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  function calculateHash(filePath, callback) {
    var algo = 'md5';
    var shasum = crypto.createHash(algo);
    var s = fs.createReadStream(filePath);
    var checksumCalculated;
    s.on('data', function(d) {
      shasum.update(d);
    });
    s.on('end', function() {
      checksumCalculated = shasum.digest('hex');
      console.log(checksumCalculated);
      callback(checksumCalculated);
    });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
