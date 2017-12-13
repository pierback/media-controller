'use strict';
import { EventEmitter } from 'events';

export enum Running {
    False,
    True,
    Unknown
}

export enum PlayerType {
    DUAL,
    MONO
}
export interface HandlerInterface {
    readonly IsPlaying: boolean;
    readonly Event: EventEmitter;
    readonly IsRunning: Running;
    readonly Name: string;
    readonly IsFrontmost: boolean;
    checkPlaystate(): void;
    play(): void;
    pause(str?: string): void;
    next(): void;
    previous(): void;
}

export interface PlayerMessage {
    name: string;
    state: boolean;
    _dualP: boolean | undefined;
}

export interface ChromeObj {
    play: boolean;
    handleUrl: string;
    idleTabUrl: string;
    activeTabUrl: string;
    sites: Array<string>;
    isRunning: boolean;
}

export interface PlayerStateMessage {
    state: boolean;
    running: boolean;
    trackId: string;
}

export interface Player {
    name: string;
    attr: PlayerAttributes;
}

export interface PlayerAttributes {
    playing: boolean;
    dualP: boolean;
}