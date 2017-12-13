'use strict';
import { app, Menu, Tray, nativeImage, BrowserWindow, MenuItem } from 'electron';
import * as electron from 'electron';
import { EventEmitter } from 'events';
import { MediaKeyHandler } from '../scripts/mediaKeyHandler';

//@ts-ignore
let mainWindow: Electron.BrowserWindow;
let activePlayers: Map<string, boolean> = new Map<string, boolean>();
const mkh = new MediaKeyHandler(EventEmitter);
let tray: Electron.Tray;

function createWindow() {
  let displays = electron.screen.getAllDisplays();
  let windowX = (displays[0].size.width / 2) - 250;
  const window = new BrowserWindow({
    width: 245, height: 275, x: windowX, y: 50, resizable: false,
    minimizable: false, maximizable: false, /*vibrancy: 'popover', zoomToPageWidth: true*/
  });
  window.loadURL(`file://${__dirname}/index.html`);

  return window;
}

mkh.Event.on('update', (str: string, _plState: boolean) => {
  if (!_plState) {
    activePlayers.delete(str);
    updateMenuBar('');
  } else {
    updateMenuBar(str);
  }
  createTrayIcon();

});

function updateMenuBar(str: string) {
  const separator: Electron.MenuItemConstructorOptions = { type: 'separator' };
  const prefs: Electron.MenuItemConstructorOptions = {
    label: 'Preferences', click: () => {
      createWindow();
    }
  };
  const quit: Electron.MenuItemConstructorOptions = {
    label: 'Quit', click: () => {
      app.quit();
    }
  };

  setActivePlayers(str);
  let contextMenu = new Menu();
  if (contextMenu) {
    for (let ap of activePlayers.keys()) {
      let newItem: Electron.MenuItemConstructorOptions = {
        label: ap, checked: activePlayers.get(ap), type: 'radio', click: () => {
          mkh.changePlayer(ap);
          setTimeout(() => mkh.activate(), 200);
        }
      };
      let menuIt = new MenuItem(newItem);
      contextMenu.append(menuIt);
    }

    let sep = new MenuItem(separator);
    contextMenu.append(sep);

    let _prefs = new MenuItem(prefs);
    contextMenu.append(_prefs);

    contextMenu.append(sep);

    let _quit = new MenuItem(quit);
    contextMenu.append(_quit);

    for (let item of contextMenu.items) {
      if (item.label === mkh.CurrentPlayer.name.split(':').shift()) {
        item.checked = true;
      }
    }
  }
  tray.setContextMenu(contextMenu);
}

function setActivePlayers(newPl: string) {
  if (newPl) {
    activePlayers.set(newPl, true);
    for (let ap of activePlayers.keys()) {
      if (ap !== newPl) {
        activePlayers.set(ap, false);
      }
    }
  }
}

function createTrayIcon(_state?: any) {
  if (process.platform === 'darwin') { app.dock.hide(); }
  let image = null;
  let icon = null;

  if (!mkh.CurrentPlayer.attr.playing) {
    icon = `${__dirname}/../assets/play.png`;
  } else {
    icon = `${__dirname}/../assets/pause.png`;
  }

  image = nativeImage.createFromPath(icon);
  image.setTemplateImage(true);

  if (!tray) {
    tray = new Tray(image);
  } else {
    //tray.destroy();
    //setTimeout((image) => tray = new Tray(image), 100);
    tray.setImage(image); //
  }
  tray.on('right-click', function () {
    tray.popUpContextMenu();
  });

  if (!mkh.Store.get('player')) {
    createWindow();
  } else {
    let temp: string = mkh.Store.get('player');
    updateMenuBar(temp);
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); }
});

app.on('ready', () => {
  createTrayIcon();
});
