'use strict';
import { app, Menu, Tray, nativeImage, Notification, BrowserWindow, MenuItem } from 'electron';
import * as electron from 'electron';
import { EventEmitter } from 'events';
import { MediaKeyHandler } from '../scripts/mediaKeyHandler';
import { Player } from '../scripts/utility/js/interfaces';

const mkh = new MediaKeyHandler(EventEmitter);
let tray: Electron.Tray;

mkh.Event.on('update', (_options: any) => {
  createTrayIcon();
});
mkh.Event.on('notification', () => {
  createNotification();
});

function createWindow() {
  let displays = electron.screen.getAllDisplays();
  let windowX = (displays[0].size.width / 2) - 250;
  const window = new BrowserWindow({
    width: 245, height: 275, x: windowX, y: 50, resizable: false,
    minimizable: false, maximizable: false, /*vibrancy: 'popover', zoomToPageWidth: true*/
  });
  window.loadURL(`file://${__dirname}/index.html`);
}

const PlayersMap = (): Map<string, [Date, Player]> => {
  return mkh.getPlayersMap();
};

const natImage = (): nativeImage => {
  let image = null;
  let icon = null;

  if (!mkh.CurrentPlayer.playing) {
    icon = `${__dirname}/../assets/play.png`;
  } else {
    icon = `${__dirname}/../assets/pause.png`;
  }
  image = nativeImage.createFromPath(icon);
  image.setTemplateImage(true);
  return image;
};

function createNotification() {
  let player = mkh.CurrentPlayer;
  if (player.id) {
    let myNotification = new Notification({
      title: player.title.split(':').shift() || player.id,
      body: player.title.split(':').pop() || player.title,
      silent: true
    });
    myNotification.show();
  }
}

const fixTextLength = (str: string, length: number, ending: string): string => {
  if (length == null) {
    length = 100;
  }
  if (ending == null) {
    ending = '...';
  }
  if (str) {
    if (str.length > length) {
      return str.substring(0, length - ending.length) + ending;
    } else if (str.length < length) {
      return str + ' '.repeat(length - str.length);
    }
  }
  return str;
};

function updateMenuBar() {
  const separator: Electron.MenuItemConstructorOptions = { type: 'separator' };
  const prefs: Electron.MenuItemConstructorOptions = {
    label: 'Preferences', click: () => { createWindow(); }
  };
  const quit: Electron.MenuItemConstructorOptions = {
    label: 'Quit', click: () => { app.quit(); }
  };

  let contextMenu = new Menu();
  if (contextMenu) {
    if (PlayersMap().size > 0) {
      for (let plId of PlayersMap().keys()) {
        //@ts-ignore
        let itemAttr: [Date, Player] = PlayersMap().get(plId);
        let curPlayer = plId === mkh.CurrentPlayer.id;
        let title = fixTextLength(itemAttr[1].title, 30, '...');

        let newItem: Electron.MenuItemConstructorOptions = {
          label: title, checked: curPlayer, type: 'radio', click: (menuItem: MenuItem) => {
            for (let item of contextMenu.items) {
              item.checked = false;
            }
            menuItem.checked = true;
            mkh.changePlayer(plId, itemAttr[1].title);
          }
        };
        let menuIt = new MenuItem(newItem);
        contextMenu.append(menuIt);
      }
    } else {
      let newItem: Electron.MenuItemConstructorOptions = {
        label: 'No open players'
      };
      newItem.enabled = false;
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
  }
  tray.setContextMenu(contextMenu);
}

function createTrayIcon(_state?: any) {
  if (process.platform === 'darwin') { app.dock.hide(); }
  if (!tray) {
    tray = new Tray(natImage());
  } else {
    tray.setImage(natImage()); //
  }
  tray.on('right-click', function () {
    tray.popUpContextMenu();
  });

  if (!mkh.Store.get('player')) {
    createWindow();
  } else {
    updateMenuBar();
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); }
});

app.on('ready', () => {
  createTrayIcon();
});
