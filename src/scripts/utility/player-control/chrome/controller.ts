//@ts-ignore
import { LiteEvent, ILiteEvent } from './../../js/emitter';
import { ChromeObj, ChromePlayer, Running } from './../../js/interfaces';
import { utility } from './../../js/utility';
import * as path from 'path';
import * as cp from 'child_process';

const chromeControlScptPath = path.join(__dirname, 'applescript', 'chromeControl.applescript');
const chromePlStateScptPath = path.join('..', 'player-control', 'chrome', 'applescript', 'chromePlayState.applescript');
const frontmostAppScpt = path.join(__dirname, '..', '..', 'cmd', 'activateApp');

let playerMap: Map<number, [Date, ChromePlayer]> = new Map<number, [Date, ChromePlayer]>();

export class ChromeController {
    protected _isRunning: Running;
    protected _isPlaying: boolean;
    protected _currentPlayer: ChromePlayer;
    protected _idleTab: string;
    protected _playingSites: Map<number, [Date, ChromePlayer]>;

    activeTab: string;
    lastActiveApp: string;
    curTab: { id: number, url: string };

    private readonly onPlay = new LiteEvent<any>();
    private readonly onRunning = new LiteEvent<any>();

    constructor() {
        //this.playingSites = [];
        this.ActiveTab = '';
        this.lastActiveApp = 'com.google.Chrome';
        this.IsPlaying = false;
        this.IsRunning = Running.False;
        this.CurrentPlayer = { id: -1, title: '', playing: false, url: '' };
        this.playstate();
    }

    public get Playing() { return this.onPlay.expose(); }
    public get Running() { return this.onRunning.expose(); }

    get IsPlaying(): boolean {
        return utility.undefinedToBoolean(this.CurrentPlayer.playing);
    }

    set IsPlaying(state: boolean) {
        this._isPlaying = state;
    }

    set ActiveTab(str: string) {
        this.activeTab = str;
    }

    get ActiveTab(): string {
        return this.activeTab;
    }

    get IsRunning(): Running {
        return this._isRunning;
    }

    set IsRunning(val: Running) {
        this._isRunning = val;
    }

    get IdleTab(): string {
        return this._idleTab;
    }

    set IdleTab(str: string) {
        this._idleTab = str;
    }

    /* get CurrentPlayer(): ChromePlayer {
        return this._currentPlayer;
    }

    set CurrentPlayer(_player: ChromePlayer) {
        //player has to be defined
        if (_player.title) { this._currentPlayer = _player; }
    } */

    get PlayingSites(): Map<number, [Date, ChromePlayer]> {
        return this._playingSites;
    }

    set PlayingSites(sites: Map<number, [Date, ChromePlayer]>) {
        this._playingSites = sites;
    }

    get CurrentPlayer(): ChromePlayer {
        let curPl: ChromePlayer = {
            id: -1, title: '', playing: false, url: ''
        };
        let maxDate: Date;
        playerMap.forEach((val, key) => {
            if (maxDate == null || val[0] > maxDate) {
                maxDate = val[0];
                let attr = val[1];
                curPl = { id: key, title: attr.title, playing: attr.playing, url: attr.url };
            }
        });
        return curPl;
    }

    set CurrentPlayer(player: ChromePlayer) {
        let plVal: [Date, ChromePlayer];
        plVal = [new Date(), { id: player.id || this.CurrentPlayer.id, title: player.title, playing: player.playing, url: player.url }];
        if (plVal[1] && plVal[1].id > -1)
            playerMap.set(plVal[1].id, plVal);
        //playersMap.set(_player.name, { title: _player.attr.title, playing: _player.attr.playing, dualP: _player.attr.dualP });
        //console.log(`ChromePlayer { name: ${this.CurrentPlayer.url}, playing: ${this.CurrentPlayer.playing}}`);
        utility.printMap('Chrome ', playerMap);
        console.log('');
    }

