'use strict';
import { EventEmitter } from 'events';
import { HandlerInterface, Running, Player } from '../utility/js/interfaces';
import { utility } from '../utility/js/utility';
import { ChromeController } from '../utility/player-control/chrome/controller';
const Chrome = new ChromeController();

export class ChromeStateHandler implements HandlerInterface {
    protected _isRunning: Running;
    protected _isPlaying: boolean;
    protected _event: EventEmitter;
    protected _name: string;

    constructor(ev: EventEmitter) {
        this.Event = ev;
        this.IsPlaying = false;
        this.IsRunning = Running.False;
        this.Name = 'Chrome';
    }

    get Name() {
        return this._name;
    }

    set Name(n: string) {
        this._name = n;
    }

    get Event(): EventEmitter {
        return this._event;
    }

    set Event(evt: EventEmitter) {
        this._event = evt;
    }

    get IsPlaying(): boolean {
        return this._isPlaying;
    }

    set IsPlaying(state: boolean) {
        this._isPlaying = state;
    }

    get IsRunning(): Running {
        return this._isRunning;
    }

    set IsRunning(val: Running) {
        this._isRunning = val;
    }

    get IsFrontmost(): boolean {
        let actWin = utility.ActiveApp();
        if (actWin === this.Name) {
            return true;
        } else {
            return false;
        }
    }

    public init() {
        try {
            this.checkPlaystate();
        } catch (e) {
            console.log(e);
        }
    }

    checkPlaystate() {
        try {
            Chrome.Playing.on((data: Player | any) => {
                this.IsPlaying = data.playing;
                const player: Player = { id: `${this.Name}:${data.id}`, title: data.title, playing: data.playing, plObj: this };
                this.Event.emit('playing', player);
            });
        } catch (e) {
            console.log(e);
        }

        try {
            Chrome.Running.on((data: any) => {
                this.IsRunning = utility.convertToRunningType(data.isRunning);
                this.Event.emit('running', { id: `${this.Name}:${data.id}`, running: data.isRunning, _dualP: false });
            });
        } catch (e) {
            console.log(e);
        }
    }

    activate(playerName: string) {
        Chrome.activate(playerName);
    }

    pause() {
        Chrome.pause();
    }

    play() {
        Chrome.play();
    }

    next() {
        Chrome.next();
    }

    previous() {
        Chrome.previous();
    }
}