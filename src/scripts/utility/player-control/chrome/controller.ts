//@ts-ignore
import { LiteEvent, ILiteEvent } from './../../js/emitter';
import { HandlerInterface, ChromeObj, ChromePlayerObj, Running, Player, PlayerAttributes, PlayerStateMessage } from './../../js/interfaces';
import { utility } from './../../js/utility';
import * as path from 'path';
import * as cp from 'child_process';
import { lchmod } from 'original-fs';

const chromeControlScptPath = path.join(__dirname, 'applescript', 'chromeControl.applescript');
const chromePlStateScptPath = path.join('..', 'player-control', 'chrome', 'applescript', 'chromePlayState.applescript');
const frontmostAppScpt = path.join(__dirname, '..', '..', 'cmd', 'activateApp');

export class ChromeController {
    protected _isRunning: Running;
    protected _isPlaying: boolean;
    protected _dualPlayer: ChromePlayerObj;
    protected _currentPlayer: ChromePlayerObj;
    protected _idleTab: string;
    playingSites: Array<ChromePlayerObj>;
    activeTab: string;
    lastActiveApp: string;
    curTab: { id: number, url: string };

    private readonly onPlay = new LiteEvent<any>();
    private readonly onRunning = new LiteEvent<any>();

    constructor() {
        this.playingSites = [];
        this.ActiveTab = '';
        this.lastActiveApp = 'com.google.Chrome';
        this.IsPlaying = false;
        this.IsRunning = Running.False;
        this.DualPlayer = { id: -1, title: 'none', url: 'none', playing: false };
        this.CurrentPlayer = { id: -1, title: 'none', url: 'none', playing: false };
        this.playstate();
    }

    public get Playing() { return this.onPlay.expose(); }
    public get Running() { return this.onRunning.expose(); }

    get IsPlaying(): boolean {
        if (this.CurrentPlayer.url === this.evalHandlePlayer()) {
            return utility.undefinedToBoolean(this.CurrentPlayer.playing);
        } else {
            return utility.undefinedToBoolean(this.DualPlayer.playing);
        }
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

    get CurrentPlayer(): ChromePlayerObj {
        return this._currentPlayer;
    }

    set DualPlayer(pl: ChromePlayerObj) {
        this._dualPlayer = pl;
    }

    get DualPlayer(): ChromePlayerObj {
        return this._dualPlayer;
    }

    set CurrentPlayer(_player: ChromePlayerObj) {
        //player has to be defined
        if (_player.title) { this._currentPlayer = _player; }
    }

    evalHandleTab(result: ChromeObj): ChromePlayerObj {
        if (result.handleTab.id) {
            return result.handleTab;
        } else {  /* if (result.sites && result.sites.length > 0) { */
            let initPl = { id: -1, title: 'none', url: 'none', playing: false };
            for (let pl of result.sites) {
                if (pl.id === this.CurrentPlayer.id) {
                    return pl;
                }
                if (pl.playing) {
                    initPl = { id: pl.id, title: pl.title, url: pl.url, playing: pl.playing };
                }
            }
            //if initCase and some player is playing || nothing playing in initCase or tab was closed
            return initPl;
        } /* else {
            return this.CurrentPlayer;
        } */
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
            //let _dp = this.evalPrio(result.handleUrl);
            let _dp = false;
            this.playingSites = result.sites;
            this.curTab = result.activeTab;

            if (tempRun == Running.True) {
                if (this.playerStateChanged(result, _dp)) {
                    let tab = this.evalHandleTab(result);
                    if (tab.id === -1) {
                        console.log('tab closed', this.CurrentPlayer);
                        this.onPlay.trigger({ title: this.CurrentPlayer.title, id: this.CurrentPlayer.id, playing: false });
                        this.onRunning.trigger({ title: this.CurrentPlayer.title, id: this.CurrentPlayer.id, running: false });
                        this.setChromePlayer([...result.sites].pop() || { id: -1, title: 'none', url: 'none', playing: false }, _dp);
                    } else {
                        this.onPlay.trigger({ id: tab.id, title: tab.title, url: tab.url, playing: tab.playing });
                        let prevId = this.CurrentPlayer.id;
                        this.setChromePlayer(tab, _dp);
                        if (prevId !== result.handleTab.id) { this.pause(this.CurrentPlayer.url); }
                    }
                }
                this.IsRunning = tempRun;
                this.IsPlaying = result.handleTab.playing || false;
            } else if (this.IsRunning !== tempRun /* && tab !== 'none' */) {
                let tab = this.evalHandleTab(result);
                this.onPlay.trigger({ id: tab.id, title: tab.title, url: tab.url, playing: tab.playing });
                this.onRunning.trigger({ id: tab.id, title: tab.title, url: tab.url, playing: tab.playing, running: false });
                this.IsRunning = Running.Unknown;
            }
        });