    checkTabs(result: ChromeObj): void {
        const tempMap = new Map(
            result.sites.map(x => [x.id, [new Date(), x]] as [number, [Date, ChromePlayer]])
        );
        if (this.PlayingSites) {
            this.PlayingSites.forEach((val, key) => {
                const found = tempMap.get(key);
                if (!found) {
                    this.onRunning.trigger({ title: val[1].title, id: key, running: false });
                    playerMap.delete(key);
                    console.log('deleted', val[1].title, ' new player', this.CurrentPlayer.title);
                }
            });
        }
        this.PlayingSites = tempMap;
    }

    playstate() {
        let helperProcess: cp.ChildProcess = utility.fork();
        let msg = { bin: '', args: '' };
        if (process.platform == 'darwin') {
            msg.bin = 'osascript';
            msg.args = chromePlStateScptPath;
        }
        if (!msg.bin) { return; }
        helperProcess.send(msg);

        helperProcess.on('message', (result: ChromeObj) => {
            if (result.error === 'error' || result == null) {
                helperProcess.unref();
                helperProcess.kill();
                this.playstate();
                return;
            }
            setTimeout(() => helperProcess.send(msg), 500);
            let tempRun = utility.convertToRunningType(result.isRunning);
            if (tempRun == Running.True) {
                this.checkTabs(result);
                if (this.playerStateChanged(result)) {
                    this.onPlay.trigger(this.CurrentPlayer);
                }
                this.IsRunning = tempRun;
            } else if (this.IsRunning !== tempRun /* && tab !== 'none' */) {
                //let tab = this.checkTabs(result);
                /* this.onPlay.trigger({ id: tab.id, title: tab.title, url: tab.url, playing: tab.playing });
                this.onRunning.trigger({ id: tab.id, title: tab.title, url: tab.url, playing: tab.playing, running: false }); */
                this.IsRunning = Running.Unknown;
            }
        });

        helperProcess.on('error', (_err: any) => {
            console.log('error chrome helper');
            helperProcess.send(msg);
        });
    }

    playerStateChanged(result: ChromeObj) {
        let newPlayer = false;
        let stateChanged = false;

        //stateChanged part
        if (!result.handleTab.id) {
            const curPl = this.PlayingSites.get(this.CurrentPlayer.id);
            if (curPl && this.CurrentPlayer.playing !== curPl[1].playing) {
                this.CurrentPlayer = curPl[1];
                stateChanged = true;
            }
        } else if (result.handleTab.id && this.CurrentPlayer.id === result.handleTab.id && this.CurrentPlayer.playing !== result.handleTab.playing) {
            this.CurrentPlayer = result.handleTab;
            stateChanged = true;
        } else if (result.handleTab.id && this.CurrentPlayer.id && this.CurrentPlayer.title !== result.handleTab.title) {
            console.log('title changed');
            this.CurrentPlayer = result.handleTab;
            stateChanged = true;
        }

        //newplayer part
        if (this.CurrentPlayer.id !== result.handleTab.id) {
            if (result.handleTab.playing) {
                newPlayer = true;
                playerMap.forEach(v => v[1].playing = false);
                this.CurrentPlayer = result.handleTab;
                this.pause(this.CurrentPlayer.url);
            } else {
                result.sites.forEach((v) => {
                    if (v.playing && v.id !== this.CurrentPlayer.id) {
                        newPlayer = true;
                        playerMap.forEach(v => v[1].playing = false);
                        this.CurrentPlayer = v;
                        this.pause(this.CurrentPlayer.url);
                    }
                });
            }
        }
        return stateChanged || newPlayer;
    }

    checkHandleTab(sites: Array<ChromePlayer>) {
        let tabClosed = true;
        let potentialPl: ChromePlayer;
        for (let pl of sites) {
            if (pl.id === this.CurrentPlayer.id) {
                tabClosed = false;
            }

            if (pl.playing) {
                potentialPl = pl;
            }
        }
        if (tabClosed) {
            console.log('tabClosed');
            this.onRunning.trigger({ title: this.CurrentPlayer.title, url: this.CurrentPlayer.url, running: false });
            this.onPlay.trigger({ title: `${this.CurrentPlayer.title}`, url: `${this.CurrentPlayer.url}`, playing: false });
            //@ts-ignore                        //no potential player take last one in sites || nothing in sites set player to none
            this.CurrentPlayer = potentialPl || [...sites].pop() || { id: -1, title: 'none', url: 'none', playing: false };
        }
    }

