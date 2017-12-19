'use strict';
import { EventEmitter } from 'events';
import { HandlerInterface, Running, Player } from '../utility/js/interfaces';
import { utility } from '../utility/js/utility';
import { SpotifyController } from '../utility/player-control/spotify/controller';
const spotify = new SpotifyController();

export class SpotifyStateHandler implements HandlerInterface {
    protected _isRunning: Running;
    protected _isPlaying: boolean;
    protected _event: EventEmitter;
    protected _name: string;

    constructor(ev: EventEmitter) {
        this.Event = ev;
        this.IsRunning = Running.False;
        this.IsPlaying = false;
        this.Name = 'Spotify';
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
        spotify.Playing.on((data: any) => {
            this.IsPlaying = data;
            const player: Player = { id: this.Name, title: this.Name, playing: data, plObj: this };
            this.Event.emit('playing', player);
        });
        //@ts-ignore
        spotify.Running.on((isRunning: boolean) => {
            this.IsRunning = utility.convertToRunningType(isRunning);
            this.Event.emit('running', { id: this.Name, running: isRunning, _dualP: false });
        });
    }

    activate(act: string) {
        spotify.activate(act);
    }

    pause() {
        spotify.pause();
    }

    play() {
        spotify.play();
    }

    next() {
        spotify.next();
    }

    previous() {
        spotify.previous();
    }
}