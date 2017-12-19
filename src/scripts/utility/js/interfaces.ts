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
/*
export interface TypedEventEmitter<T, K> {
    addListener<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this;
    on<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this;
    once<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this;
    removeListener<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this;
    removeAllListeners<K extends keyof T>(event?: K): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners<K extends keyof T>(event: K): ((arg: T[K]) => any)[];
    emit<K extends keyof T>(event: K, arg: T[K]): boolean;
    listenerCount<K extends keyof T>(type: K): number;
    prependListener<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this;
    prependOnceListener<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this;
    eventNames(): (string | symbol)[];
}

export interface MyEventEmitter extends TypedEventEmitter<any, any> {
    event(name: 'update'): this;
    event(name: 'running'): TypedEventEmitter<this, string>;
    event(name: 'playing'): TypedEventEmitter<this, Player>;
}
*/
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

/* export interface Player {
    name: string;
    attr: PlayerAttributes;
}

export interface PlayerAttributes {
    playing: boolean;
    title: string;
    dualP: boolean;
} */

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
    playing?: boolean;
}
