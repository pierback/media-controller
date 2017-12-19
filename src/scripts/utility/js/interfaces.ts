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
    activate(str?: string): void;
}

export interface PlayerMessage {
    name: string;
    state: boolean;
    _dualP: boolean | undefined;
    title?: string;
    obj: HandlerInterface;
}

export interface ChromeObj {
    handleTab: ChromePlayer;
    activeTab: {
        id: number;
        url: string;
    };
    sites: Array<ChromePlayer>;
    isRunning: boolean;
    error?: string;
}

export interface PlayerStateMessage {
    state: boolean;
    running: boolean;
    trackId: string;
}

export type PlayerID = string;
export interface Player {
    id: PlayerID;
    playing: boolean;
    title: string;
    plObj: HandlerInterface;
}

export interface ChromePlayer {
    id: number;
    title: string;
    url: string;
    playing: boolean;
}