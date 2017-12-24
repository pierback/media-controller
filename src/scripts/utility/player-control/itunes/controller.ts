//@ts-ignore
import { LiteEvent, ILiteEvent } from './../../js/emitter';
//@ts-ignore
import { Running, PlayerStateMessage } from './../../js/interfaces';
import { utility } from './../../js/utility';
import * as path from 'path';
import * as cp from 'child_process';
const itunesControlPathMac = path.join(__dirname, 'applescript', 'itunesControl.applescript');
const frontmostAppScptMac = path.join(__dirname, '..', '..', 'cmd', 'activateApp');

export class ItunesController {
    protected _isRunning: Running;
    protected _isPlaying: boolean;
    protected _title: string;
    lastActiveApp: string;
    running: boolean;

    private readonly onPlay = new LiteEvent<any>();
    private readonly onRunning = new LiteEvent<boolean>();

    constructor() {
        this.lastActiveApp = 'com.apple.iTunes';
        this.IsRunning = Running.False;
        this._isPlaying = false;
        this.playstate();
    }

    public get Playing() { return this.onPlay.expose(); }
    public get Running() { return this.onRunning.expose(); }

    get Title(): string {
        return this._title;
    }

    set Title(_title: string) {
        this._title = _title;
    }

    get IsPlaying(): boolean {
        return this._isPlaying;
    }

    set IsPlaying(state1: boolean) {
        this._isPlaying = state1;
    }

    get IsRunning(): Running {
        return this._isRunning;
    }

    set IsRunning(val: Running) {
        this._isRunning = val;
    }

    playstate() {
        const helperProcess: cp.ChildProcess = utility.fork();
        let msg = { bin: '', args: '' };
        if (process.platform == 'darwin') {
            msg.bin = 'osascript';
            msg.args = path.join('..', 'player-control', 'itunes', 'applescript', 'itunesGetPlayState.applescript');
        }
        if (!msg.bin) { this.onPlay.trigger(false); return; }
        helperProcess.send(msg);

        helperProcess.on('message', (res: any) => {
            setTimeout(() => helperProcess.send(msg), 700);
            if (res === 'error' || res == null) { return; }
            if (res.running !== this.IsRunning && res.running != null) {
                this.IsRunning = res.running;
                this.onRunning.trigger(res.running);
            } else if (res.state != null && (this.IsPlaying !== res.state || res.title !== this.Title)) {
                this.IsPlaying = res.state;
                this.Title = res.title;
                this.onPlay.trigger({ playing: res.state, title: res.title });
            }
        });

        helperProcess.on('error', (_err: any) => {
            console.log('error itunes helper', _err);
            helperProcess.disconnect();
        });

        helperProcess.on('disconnect', (_err: any) => {
            console.log('RESTART itunes helper', _err);
            helperProcess.unref();
            helperProcess.kill();
            setTimeout(this.playstate, 3000);
        });
    }

    activate(activation: string = 'null') {
        if (activation !== 'null') this.lastActiveApp = 'com.apple.iTunes';
        let cmd: string = '';
        if (process.platform === 'darwin') {
            cmd = frontmostAppScptMac;
            let strings = [cmd, 'com.apple.iTunes', this.lastActiveApp];
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
            cmd = itunesControlPathMac;
            utility.execCmd('osascript ' + itunesControlPathMac + ' pause');
        }
    }

    play() {
        //@ts-ignore
        let cmd: string = '';
        if (process.platform === 'darwin') {
            cmd = itunesControlPathMac;
            utility.execCmd('osascript ' + itunesControlPathMac + ' play');
        }
    }

    next() {
        //@ts-ignore
        let cmd: string = '';
        if (process.platform === 'darwin') {
            cmd = itunesControlPathMac;
            utility.execCmd('osascript ' + itunesControlPathMac + ' next');
        }
    }

    previous() {
        //@ts-ignore
        let cmd: string = '';
        if (process.platform === 'darwin') {
            cmd = itunesControlPathMac;
            utility.execCmd('osascript ' + itunesControlPathMac + ' previous');
        }
    }
}