        helperProcess.on('error', (_err: any) => {
            console.log('error chrome helper');
            helperProcess.send(msg);
        });
    }

    playerStateChanged(result: ChromeObj, dualP: boolean) {
        // && (this.CurrentPlayer.name === 'none' && result.sites && this.playingSites.length > 0);
        //const handleTab = result.handleTab.url ? // result.sites ?  : result.idleTabUrl;
        let initCase = false; //result.handleTab.playing && result.handleTab.url !== '';

        let handleTabState = false;

        result.sites.forEach((v) => {
            if (v.id === this.CurrentPlayer.id) {
                handleTabState = v.playing || false;
            }
            if (result.handleTab.id == null && this.CurrentPlayer.id === -1) {
                if (v.playing) {
                    initCase = true;
                }
            }
        });

        const stateChanged = this.CurrentPlayer.playing !== handleTabState;
        const newPlayer = this.CurrentPlayer.id !== result.handleTab.id && result.handleTab.playing; //&& result.handleTab.url !== '';
        const allTabsClosed = result.sites.length === 0 || this.CurrentPlayer.title !== 'none';

        //if (newPlayer)
        //console.log(`stateChanged ${stateChanged} newPlayer ${newPlayer}`);
        //console.log(result.sites);

        if (!dualP) {
            return initCase || stateChanged || newPlayer || allTabsClosed;
        } else {
            return false;
            /* if (this.DualPlayer.attr.playing === !result.play || (this.DualPlayer.name !== result.handleUrl && result.play)
                || this.DualPlayer.name === 'none') {
                return true;
            } else { return false; } */
        }
    }

    checkHandleTab(sites: Array<ChromePlayerObj>) {
        let tabClosed = true;
        let potentialPl: ChromePlayerObj;
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

    /**
     * Eval if Dualplayer is new Monoplayer
     */
    isDualPlayer(): boolean {
        return false;
        //@ts-ignore
        if (this.CurrentPlayer.attr.playing) {//if (!this.CurrentPlayer.attr.playing) {
            return false;
        }
        //@ts-ignore
        if (this.CurrentPlayer.name == this.curTab) {//if (this.CurrentPlayer.name != utility.ActiveApp()) {
            return false;
        }
        //@ts-ignore
        if (!this.DualPlayer.attr.playing) {//if (this.DualPlayer.attr.playing) {
            return false;
        }
        /* if (this.IsFrontmost) {//if (!this.getPlayerObject(this.DualPlayer.name).IsFrontmost) {
            return false;
        } */
        return true;
    }

    setChromePlayer(player: ChromePlayerObj, _dual: boolean) {
        if (_dual) {
            if (player.url === '' && player.playing === false) {
                this.DualPlayer.playing = false;
            } else {
                this.DualPlayer = player;
            }
        } else {
            if (player.url === '' && player.playing === false) {
                this.CurrentPlayer.playing = false;
            } else {
                this.CurrentPlayer = player;
            }
        }
    }

    evalPrio(tab: string) {
        //TODO:read prio list from json file
        return false;
        //@ts-ignore
        if (tab.includes('sky')) {
            if (tab.includes('sport')) {
                return true;
            } else {
                return false;
            }
        } else if (tab.includes('dazn')) {
            return true;
        } else {
            return false;
        }
    }

    evalHandlePlayer(): string {
        if (this.isDualPlayer()) {
            //dualplayer is not frontmost
            return this.DualPlayer.url;
        } else {
            return this.CurrentPlayer.url;
        }
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
                for (let pl of this.playingSites) {
                    if (plId === pl.id) {
                        this.CurrentPlayer = pl;
                        this.lastActiveApp = pl.url;
                        console.log('playername', playerName, this.CurrentPlayer);
                        this.pause();
                    }
                }
            }
        }
        //TO-DO: Make difference between what lastActiveApp and what Applescript says --> implement this

        let activatePl: string = this.CurrentPlayer.url;
        //////////////////////////////////////////////////////
        let tab = encodeURIComponent(activatePl);
        let strings = [frontmostAppScpt, 'com.google.Chrome', tab, this.lastActiveApp];
        let activate = strings.join(' ');
        console.log('activate ', activate);
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
        let player = { id: -1, url: '' };
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