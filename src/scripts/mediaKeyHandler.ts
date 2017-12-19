'use strict';
import { EventEmitter } from 'events';
import { utility } from './utility/js/utility';
import { Store } from './utility/js/store';
import { Player, PlayerID } from './utility/js/interfaces';
import { app, globalShortcut, ipcMain as ipc } from 'electron';
//@ts-ignore
import * as MediaService from 'electron-media-service';
import { extHandlers } from './index';
const myService = new MediaService();
const handlerListener = new EventEmitter();

let handlers: Array<any> = [];
let playersMap: Map<PlayerID, [Date, Player]> = new Map<PlayerID, [Date, Player]>();

export class MediaKeyHandler {
    protected _store: Store;
    protected _event: EventEmitter;
    protected _defaultplayer: string;

    constructor(evt: any) {
        let mainEvent = evt;
        this.Event = new mainEvent();
        this.init();
    }

    set TouchbarItem(playing: boolean | undefined) {
        if (playing) {
            myService.setMetaData({
                state: 'playing'
            });
        } else {
            myService.setMetaData({
                state: 'pause'
            });
        }
    }

    set Event(evt: EventEmitter) {
        this._event = evt;
    }
    get Event(): EventEmitter {
        return this._event;
    }

    set Store(_opt: any) {
        this._store = new Store({
            configName: 'user-preferences',
            defaults: {
                player: ''
            }
        });
    }

    get DefaultPlayer(): string {
        return this._defaultplayer;
    }

    set DefaultPlayer(str: string) {
        if (str) {
            this._defaultplayer = str;
        }
    }

    get Handlers() {
        return handlers;
    }

    get Store() {
        return this._store;
    }

    get CurrentPlayer(): Player {
        //@ts-ignore
        let curPl: Player = {
            id: '', title: '', playing: false, plObj: null
        };
        let maxDate: Date;
        playersMap.forEach((val, key) => {
            if (maxDate == null || val[0] > maxDate) {
                maxDate = val[0];
                let attr = val[1];
                curPl = {
                    id: key, title: attr.title, playing: attr.playing, plObj: attr.plObj
                };
            }
        });
        return curPl;
    }

    set CurrentPlayer(_player: Player) {
        if (_player.id) {
            playersMap.set(_player.id, [new Date(), { id: _player.id, title: _player.title, playing: _player.playing, plObj: _player.plObj }]);
        }
        //playersMap.set(_player.id, { title: _player.title, playing: _player.playing, dualP: _player.dualP });
        //console.log(`CurrentPlayer { id: ${this.CurrentPlayer.id}, playing: ${this.CurrentPlayer.playing}}`);
        //console.log('');
    }

    private keyListenerIni() {
        globalShortcut.register('MediaPlayPause', () => {
            let player = this.CurrentPlayer.plObj;
            let state = player.IsPlaying;
            state === true ? player.pause() : player.play();
        });
        globalShortcut.register('MediaPreviousTrack', () => {
            this.CurrentPlayer.plObj.previous();
        });
        globalShortcut.register('MediaNextTrack', () => {
            let pl = this.CurrentPlayer.plObj;
            pl.next();
        });
        globalShortcut.register('command+F7', () => {
            let pl = this.CurrentPlayer.plObj;
            pl.activate();
        });
    }

    private init() {
        this.Store = '';
        myService.startService();
        app.on('ready', () => {
            this.listenerIni();
            this.keyListenerIni();
            this.eventListeners();
            this.evalDefaultPlayer();
            //this.logging();
        });

        app.on('will-quit', () => {
            globalShortcut.unregisterAll();
        });
    }
    //@ts-ignore
    private logging() {
        //@ts-ignore
        let log = new Store({
            configName: 'player-log',
            defaults: {
                /* playersMap: playersMap,
                handlers: handlers */
                mkh: this
            }
        });
        console.log(this);
        //log.set('mkh', this);
        /*  setInterval(() => {
             log.set('playersMap', playersMap);
             log.set('handlers', handlers);
         }, 2000); */
    }

    private eventListeners() {
        /**
        * renew accelerator handle, when Google music app launches
        */
        /* this.gpmsh.Event.on('startup', () => {
            this.reRegisterKeys();
        }); */

        /**
        * renew accelerator handle, when spotify launches
        */
        /* this.ssh.Event.on('startup', () => {
            this.reRegisterKeys();
        }); */

        ipc.on('storeget', (event: any) => {
            this.DefaultPlayer = this.Store.get('player');
            if (!this.CurrentPlayer.playing || this.CurrentPlayer.id === ' ') {
                this.CurrentPlayer.id = this.DefaultPlayer;
            }
            event.sender.send('asynchronous-reply', this.Store.get('player'));
        });
        ipc.on('storeSet', (_event: any, data: any) => {
            this.Store.set('player', data.data);
            this.DefaultPlayer = data.data;
            if (!this.CurrentPlayer.playing) {
                //this.updateMenuBar(data.mb);
                this.CurrentPlayer.id = this.DefaultPlayer;
            }
        });
    }

