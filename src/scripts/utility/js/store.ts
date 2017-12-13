/* const electron = require('electron');

const fs = require('fs');
 */
import * as electron from 'electron';
//const Path = require('path');
import * as Path from 'path';
import * as fs from 'fs';

export class Store {
    path: string;
    data: any;
    constructor(opts: any) {
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        this.path = Path.join(userDataPath, opts.configName + '.json');

        this.data = parseDataFile(this.path, opts.defaults);
    }

    get(key: any) {
        return this.data[key];
    }

    set(key: any, val: any) {
        this.data[key] = val;
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }
}

function parseDataFile(filePath: string, defaults: any) {
    // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
    // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        // if there was some kind of error, return the passed in defaults instead.
        return defaults;
    }
}