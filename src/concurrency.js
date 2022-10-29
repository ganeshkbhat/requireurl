/**
 * 
 * Package: require-urls
 * Author: Ganesh B
 * Description: Nodejs npm module to traverse folder using code or cli or use glob patterns
 * Install: npm i require-urls --save
 * Github: https://github.com/ganeshkbhat/requireurl
 * npmjs Link: https://www.npmjs.com/package/require-urls
 * File: src/concurrency.js
 * File Description: Using require-urls instead of require to fetch files from git repositories like Github or Bitbucket like repository directly
 * 
 * git-rest: https://www.softwaretestinghelp.com/github-rest-api-tutorial/#:~:text=Log%20in%20to%20your%20GitHub,and%20click%20on%20Create%20Token.
 * 
*/

/* eslint no-console: 0 */

'use strict';


const path = require('path');
const fs = require('fs');
const { _getRequireOrImport } = require("./require.js");

/**
 *
 *
 * @param {*} data
 * @param {*} options
 */
function _concurrencyThreads(filenameOrData, options) {
    const { Worker } = _getRequireOrImport('worker_threads');
    // const worker = new Worker('./worker-threads.js');
    const worker = new Worker(filename);
    if (!data.url) {
        throw new Error("[require-urls] index.js: URL not present in data for fetch.js");
    }

    if (!data.callback) {
        data.callback = function (contents, parentPort) {
            const { get } = (options.protocol === "https") ? require("https") : require("http");
            get(contents.url, (res) => {
                let result = '';
                res.on('data', (chunk) => result += chunk);
                res.on('end', () => {
                    parentPort.postMessage(result);
                });
            }).on('error', (err) => parentPort.postMessage(err));
        }.bind(null, null, null, data, options)
    }

    worker.postMessage({ ...data });
    worker.on('message', function (result) {
        return result;
    });
}

function _concurrencyProcesses(filenameOrData, options) {
    const { fork } = _getRequireOrImport('child_process');
    const child = fork(filenameOrData);

    if (!data.url) {
        // throw new Error("[require-urls] index.js: URL not present in data for fetch.js");
    }

    if (!data.callback) {
        data.callback = function (contents, processFork) {
            const { get } = (options.protocol === "https") ? require("https") : require("http");
            get(contents.url, (res) => {
                let result = '';
                res.on('data', (chunk) => result += chunk);
                res.on('end', () => {
                    processFork.send(result);
                });
            }).on('error', (err) => processFork.send(err));
        }.bind(null, null, null, data, options)
    }

    child.on('message', function (result) {
        return result;
    });
    child.send({ ...data });
}

module.exports._concurrencyThreads = _concurrencyThreads;
module.exports._concurrencyProcesses = _concurrencyProcesses;
