'use strict';
import { app, Menu, Tray, nativeImage, BrowserWindow, MenuItem } from 'electron';
import * as electron from 'electron';
import { EventEmitter } from 'events';
import { MediaKeyHandler } from '../scripts/mediaKeyHandler';
import { Player } from '../scripts/utility/js/interfaces';

//@ts-ignore
let mainWindow: Electron.BrowserWindow;
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

function PlayersMap(): Map<string, [Date, Player]> {
  return mkh.getPlayersMap();
}

mkh.Event.on('update', () => {
  createTrayIcon();
  //updateMenuBar();
});

function updateMenuBar() {
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

  //setActivePlayers();
  let contextMenu = new Menu();
  if (contextMenu) {
    //console.log('playersmap ', PlayersMap());
    for (let ap of PlayersMap().keys()) {
      //@ts-ignore

      let itemAttr: [Date, PlayerAttributes] = PlayersMap().get(ap);

      let curPlayer = ap === mkh.CurrentPlayer.id;

      let newItem: Electron.MenuItemConstructorOptions = {
        label: itemAttr[1].title, checked: curPlayer, type: 'radio', click: (menuItem: MenuItem) => {
          for (let item of contextMenu.items) {
            item.checked = false;
          }
          menuItem.checked = true;
          mkh.changePlayer(ap, itemAttr[1].title);
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

    /* for (let item of contextMenu.items) {
      if (item.label === mkh.CurrentPlayer.name.split(':').pop()) {
        item.checked = true;
      }
    } */
  }
  tray.setContextMenu(contextMenu);
}

function createTrayIcon(_state?: any) {
  if (process.platform === 'darwin') { app.dock.hide(); }
  let image = null;
  let icon = null;

  if (!mkh.CurrentPlayer.playing) {
    icon = `${__dirname}/../assets/play.png`;
  } else {
    icon = `${__dirname}/../assets/pause.png`;
  }

  image = nativeImage.createFromPath(icon);
  image.setTemplateImage(true);

  if (!tray) {
    tray = new Tray(image);
  } else {
    tray.setImage(image); //
  }
  tray.on('right-click', function () {
    tray.popUpContextMenu();
  });

  if (!mkh.Store.get('player')) {
    createWindow();
  } else {
    //@ts-ignore
    let temp: string = mkh.Store.get('player');
    updateMenuBar();
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); }
});

app.on('ready', () => {
  createTrayIcon();
});
