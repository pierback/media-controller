'use strict';
import { EventEmitter } from 'events';
import { utility } from './utility/js/utility';
import { Store } from './utility/js/store';
import { Player, PlayerMessage, PlayerAttributes, PlayerType } from './utility/js/interfaces';
import { app, globalShortcut, ipcMain as ipc } from 'electron';
//@ts-ignore
import * as MediaService from 'electron-media-service';
import { extHandlers } from './index';
const myService = new MediaService();
const handlerListener = new EventEmitter();

let handlers: Array<any> = [];
let playersMap: Map<string, [Date, PlayerAttributes]> = new Map<string, [Date, PlayerAttributes]>();

export class MediaKeyHandler {
    protected _store: Store;
    protected _event: EventEmitter;
    protected _defaultplayer: string;
    protected _bla: string;
    protected _dualPlayer: Player;

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
        let curPl: Player = {
            name: '', attr: { title: '', playing: false, dualP: false }
        };
        let maxDate: Date;
        playersMap.forEach((val, key) => {
            if (maxDate == null || val[0] > maxDate) {
                maxDate = val[0];
                let attr = val[1];
                curPl = {
                    name: key, attr: { title: attr.title, playing: attr.playing, dualP: false }
                };
            }
        });
        return curPl;
    }

    set DualPlayer(pl: Player) {
        this._dualPlayer = pl;
    }

    get DualPlayer(): Player {
        return this._dualPlayer;
    }

    set CurrentPlayer(_player: Player) {
        if (_player.name != null) {
            playersMap.set(_player.name, [new Date(), { title: _player.attr.title, playing: _player.attr.playing, dualP: _player.attr.dualP }]);
        }
        //playersMap.set(_player.name, { title: _player.attr.title, playing: _player.attr.playing, dualP: _player.attr.dualP });
        console.log(`CurrentPlayer { name: ${this.CurrentPlayer.name}, playing: ${this.CurrentPlayer.attr.playing}}`);
        console.log('');
    }

    evalHandlePlayer(player: Player): any {
        if (this.isDualPlayer()) {
            //dualplayer is not frontmost
            this.CurrentPlayer = this.DualPlayer;
            this.DualPlayer = { name: 'none', attr: { title: '', playing: false, dualP: true } };
            return this.getPlayerObject(this.CurrentPlayer.name);
        } else {
            if (player.name === ' ') {
                return this.getPlayerObject(this.DefaultPlayer);
            }
            return this.getPlayerObject(player.name);
        }
    }

    /**
     * Eval if Dualplayer is new Monoplayer
     */
    isDualPlayer(): boolean {
        return false;
        //@ts-ignore
        if (this.CurrentPlayer.attr.playing) {//if (!this.CurrentPlayer.attr.playing) {
            return false;
        }
        if (utility.extractAppName(this.CurrentPlayer.name) == utility.ActiveApp()) {//if (this.CurrentPlayer.name != utility.ActiveApp()) {
            return false;
        }
        if (!this.DualPlayer.attr.playing) {//if (this.DualPlayer.attr.playing) {
            return false;
        }
        if (this.getPlayerObject(this.DualPlayer.name).IsFrontmost) {//if (!this.getPlayerObject(this.DualPlayer.name).IsFrontmost) {
            return false;
        }
        return true;
    }

    private keyListenerIni() {
        globalShortcut.register('MediaPlayPause', () => {
            let player = this.evalHandlePlayer(this.CurrentPlayer);
            let state = player.IsPlaying;
            state === true ? player.pause() : player.play();
        });
        globalShortcut.register('MediaPreviousTrack', () => {
            this.evalHandlePlayer(this.CurrentPlayer).previous();
        });
        globalShortcut.register('MediaNextTrack', () => {
            let pl = this.evalHandlePlayer(this.CurrentPlayer);
            pl.next();
        });
        globalShortcut.register('command+F7', () => {
            let pl = this.evalHandlePlayer(this.CurrentPlayer);
            pl.activate();
        });
    }

    private init() {
        this.Store = '';
        this.DualPlayer = { name: 'none', attr: { title: '', playing: false, dualP: true } };
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
            if (!this.CurrentPlayer.attr.playing || this.CurrentPlayer.name === ' ') {
                this.CurrentPlayer.name = this.DefaultPlayer;
            }
            event.sender.send('asynchronous-reply', this.Store.get('player'));
        });
        ipc.on('storeSet', (_event: any, data: any) => {
            this.Store.set('player', data.data);
            this.DefaultPlayer = data.data;
            if (!this.CurrentPlayer.attr.playing) {
                //this.updateMenuBar(data.mb);
                this.CurrentPlayer.name = this.DefaultPlayer;
            }
        });
    }

    private listenerIni() {
        handlerListener.setMaxListeners(150);
        handlerListener.on('playing', (message: PlayerMessage) => {
            let tempDualP = message._dualP;
            //no need to send _dualP-attribut if no sense
            if (tempDualP == null) { tempDualP = false; }
            let tempPlayer = { name: message.name, attr: { title: message.title || message.name, playing: message.state, dualP: tempDualP } };
            this.setPlayers(tempPlayer);
        });

        handlerListener.on('running', (message: any) => {
            if (!message.running) {
                this.appQuit(message.name);
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
        if (player.name.includes('none')) {
            return;
        }
        const activatePlayer = plAct; //!player.attr.playing && this.CurrentPlayer.name !== player.name && !this.CurrentPlayer.attr.playing;
        const newPlayer = this.CurrentPlayer.name !== player.name && player.attr.playing;
        const stateChange = this.CurrentPlayer.attr.playing !== player.attr.playing && this.CurrentPlayer.name === player.name;

        //console.log('player', player.name, 'activatePlayer', activatePlayer, 'newPlayer ', newPlayer, ' stateChange ', stateChange);
        if (stateChange || newPlayer || activatePlayer) {
            if (player.attr.playing) {
                this.pause(player);
            }
            this.TouchbarItem = player.attr.playing;
            this.CurrentPlayer = { name: player.name, attr: { title: player.attr.title, playing: player.attr.playing, dualP: player.attr.dualP } };
            /* if (!activatePlayer)  */this.updateMenuBar(player.name, player.attr.title, player.attr.playing, false);
        } else {
            //playersMap.set(player.name, { playing: player.attr.playing, title: player.attr.title, dualP: false });
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
        let currAppName = this.appName(player.name);
        playersMap.forEach((_value: [Date, PlayerAttributes], key: string) => {
            let appName = this.appName(key);
            let pl = this.getPlayerObject(appName);
            if (key !== player.name) {
                //important for tray icon
                _value[1].playing = false;
                if (currAppName !== appName) pl.pause();
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
            this.CurrentPlayer = { name: this.DefaultPlayer, attr: { title: this.DefaultPlayer, playing: false, dualP: false } };
            setTimeout(() => {
                this.updateMenuBar(this.DefaultPlayer, this.DefaultPlayer, false, false);
            }, 200);
        }
    }

    private evalDefaultPlayer() {
        setTimeout(() => {
            this.DefaultPlayer = this.Store.get('player');
            for (let h of handlers) {
                if (h.IsRunning && !this.CurrentPlayer.attr.playing) {
                    if (h.Name === this.DefaultPlayer) {
                        this.setDefaultPlayer();
                    } else if (h.Name !== 'Chrome') {
                        this.CurrentPlayer = { name: h.Name, attr: { title: h.title, playing: false, dualP: false } };
                    }
                }
            }
        }, 1000);
    }

    private appQuit(_playerName: string) {
        if (playersMap.has(_playerName)) {
            playersMap.delete(_playerName);
            playersMap.forEach(pl => pl[1].playing = false);
            console.log('deleted', _playerName);
        }

        if (playersMap.size === 0) {
            this.CurrentPlayer = { name: this.DefaultPlayer, attr: { title: this.DefaultPlayer, playing: false, dualP: false } };
        }
        console.log('appQuit ', playersMap);

        let menbarPl = utility.extractAppName(_playerName);
        if (!playersMap.has(_playerName) && menbarPl !== this.DefaultPlayer) {
            this.updateMenuBar(menbarPl, '', false, true);
        }
    }
    //Methods called from main.ts

    /**
     * Raises player which is last(this.CurrentPlayer.name) in map
     */
    public activate(str?: string) {
        //console.log('med key Current ', this.CurrentPlayer.name);
        this.getPlayerObject(this.CurrentPlayer.name).activate(str);
    }

    public getPlayersMap(): Map<string, [Date, PlayerAttributes]> {
        return playersMap;
    }

    public changePlayer(playerName: string, playerTitle: string) {
        let pl = { name: playerName, attr: { title: playerTitle, playing: false, dualP: false } };
        this.CurrentPlayer.attr.playing = false;
        this.pause(pl);
        this.setPlayers(pl, true);
        this.activate(playerName);
    }
    public updateMenuBar(name: string, title: string, _state?: boolean, deleteItem?: boolean) {
        /*  let playerName: string = name.split(':').pop() || name;
         let playState = _state;
         if (playerName === this.DefaultPlayer) {
             playState = true;
         } */
        this.Event.emit('update');
    }
}