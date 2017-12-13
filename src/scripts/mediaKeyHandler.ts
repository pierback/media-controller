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
let playersMap: Map<string, PlayerAttributes> = new Map<string, PlayerAttributes>();

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
        let lastEntry: Player = {
            name: ' ', attr: { playing: false, dualP: false }
        };
        let tempPA: any;

        for (let lastKey of playersMap.keys()) {
            tempPA = playersMap.get(lastKey);
            lastEntry.name = lastKey;
            lastEntry.attr.playing = tempPA.playing;
            lastEntry.attr.dualP = tempPA.dualP;
        }
        return lastEntry;
    }

    set DualPlayer(pl: Player) {
        this._dualPlayer = pl;
    }

    get DualPlayer(): Player {
        return this._dualPlayer;
    }

    set CurrentPlayer(_player: Player) {
        //player has to be defined
        if (_player.name != null) {
            //player is a dualPlayer
            //console.log('dualPlayer in set ', this.CurrentPlayer === _player);
            //player is no dualPlayer
            //new player is introduced --> no play/pause switch
            if (this.CurrentPlayer.name !== _player.name) {
                //player is already in playerList
                if (_player.attr.playing && playersMap.has(_player.name)) {
                    playersMap.delete(_player.name);
                }
            }
            //console.log('no dp in set ', _player);
            playersMap.set(_player.name, { playing: _player.attr.playing, dualP: _player.attr.dualP });

        }
        //console.log('DUAL', this.DualPlayer, ' <--> MONO ', this.CurrentPlayer);
        console.log('CurrentPlayer ', this.CurrentPlayer);
        console.log('');
    }

    evalHandlePlayer(player: Player): any {
        if (this.isDualPlayer()) {
            //dualplayer is not frontmost
            this.CurrentPlayer = this.DualPlayer;
            this.DualPlayer = { name: 'none', attr: { playing: false, dualP: true } };
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
        if (utility.extractPlayerName(this.CurrentPlayer.name) == utility.ActiveApp()) {//if (this.CurrentPlayer.name != utility.ActiveApp()) {
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
        this.DualPlayer = { name: 'none', attr: { playing: false, dualP: true } };
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
        handlerListener.setMaxListeners(50);
        handlerListener.on('playing', (message: PlayerMessage) => {
            let tempDualP = message._dualP;
            //no need to send _dualP-attribut if no sense
            if (tempDualP == null) { tempDualP = false; }
            let tempPlayer = { name: message.name, attr: { playing: message.state, dualP: tempDualP } };
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

    private setPlayers(player: Player) {
        if (this.evalPlayerType(player) === PlayerType.MONO) {
            if (player.name.includes('none')) {
                return;
            }
            if (player.attr.playing) {
                this.pause(player);
            }
            this.TouchbarItem = player.attr.playing;
            this.CurrentPlayer = { name: player.name, attr: { playing: player.attr.playing, dualP: player.attr.dualP } };
            this.updateMenuBar(player.name, this.CurrentPlayer.attr.playing);
        } else {
            if (this.DualPlayer.attr.playing) {
                this.evalHandlePlayer(this.DualPlayer).pause();
            }
            this.DualPlayer = { name: player.name, attr: { playing: player.attr.playing, dualP: player.attr.dualP } };
        }
    }

    private evalPlayerType(player: Player): PlayerType {
        if (player.attr.playing) {
            if (this.CurrentPlayer.attr.playing && player.attr.dualP) {
                return PlayerType.DUAL;
            } else {
                return PlayerType.MONO;
            }
        } else {
            //paused
            if (player.attr.dualP && player.name === this.DualPlayer.name) {
                return PlayerType.DUAL;
            } else {
                return PlayerType.MONO;
            }
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
            if (h.Name === this.fallbackPlayer(str)) {
                return h;
            }
        }
        console.log('no player found');
    }

    private pause(player: Player) {
        playersMap.forEach((_value: PlayerAttributes, key: string) => {

            let pl = this.getPlayerObject(this.fallbackPlayer(key));
            if (_value.dualP && _value.playing && this.CurrentPlayer.attr.dualP) {
                this.DualPlayer = { name: key, attr: { playing: true, dualP: true } };
                playersMap.delete(key);
            } else if (!key.includes(this.fallbackPlayer(player.name))) {
                pl.pause();
            }
        });
        this.TouchbarItem = false;
    }

    private fallbackPlayer(playerName: string): string {
        let curPlayer = utility.extractPlayerName(playerName);
        if (curPlayer === 'none') {
            curPlayer = this.DefaultPlayer;
        }
        return curPlayer;
    }

    private setDefaultPlayer() {
        this.DefaultPlayer = this.Store.get('player');
        if (this.DefaultPlayer && !this.getPlayerObject(this.DefaultPlayer).IsPlaying) {
            this.CurrentPlayer = { name: this.DefaultPlayer, attr: { playing: false, dualP: false } };
            setTimeout(() => {
                this.updateMenuBar(this.DefaultPlayer);
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
                        this.CurrentPlayer = { name: h.Name, attr: { playing: false, dualP: false } };
                    }
                }
            }
        }, 1000);
    }

    private appQuit(_player: string) {
        if (playersMap.has(_player))
            playersMap.delete(_player);

        if (playersMap.size === 0) {
            this.CurrentPlayer = { name: this.DefaultPlayer, attr: { playing: false, dualP: false } };
        }
        console.log('appQuit ', _player, this.CurrentPlayer, playersMap);

        let menbarPl = utility.extractPlayerName(_player);
        if (!playersMap.has(menbarPl) && menbarPl !== this.DefaultPlayer) {
            this.updateMenuBar(menbarPl, false);
        }
    }
    //Methods called from main.ts

    /**
     * Raises player which is last(this.CurrentPlayer.name) in map
     */
    public activate() {
        this.getPlayerObject(this.CurrentPlayer.name).activate();
    }

    public changePlayer(playerName: string) {
        let pl = { name: playerName, attr: { playing: false, dualP: false } };
        this.pause(pl);
        this.setPlayers(pl);
    }
    public updateMenuBar(str: string, _state?: boolean) {
        let player: string = this.fallbackPlayer(str);
        let playState = _state;
        if (player === this.DefaultPlayer) {
            playState = true;
        }
        this.Event.emit('update', player, playState);
    }
}