    setChromePlayer(player: ChromePlayer) {
        if (player.url === '' && player.playing === false) {
            this.CurrentPlayer.playing = false;
        } else {
            this.CurrentPlayer = player;
        }
    }
    evalHandlePlayer(): string {
        return this.CurrentPlayer.url;
    }

    /**
     * 'osascript + chromeControlScptPath + '{ action: activate, handleTab:  activeTab, prevTab: prevTab, lastActiveApp: lastActiveApp}'
     *  e.g.  'osascript + chromeControlScptPath + 'activate activeTab prevTab lastActiveApp'
     * */

    activate(playerName: any) {
        if (playerName) {
            let plId: number = parseInt(playerName.split(':').pop());
            if (plId && plId > -1) {
                //eval handle new PLAYER
                let playerProps = playerMap.get(plId);
                if (playerProps) {
                    this.CurrentPlayer = playerProps[1];
                    this.lastActiveApp = playerProps[1].url;
                    this.pause();
                }
            }
        }
        //TO-DO: Make difference between what lastActiveApp and what Applescript says --> implement this

        let activatePl: string = this.CurrentPlayer.url;
        //////////////////////////////////////////////////////
        let tab = encodeURIComponent(activatePl);
        let strings = [frontmostAppScpt, 'com.google.Chrome', tab, this.lastActiveApp];
        let activate = strings.join(' ');
        //console.log('activate ', activate);
        if (this.IsRunning == 1) {
            utility.lastActiveApp(activate)
                .then((data: string) => {
                    this.lastActiveApp = data;
                })
                .catch((data: string) => {
                    console.log(data);
                });
        }
    }

    /**
     *  - start playing of tabUrl in current 'activeTab' variable
     *  - manually set 'isPlaying' variable in case chrome is not frontmost, thus check interval is not running
     * */
    play() {
        let player = null;
        player = this.evalHandlePlayer();
        player === '' ? player = this.CurrentPlayer.url : player = this.evalHandlePlayer();
        //this.activeTab === this.playingSites[0] ? tab = encodeURIComponent(this.ActiveTab) : tab = encodeURIComponent(this.playingSites[0]);
        //console.log('play', this.CurrentPlayer, this.playingSites);
        let strings = ['osascript', chromeControlScptPath, 'play', this.CurrentPlayer.url];
        let playActiveTab = strings.join(' ');
        //console.log('paly', playActiveTab);
        if (this.IsRunning == Running.True) {
            utility.execCmd(playActiveTab);
        }
    }

    /**
     * - Pause either all streams or if input var is not null --> pause all except for given taburl
     * - manually set 'isPlaying' variable in case chrome is not frontmost, thus check interval is not running
     * */
    pause(url: string = 'null') {
        let tab: string;
        url === 'null' ? tab = url : tab = this.evalHandlePlayer();
        /* let player = { id: -1, url: '' };
        if (id !== 0) {
            player.id = this.CurrentPlayer.id;
            player.url = this.CurrentPlayer.url;
        } */
        let strings = ['osascript', chromeControlScptPath, 'pause', `${url} ${-1}`];
        let pause = strings.join(' ');
        //console.log('pause', pause);
        if (this.IsRunning == Running.True) {
            utility.execCmd(pause);
        }
    }

    next() {
        //let player = { id: -1, url: '' };
        this.evalHandlePlayer();

        let strings = ['osascript', chromeControlScptPath, 'next', `${this.CurrentPlayer.url} ${this.CurrentPlayer.id}`];
        let nextActiveTab = strings.join(' ');
        if (this.IsRunning == Running.True) {
            utility.execCmd(nextActiveTab);
        }
    }

    previous() {

        let strings = ['osascript', chromeControlScptPath, 'previous', `${this.CurrentPlayer.url} ${this.CurrentPlayer.id}`];
        let previousActiveTab = strings.join(' ');
        if (this.IsRunning == Running.True) {
            utility.execCmd(previousActiveTab);
        }
    }
}