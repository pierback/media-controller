//@ts-check
'use strict';
const { exec, spawn } = require('child_process');
const path = require('path');
let block = false,
    procData,
    execProc,
    count = 0;

process.on('message', (msg) => {
    // setTitle(msg);
    const tm = timeoutHandler();
    execCMD(msg, tm);
});

process.on('exit', exitHandler.bind(null, { cleanup: true }));
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

function exitHandler(options, err) {
    if (options.cleanup) console.log('clean');
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

function setTitle(msg) {
    if (msg.hasOwnProperty('title')) {
        process.title = msg.title;
    }
}

function timeoutHandler() {
    let timeout;
    if (block) {
        timeout = setTimeout(function () {
            console.log('timeout');
            process.send(procData || 'timeout');
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
        exec(cmd, (error, stdout, stderr) => {
            block = false;
            if (error) {
                console.log(`exec error: ${error}`);
                clearTimeout(tm);
                process.send('error');
                return;
            }

            try {
                let parsedJSON = safelyParseJSON(stdout);
                clearTimeout(tm);
                procData = parsedJSON;
                process.send(parsedJSON)
            } catch (error) {
                clearTimeout(tm);
                process.send(prevData || 'error')
            }
        });
    } else {
        clearTimeout(tm);
        process.send(procData);
    }
}

function safelyParseJSON(json) {
    let parsed;
    try {
        let dataStr = json.toString() || 'null';
        parsed = JSON.parse(dataStr)
    } catch (e) {
        parsed = 'NULL';
    }
    return parsed;
}
