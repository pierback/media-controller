//@ts-ignore
import { app } from 'electron';
import { LiteEvent, ILiteEvent } from './../../js/emitter';
//@ts-ignore
import { PlayerStateMessage, Running } from './../../js/interfaces';
import { utility } from './../../js/utility';
import * as events from 'events';
import * as path from 'path';
import * as cp from 'child_process';
const spotifyControlPathMac = path.join(__dirname, 'applescript', 'spotifyControl.applescript');
const spotifyGetPlayStatePath = path.join(__dirname, 'applescript', 'spotifyGetPlayState.applescript');
const frontmostAppScptMac = path.join(__dirname, '..', '..', 'cmd', 'activateApp');
const em = require('playstate-addon');
const playcmd = new em.EventEmitter();

export class SpotifyController {
    protected _isRunning: Running;
    protected _isPlaying: boolean;
    protected _event: events;
    protected _title: string;
    lastActiveApp: string;
    running: boolean;

    private readonly onPlay = new LiteEvent<any>();
    private readonly onRunning = new LiteEvent<any>();

    constructor() {
        this.lastActiveApp = 'com.spotify.client';
        this.IsRunning = Running.False;
        this.IsPlaying = false;
        this.playstate();
    }

    public get Playing() { return this.onPlay.expose(); }
    public get Running() { return this.onRunning.expose(); }

    get IsPlaying(): boolean {
        return this._isPlaying;
    }

    set IsPlaying(state: boolean) {
        this._isPlaying = state;
    }

    get Title(): string {
        return this._title;
    }

    set Title(_title: string) {
        this._title = _title;
    }

    get IsRunning(): Running {
        return this._isRunning;
    }

    set IsRunning(val: Running) {
        this._isRunning = val;
    }

    get Event(): events {
        return this._event;
    }

    set Event(evt: events) {
        this._event = evt;
    }

    async playstate() {
        playcmd.on('change', (data) => {
            const res = utility.safelyParseJSON(data);
            const validState = res.state != null;
            const stateChanged = validState && this.IsPlaying !== res.state /* || res.title !== this.Title */;

            if (res === 'error' || res == null) return;
            if (res.running !== this.IsRunning && res.running != null) {
                this.IsRunning = res.running;
                this.onRunning.trigger(res.running);
            } else if (stateChanged) {
                console.log('res: ', res);
                this.IsPlaying = res.state;
                this.Title = res.title;
                this.onPlay.trigger({ playing: res.state, title: res.title });
            }
        });

        playcmd.run(spotifyGetPlayStatePath);

        app.on('will-quit', () => {
            console.log('stop: ');
            playcmd.stop();
        });
    }

    activate(activation: string = 'null') {
        if (activation !== 'null') this.lastActiveApp = 'com.spotify.client';
        let cmd: string = '';
        if (process.platform === 'darwin') {
            cmd = frontmostAppScptMac;
            let strings = [cmd, 'com.spotify.client', this.lastActiveApp];
            let activate = strings.join(' ');
            utility.lastActiveApp(activate)
                .then((data: string) => {
                    this.lastActiveApp = data;
                })
                .catch((data: string) => {
                    console.log(data);
                });
        }
    }

    pause() {
        //@ts-ignore
        let cmd: string = '';
        if (process.platform === 'darwin') {
            cmd = spotifyControlPathMac;
            utility.execCmd('osascript ' + spotifyControlPathMac + ' pause');
            //this.IsPlaying = false;
        }
    }

    play() {
        //@ts-ignore
        let cmd: string = '';
        if (process.platform === 'darwin') {
            cmd = spotifyControlPathMac;
            utility.execCmd('osascript ' + spotifyControlPathMac + ' play');
            //this.IsPlaying = true;
        }
    }

    next() {
        //@ts-ignore
        let cmd: string = '';
        if (process.platform === 'darwin') {
            cmd = spotifyControlPathMac;
            utility.execCmd('osascript ' + spotifyControlPathMac + ' next');
        }
    }

    previous() {
        //@ts-ignore
        let cmd: string = '';
        if (process.platform === 'darwin') {
            cmd = spotifyControlPathMac;
            utility.execCmd('osascript ' + spotifyControlPathMac + ' previous');
        }
    }
}

//@ts-ignore
function safelyParseJSON(json) {
    let parsed;
    try {
        let dataStr = json.toString();
        parsed = JSON.parse(dataStr);
    } catch (e) {
        parsed = { error: true };
    }
    return parsed;
}