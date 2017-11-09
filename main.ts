import { app, BrowserWindow, screen, Menu, Tray, nativeImage } from 'electron';
import * as path from 'path';
import * as Store from 'electron-store';

let win, winSettings, serve, tray, height, offsetX, offsetY, alwaysOnTop;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

if (serve) {
  require('electron-reload')( __dirname, {} );
}

const store = new Store();

function createWindow() {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  height = 40;
  offsetX = ( store.get('config.offsetX') ) ? store.get('config.offsetX') : 0;
  offsetY = ( store.get('config.offsetY') ) ? store.get('config.offsetY') : size.height - 40;
  alwaysOnTop = ( store.get('config.alwaysOnTop') ? store.get('config.alwaysOnTop') : false );

  win = new BrowserWindow({
    title: 'CryptoBar',
    icon: 'src/favicon.ico',
    frame: false,
    x: offsetX,
    y: offsetY,

    width: size.width,

    height: height,
    maximizable: false,

    skipTaskbar: true,

    alwaysOnTop: alwaysOnTop,

    webPreferences: {
      nodeIntegration: false
    }
  });

  win.loadURL('file://' + __dirname + '/index.html');

  win.on('closed', () => {
    win = null;
  });

  win.on('move', () => {
    store.set( 'config.offsetX', win.getPosition()[0] );
    store.set( 'config.offsetY', win.getPosition()[1] );
  });

  createTray();
}

function createTray() {
  const trayIcon = path.join(__dirname, 'favicon.ico');
  const nimage = nativeImage.createFromPath(trayIcon);

  tray = new Tray( nimage );
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Settings', type: 'normal', click: () => { openSettings() } },
    { label: 'Always on top', type: 'checkbox', checked: alwaysOnTop, click: () => {
      alwaysOnTop = !win.isAlwaysOnTop();

      win.setAlwaysOnTop( alwaysOnTop );
      store.set( 'config.alwaysOnTop', alwaysOnTop );
    } },
    { type: 'separator' },
    { label: 'Exit', type: 'normal', click: () => {
      app.quit()
    } }
  ]);
  tray.setToolTip( 'CryptoBar' );
  tray.setContextMenu( contextMenu );

  win.show();

  tray.on('click', () => {
    win.show();
  })
}

function openSettings() {
  winSettings = new BrowserWindow({
    frame: false,
    maximizable: false,

    title: 'CryptoBar - Settings',
    icon: 'src/favicon.ico',

    width: 400,
    height: 570
  });

  winSettings.loadURL('file://' + __dirname + '/index.html#/settings');

  winSettings.on('closed', () => {
    winSettings = null;
  });
}

try {
  app.on('ready', createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (win === null) {
      createWindow();
    }
  });

  app.on('browser-window-created', (e, window) => {
    window.setMenu(null);
    //window.webContents.openDevTools()
  });

} catch (e) {
  // Catch Error
  // throw e;
}
