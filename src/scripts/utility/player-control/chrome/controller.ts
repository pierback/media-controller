//@ts-ignore
import { LiteEvent, ILiteEvent } from './../../js/emitter';
//@ts-ignore
import { HandlerInterface, ChromeObj, Running, Player, PlayerAttributes, PlayerStateMessage } from './../../js/interfaces';
import { utility } from './../../js/utility';
import * as path from 'path';
import * as cp from 'child_process';

const chromeControlScptPath = path.join(__dirname, 'applescript', 'chromeControl.applescript');
const chromePlStateScptPath = path.join('..', 'player-control', 'chrome', 'applescript', 'chromePlayState.applescript');
const frontmostAppScpt = path.join(__dirname, '..', '..', 'cmd', 'activateApp');

export class ChromeController {
    protected _isRunning: Running;
    protected _isPlaying: boolean;
    protected _dualPlayer: Player;
    protected _currentPlayer: Player;
    protected _idleTab: string;
    playingSites: Array<string>;
    activeTab: string;
    lastActiveApp: string;
    curTab: string;

    private readonly onPlay = new LiteEvent<Player>();
    private readonly onRunning = new LiteEvent<Object>();

    constructor() {
        this.playingSites = [];
        this.ActiveTab = '';
        this.lastActiveApp = 'com.google.Chrome';
        this.IsPlaying = false;
        this.IsRunning = Running.False;
        this.DualPlayer = { name: 'none', attr: { playing: false, dualP: true } };
        this.CurrentPlayer = { name: 'none', attr: { playing: false, dualP: false } };
        this.playstate();
    }

    public get Playing() { return this.onPlay.expose(); }
    public get Running() { return this.onRunning.expose(); }

