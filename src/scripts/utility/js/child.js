'use strict';
const { exec, spawn } = require('child_process');
const path = require('path');
let block = false,
    procData,
    execProc,
    count = 0;
let ls;

process.on('message', (msg) => {
    //setTitle(msg);
    const tm = timeoutHandler();
    execCMD(msg, tm);
});


process.on('error', (error) => {
    console.log(`error: ${error}`);
});

process.on('exit', exitHandler.bind(null, { cleanup: true }));
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));



function exitHandler(options, err) {
    if (options.cleanup) console.log('clean');
    if (err) console.log('stack', err.stack);
    if (options.exit) process.exit();
}

function lsExitHandler(options, err) {
    if (options.exit) ls.exit();
}

function setTitle(msg) {
    console.log('init')
    if (msg.hasOwnProperty('title')) {
        process.title = msg.title;
    }
}

function timeoutHandler() {
    let timeout;
    if (block) {
        timeout = setTimeout(function () {
            block = false;
            ls.kill();
            process.send({ error: true });
        }, 10000);
        return timeout;
    }
    return null;
}


function execCMD(msg, tm) {
    const prevData = procData;
    if (!block) {
        block = true;
        const args = [path.join(__dirname, msg.args)];
        const cmd = `${msg.bin} ${args}`;
        /* exec(cmd, (error, stdout, stderr) => {
            block = false;
            if (error) {
                console.log(`exec error: ${error}`);
                clearTimeout(tm);
                let msg = { error: 'error' };
                process.send(msg);
                return;
            }

            try {
                let parsedJSON = safelyParseJSON(stdout);
                clearTimeout(tm);
                console.log(parsedJSON);
                process.send(parsedJSON)
                procData = parsedJSON;
            } catch (error) {
                clearTimeout(tm);
                let msg = { error: 'error' };
                process.send(prevData || msg);
            }
        }); */

        ls = spawn(msg.bin, args);
        ls.on('exit', lsExitHandler.bind(null, { cleanup: true }));
        ls.on('SIGINT', lsExitHandler.bind(null, { exit: true }));
        ls.on('SIGUSR1', lsExitHandler.bind(null, { exit: true }));
        ls.on('SIGUSR2', lsExitHandler.bind(null, { exit: true }));
        ls.on('uncaughtException', lsExitHandler.bind(null, { exit: true }));

        ls.stdout.on('data', (data) => {
            procData = data;
        });

        ls.stderr.on('data', (data) => {
            clearTimeout(tm);
            ls.unref();
            ls.kill();
            let msg = { error: true };
            setTimeout(() => process.send(msg), 500);
        });

        ls.on('error', (err) => {
            console.log(`exec error: ${err}`);
            clearTimeout(tm);
            let msg = { error: true };
            setTimeout(() => process.send(msg), 500);
        });

        ls.on('close', (code) => {
            try {
                block = false;
                let parsedJSON = safelyParseJSON(procData);
                clearTimeout(tm);
                process.send(parsedJSON || { error: true })
                procData = parsedJSON;
            } catch (error) {
                clearTimeout(tm);
                let msg = { error: true };
                process.send(msg);
            }
        });
    } else {/* 
        clearTimeout(tm);
        block = false; */
        /*  setTimeout(() => console.log('block') && ls.kill() && process.send({ error: 'error' }), 20000); */
    }
}

function safelyParseJSON(json) {
    let parsed;
    try {
        let dataStr = json.toString();
        parsed = JSON.parse(dataStr)
    } catch (e) {
        parsed = { error: true };
    }
    return parsed;
}
