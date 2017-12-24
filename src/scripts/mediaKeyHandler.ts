'use strict';
import { EventEmitter } from 'events';
import { utility } from './utility/js/utility';
import { Store } from './utility/js/store';
import { Player, PlayerID } from './utility/js/interfaces';
import { app, globalShortcut, ipcMain as ipc, dialog } from 'electron';
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
        let curPl: Player;
        if (!playersMap) {
            console.log('no player');
            this.DefaultPlayer = this.Store.get('player');
            curPl = {
                id: this.DefaultPlayer, title: this.DefaultPlayer, playing: false, plObj: this.getPlayerObject(this.DefaultPlayer)
            };
        } else {
            //@ts-ignore
            curPl = {
                id: 'none', title: '', playing: false, plObj: null
            };
        }
        let maxDate: Date;
        if (playersMap) {
            playersMap.forEach((val, key) => {
                if (maxDate == null || val[0] > maxDate) {
                    maxDate = val[0];
                    let attr = val[1];
                    curPl = {
                        id: key, title: attr.title, playing: attr.playing, plObj: attr.plObj
                    };
                }
            });
        }
        return curPl;
    }

    set CurrentPlayer(_player: Player) {
        if (_player.id) {
            playersMap.set(_player.id, [new Date(), { id: _player.id, title: _player.title, playing: _player.playing, plObj: _player.plObj }]);
        }
        console.log(`CurrentPlayer { id: ${this.CurrentPlayer.id}, playing: ${this.CurrentPlayer.playing}}`);
        console.log('');
    }

    private keyListenerIni() {
        globalShortcut.register('MediaPlayPause', () => {
            if (!this.evalHandlePlayer()) return;
            let player = this.CurrentPlayer.plObj;
            let state = player.IsPlaying;
            state === true ? player.pause() : player.play();
        });
        globalShortcut.register('MediaPreviousTrack', () => {
            const run = this.evalHandlePlayer() && this.CurrentPlayer.plObj.previous();
        });
        globalShortcut.register('MediaNextTrack', () => {
            const run = this.evalHandlePlayer() && this.CurrentPlayer.plObj.next();
        });
        globalShortcut.register('command+F7', () => {
            const run = this.evalHandlePlayer() && this.CurrentPlayer.plObj.activate();
        });
    }

    showDialog(): void {
        if (playersMap.size < 1) {
            dialog.showErrorBox('No open player', '');
        }
    }

    private init() {
        this.Store = '';
        myService.startService();
        app.on('ready', () => {
            this.listenerIni();
            this.keyListenerIni();
            this.eventListeners();
            this.updateMenuBar();
        });

        app.on('will-quit', () => {
            globalShortcut.unregisterAll();
        });
    }

    private eventListeners() {
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
            let tempPlayer = { id: message.id, title: message.title, playing: message.playing, plObj: message.plObj };
            this.setPlayers(tempPlayer);
        });

        handlerListener.on('running', (message: any) => {
            if (!message.running) {
                this.playerQuit(message.id);
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
        if (player.id.includes('none')) return;

        const activatePlayer = plAct;
        const newPlayer = this.CurrentPlayer.id !== player.id && player.playing;
        const stateChange = this.CurrentPlayer.playing !== player.playing && this.CurrentPlayer.id === player.id;
        const titleChanged = this.CurrentPlayer.id === player.id && this.CurrentPlayer.title !== player.title;

        if (stateChange || newPlayer || activatePlayer || titleChanged) {
            this.CurrentPlayer = { id: player.id, title: player.title, playing: player.playing, plObj: player.plObj };
            if (player.playing) {
                this.pause(player);
            }
            this.TouchbarItem = player.playing;
            this.updateMenuBar();
            this.Event.emit('notification');
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
        if (playersMap && playersMap.size > 1) {
            playersMap.forEach((_value: [Date, Player], key: PlayerID) => {
                if (key !== player.id) {
                    //important for tray icon
                    _value[1].playing = false;
                    if (_value[1] && _value[1].plObj !== player.plObj) _value[1].plObj.pause();
                }
            });
        }
        this.TouchbarItem = false;
    }

    private appName(playerName: string): string {
        return utility.extractAppName(playerName);
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

    private evalHandlePlayer(): boolean {
        this.DefaultPlayer = this.Store.get('player');
        let playerRunning = true;
        if (playersMap.size < 1) {
            playerRunning = false;
            for (let h of handlers) {
                if (h.IsRunning) {
                    if (h.Name === this.DefaultPlayer) {
                        this.setDefaultPlayer();
                        playerRunning = true;
                    } else if (h.Name !== 'Chrome') {
                        this.CurrentPlayer = { id: h.Name, title: h.title, playing: false, plObj: this.getPlayerObject(h.Name) };
                        playerRunning = true;
                    }
                }
            }
        }
        //raise dialog if no player is running
        if (!playerRunning) this.showDialog();
        return playerRunning;
    }

    private playerQuit(_playerName: PlayerID) {
        if (playersMap.has(_playerName)) {
            playersMap.delete(_playerName);
            playersMap.forEach(pl => { if (pl[1].id !== this.CurrentPlayer.id) pl[1].playing = false; });
            if (!this.CurrentPlayer.playing) this.TouchbarItem = false;
        }
        utility.printMap('playerQuit ', playersMap);
        this.updateMenuBar();
    }
    //Methods called from main.ts

    /**
     * Raises player which is last(this.CurrentPlayer.id) in map
     */
    public activate(str?: string) {
        const run = this.evalHandlePlayer() && this.getPlayerObject(this.CurrentPlayer.id).activate(str);
    }

    public getPlayersMap(): Map<PlayerID, [Date, Player]> {
        return playersMap;
    }

    public changePlayer(playerName: string, _playerTitle?: string) {
        let pl = playersMap.get(playerName) as [Date, Player];
        this.CurrentPlayer.playing = false;
        this.pause(pl[1]);
        this.setPlayers(pl[1], true);
        this.activate(playerName);
    }
    public updateMenuBar() {
        this.Event.emit('update');
    }
}