    private listenerIni() {
        handlerListener.setMaxListeners(150);
        handlerListener.on('playing', (message: Player) => {
            let tempPlayer = { id: message.id, title: message.title || message.id, playing: message.playing, plObj: message.plObj };
            this.setPlayers(tempPlayer);
        });

        handlerListener.on('running', (message: any) => {
            if (!message.running) {
                this.appQuit(message.id);
            }
        });

        for (let h of extHandlers) {
            handlers.push(new h(handlerListener));
        }

        for (let h of handlers) {
            h.init();
        }
    }

    private setPlayers(player: Player, plAct?: boolean) {
        if (player.id.includes('none')) {
            return;
        }
        const activatePlayer = plAct; //!player.playing && this.CurrentPlayer.id !== player.id && !this.CurrentPlayer.playing;
        const newPlayer = this.CurrentPlayer.id !== player.id && player.playing;
        const stateChange = this.CurrentPlayer.playing !== player.playing && this.CurrentPlayer.id === player.id;
        const titleChanged = this.CurrentPlayer.id === player.id && this.CurrentPlayer.title !== player.title;

        //console.log('player', player.id, 'activatePlayer', activatePlayer, 'newPlayer ', newPlayer, ' stateChange ', stateChange);
        if (stateChange || newPlayer || activatePlayer || titleChanged) {
            if (player.playing) {
                this.pause(player);
            }
            this.TouchbarItem = player.playing;
            this.CurrentPlayer = { id: player.id, title: player.title, playing: player.playing, plObj: player.plObj };
            this.updateMenuBar();
        }
    }

    //@ts-ignore
    private reRegisterKeys() {
        globalShortcut.unregisterAll();
        console.log('reregister');
        this.keyListenerIni();
    }

    /**
    * Returns a player-object
    * @param str
    */
    private getPlayerObject(str: string): any {
        for (let h of handlers) {
            if (h.Name === this.appName(str)) {
                return h;
            }
        }
        console.log('no player found');
    }

    private pause(player: Player) {
        //let currAppName = this.appName(player.id);
        playersMap.forEach((_value: [Date, Player], key: PlayerID) => {
            /* let appName = this.appName(key);
            let pl = this.getPlayerObject(appName); */
            if (key !== player.id) {
                //important for tray icon
                _value[1].playing = false;
                if (_value[1].plObj !== player.plObj) _value[1].plObj.pause();
            }
        });
        this.TouchbarItem = false;
    }

    private appName(playerName: string): string {
        let appName = utility.extractAppName(playerName);
        /* if (appName === 'none') {
            appName = this.DefaultPlayer;
        } */
        return appName;
    }

    private setDefaultPlayer() {
        this.DefaultPlayer = this.Store.get('player');
        if (this.DefaultPlayer && !this.getPlayerObject(this.DefaultPlayer).IsPlaying) {
            // tslint:disable-next-line:max-line-length
            this.CurrentPlayer = { id: this.DefaultPlayer, title: this.DefaultPlayer, playing: false, plObj: this.getPlayerObject(this.DefaultPlayer) };
            setTimeout(() => {
                this.updateMenuBar();
            }, 200);
        }
    }

    private evalDefaultPlayer() {
        setTimeout(() => {
            this.DefaultPlayer = this.Store.get('player');
            for (let h of handlers) {
                if (h.IsRunning && !this.CurrentPlayer.playing) {
                    if (h.Name === this.DefaultPlayer) {
                        this.setDefaultPlayer();
                    } else if (h.Name !== 'Chrome') {
                        this.CurrentPlayer = { id: h.Name, title: h.title, playing: false, plObj: this.getPlayerObject(h.Name) };
                    }
                }
            }
        }, 1000);
    }

    private appQuit(_playerName: PlayerID) {
        if (playersMap.has(_playerName)) {
            playersMap.delete(_playerName);
            playersMap.forEach(pl => { if (pl[1].id !== this.CurrentPlayer.id) pl[1].playing = false; });
        }

        if (playersMap.size === 0) {
            // tslint:disable-next-line:max-line-length
            this.CurrentPlayer = { id: this.DefaultPlayer, title: this.DefaultPlayer, playing: false, plObj: this.getPlayerObject(this.DefaultPlayer) };
        }
        utility.printMap('appQuit ', playersMap);
        this.updateMenuBar();
        //let menbarPl = utility.extractAppName(_playerName);
        /* if (!playersMap.has(_playerName) && menbarPl !== this.DefaultPlayer) {
        } */
    }
    //Methods called from main.ts

    /**
     * Raises player which is last(this.CurrentPlayer.id) in map
     */
    public activate(str?: string) {
        //console.log('med key Current ', this.CurrentPlayer.id);
        this.getPlayerObject(this.CurrentPlayer.id).activate(str);
    }

    public getPlayersMap(): Map<PlayerID, [Date, Player]> {
        return playersMap;
    }

    public changePlayer(playerName: string, playerTitle: string) {
        let pl = { id: playerName, title: playerTitle, playing: false, plObj: this.getPlayerObject(playerName) };
        this.CurrentPlayer.playing = false;
        this.pause(pl);
        this.setPlayers(pl, true);
        this.activate(playerName);
    }
    public updateMenuBar() {
        /*  let playerName: string = name.split(':').pop() || name;
         let playState = _state;
         if (playerName === this.DefaultPlayer) {
             playState = true;
         } */
        this.Event.emit('update', this.CurrentPlayer);
    }
}