'use strict';
//@ts-ignore
const spawn = require('child_process').spawn;
//@ts-ignore
const exec = require('child_process').exec;
import * as cp from 'child_process';
import { Running } from './interfaces';
import * as path from 'path';
//@ts-ignore

export module utility {

    export function execCmd(cmdStr: String) {
        exec(cmdStr);
    }

    export function convertToBoolean(input: string): boolean | undefined {
        try {
            return JSON.parse(input);
        }
        catch (e) {
            return undefined;
        }
    }

    export function undefinedToBoolean(input: boolean | undefined): boolean {
        try {
            if (input == undefined) {
                return false;
            }
            return input;
        }
        catch (e) {
            return false;
        }
    }
    export function undefinedToString(input: string | undefined): string {
        try {
            if (input == undefined) {
                return '';
            }
            return input;
        }
        catch (e) {
            return '';
        }
    }

    export function convertToRunningType(input: any): Running {
        try {
            let val = JSON.parse(input);
            if (val) {
                return Running.True;
            } else {
                return Running.False;
            }
        }
        catch (e) {
            return Running.False;
        }
    }

    export function callbackCmd<T>(bin: string, args: Array<string>): Promise<T> {
        let oncheckspw: any;
        let timeout: any;
        return new Promise<T>((resolve, reject) => {
            //let hrstart = process.hrtime();
            oncheckspw = spawn(bin, args);
            oncheckspw.stdout.setEncoding('utf8');
            oncheckspw.stdout.on('data', function (data: string) {
                let parsedJSON = JSON.parse(data);
                if (parsedJSON) {
                    //let hrend = process.hrtime(hrstart);
                    //console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);
                    clearTimeout(timeout);
                    resolve(parsedJSON);
                } else {
                    clearTimeout(timeout);
                    reject(parsedJSON);
                }
            });
            oncheckspw.stdout.on('error', function (err: Error) {
                clearTimeout(timeout);
                reject(err);
            });
        });
    }

    export function execCallback(cmdStr: String): Promise<string> {
        let p = new Promise<string>((resolve, reject) => {
            try {
                exec((cmdStr), (err: Error, stdout: string) => {
                    if (err instanceof Error) {
                        reject(err);
                    }
                    resolve(stdout);
                });
            } catch (err) {
                reject(err);
            }
        });
        return p;
    }

    export function fork(): cp.ChildProcess {
        const spawnPath = path.join(__dirname, '/child.js');
        const helperProcess: cp.ChildProcess = cp.fork(spawnPath);
        return helperProcess;
    }

    export function lastActiveApp(cmd: string): Promise<string> {
        let p = new Promise<string>((resolve, reject) => {
            execCallback(cmd)
                .then((data: string) => {
                    resolve(data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
        return p;
    }

    export function extractAppName(fullName: string): string {
        try {
            if (fullName == null || fullName == 'undefined') {
                return 'none';
            }
            if (fullName.includes(':')) {
                return undefinedToString(fullName.split(':').shift());
            }
            return fullName;
        } catch (e) {
            return 'none';
        }

    }

    export function printMap<T, K>(str: string, inpMap: Map<T, [Date, K]>) {
        //const tempMap = this.deepClone(playerMap) as Map<number, [Date, ChromePlayer]>;
        let outPutArr: any = [];
        inpMap.forEach((v, k) => {
            //@ts-ignore
            outPutArr.push({ title: v[1].title, playing: v[1].playing });
        });
        console.log(str, ' Map');
        console.log(outPutArr);
    }

    export function deepClone(obj: any) {
        if (!obj || true == obj) //this also handles boolean as true and false
            return obj;
        let objType = typeof (obj);
        if ('number' == objType || 'string' == objType) // add your immutables here
            return obj;
        let result = Array.isArray(obj) ? [] : !obj.constructor ? {} : new obj.constructor();
        if (obj instanceof Map)
            for (let key of obj.keys())
                result.set(key, deepClone(obj.get(key)));
        for (let key in obj)
            if (obj.hasOwnProperty(key))
                result[key] = deepClone(obj[key]);
        return result;
    }

    export function safelyParseJSON(json: any) {
        let parsed;
        try {
            let dataStr = json.toString() || 'null';
            parsed = JSON.parse(dataStr);
        } catch (e) {
            parsed = 'NULL';
        }
        return parsed;
    }

    export function ActiveApp(): string {
        try {
            //return activeWin.sync().app;
            return '';
        } catch (e) {
            console.log(e);
            return '';
        }
    }
}