    get IsPlaying(): boolean {
        if (this.CurrentPlayer.name === this.evalHandlePlayer()) {
            return utility.undefinedToBoolean(this.CurrentPlayer.attr.playing);
        } else {
            return utility.undefinedToBoolean(this.DualPlayer.attr.playing);
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

    get CurrentPlayer(): Player {
        return this._currentPlayer;
    }

    set DualPlayer(pl: Player) {
        this._dualPlayer = pl;
    }

    get DualPlayer(): Player {
        return this._dualPlayer;
    }

    set CurrentPlayer(_player: Player) {
        //player has to be defined
        if (_player.name) { this._currentPlayer = _player; }
    }

    evalHandleTab(result: ChromeObj): string {
        if (result.handleUrl) {
            return result.handleUrl;
        } else if (result.sites && result.sites.length > 0) {
            //consider last in array as handleplayer
            return result.sites[result.sites.length - 1];
        } else {
            return this.CurrentPlayer.name;
        }
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

        helperProcess.on('message', (result: any) => {
            if (result === 'error' || result == null) {
                helperProcess.unref();
                helperProcess.kill();
                this.playstate();
                return;
            }
            setTimeout(() => helperProcess.send(msg), 500);
            let tempRun = utility.convertToRunningType(result.isRunning);
            let _dp = this.evalPrio(result.handleUrl);
            let tab = this.evalHandleTab(result);
            this.playingSites = result.sites;
            this.curTab = result.activeTabUrl;
            this.IdleTab = result.idleTabUrl;

            if (tempRun == Running.True) {
                if (this.playerStateChanged(result, _dp)) {
                    this.onPlay.trigger({ name: `${tab}`, attr: { playing: result.play, dualP: _dp } });
                    if (!_dp) {
                        this.setChromePlayer(tab, result.play, _dp);
                        if (this.CurrentPlayer.name !== result.handleUrl) { this.pause(this.CurrentPlayer.name); }
                        if (!this.CurrentPlayer.attr.playing && result.handleUrl === '' && result.sites && result.sites.length === 0) {
                            this.checkHandleTab();
                        }
                    } else {
                        if (this.DualPlayer.name !== result.handleUrl) {
                            this.setChromePlayer(result.handleUrl, result.play, _dp);
                            this.pause(this.DualPlayer.name);
                        }
                    }
                }
                this.IsRunning = tempRun;
                this.IsPlaying = result.play;
            } else if (this.IsRunning !== tempRun && tab !== 'none') {
                this.onPlay.trigger({ name: `${tab}`, attr: { playing: result.play, dualP: _dp } });
                this.onRunning.trigger({ name: `${tab}`, running: false });
                this.IsRunning = Running.Unknown;
            }
        });

        helperProcess.on('error', (_err: any) => {
            console.log('error chrome helper');
            helperProcess.send(msg);
        });
    }

    playerStateChanged(result: ChromeObj, dualP: boolean) {
        const initCase = result.play && (this.CurrentPlayer.name === 'none' && this.playingSites && this.playingSites.length > 0);
        const handleTab = result.sites ? result.sites[0] : result.idleTabUrl;
        const samePlayer = result.play ? this.CurrentPlayer.name === handleTab : result.handleUrl === '';
        const stateChanged = this.CurrentPlayer.attr.playing !== result.play;
        const newPlayer = this.CurrentPlayer.name !== result.handleUrl && result.play && result.handleUrl !== '';

        if (!dualP) {
            return initCase || (stateChanged && samePlayer) || newPlayer;
        } else {
            if (this.DualPlayer.attr.playing === !result.play || (this.DualPlayer.name !== result.handleUrl && result.play)
                || this.DualPlayer.name === 'none') {
                return true;
            } else { return false; }
        }
    }

    checkHandleTab() {
        const bin = 'osascript';
        const args = [chromeControlScptPath, 'handlertab', this.CurrentPlayer.name];
        if (this.IsRunning == 1 && this.CurrentPlayer.name && this.CurrentPlayer.name !== 'none') {
            utility.callbackCmd(bin, args)
                .then((data: any) => {
                    if (!data.handletab) {
                        this.onRunning.trigger({ name: `${this.CurrentPlayer.name}`, running: false });
                        if (this.playingSites.length === 0 && !this.IdleTab) {
                            this.CurrentPlayer.name = 'none';
                        } else {
                            this.playingSites.length === 0 ? this.CurrentPlayer.name = this.IdleTab : this.CurrentPlayer.name = this.playingSites[0];
                            this.onPlay.trigger({ name: `${this.CurrentPlayer.name}`, attr: { playing: false, dualP: false } });
                        }
                        this.CurrentPlayer.attr.playing = false;
                    }
                }).catch((_result) => {
                    console.log('chrome error checkHandleTab');
                });
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
        if (this.CurrentPlayer.name == this.curTab) {//if (this.CurrentPlayer.name != utility.ActiveApp()) {
            return false;
        }
        if (!this.DualPlayer.attr.playing) {//if (this.DualPlayer.attr.playing) {
            return false;
        }
        /* if (this.IsFrontmost) {//if (!this.getPlayerObject(this.DualPlayer.name).IsFrontmost) {
            return false;
        } */
        return true;
    }

    setChromePlayer(_name: string, _state: boolean, _dual: boolean) {
        if (_dual) {
            if (_name === '' && _state === false) {
                this.DualPlayer.attr.playing = false;
            } else {
                this.DualPlayer = { name: _name, attr: { playing: _state, dualP: _dual } };
            }
        } else {
            if (_name === '' && _state === false) {
                this.CurrentPlayer.attr.playing = false;
            } else {
                this.CurrentPlayer = { name: _name, attr: { playing: _state, dualP: _dual } };
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
            return this.DualPlayer.name;
        } else {
            return this.CurrentPlayer.name;
        }
    }

    /**
     * 'osascript + chromeControlScptPath + '{ action: activate, handleTab:  activeTab, prevTab: prevTab, lastActiveApp: lastActiveApp}'
     *  e.g.  'osascript + chromeControlScptPath + 'activate activeTab prevTab lastActiveApp'
     * */

    activate() {
        let player = null;
        if (!this.evalHandlePlayer()) {
            player = this.CurrentPlayer.name;
        } else {
            player = this.evalHandlePlayer();
        }
        let tab = encodeURIComponent(player);
        let strings = [frontmostAppScpt, 'com.google.Chrome', tab, this.lastActiveApp];
        let activate = strings.join(' ');
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
        player === '' ? player = this.CurrentPlayer.name : player = this.evalHandlePlayer();
        //this.activeTab === this.playingSites[0] ? tab = encodeURIComponent(this.ActiveTab) : tab = encodeURIComponent(this.playingSites[0]);
        let strings = ['osascript', chromeControlScptPath, 'play', player];
        let playActiveTab = strings.join(' ');
        if (this.IsRunning == Running.True) {
            utility.execCmd(playActiveTab);
        }
    }

    /**
     * - Pause either all streams or if input var is not null --> pause all except for given taburl
     * - manually set 'isPlaying' variable in case chrome is not frontmost, thus check interval is not running
     * */
    pause(str = 'null') {
        let tab: string;
        str === 'null' ? tab = str : tab = this.evalHandlePlayer();
        let strings = ['osascript', chromeControlScptPath, 'pause', str];
        let pause = strings.join(' ');
        if (this.IsRunning == Running.True) {
            utility.execCmd(pause);
        }
    }

    next() {
        let strings = ['osascript', chromeControlScptPath, 'next', this.evalHandlePlayer()];
        let nextActiveTab = strings.join(' ');
        if (this.IsRunning == Running.True) {
            utility.execCmd(nextActiveTab);
        }
    }

    previous() {
        let strings = ['osascript', chromeControlScptPath, 'previous', this.evalHandlePlayer()];
        let previousActiveTab = strings.join(' ');
        if (this.IsRunning == Running.True) {
            utility.execCmd(previousActiveTab);
        }
    }
}