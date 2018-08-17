'use strict';
Object.defineProperty(exports, "__esModule", { value: true });

var { spawn } = require('child_process');
var { join } = require('path');

const configuration = {
    jestPath: null,
    jestConfig: null,
    watch: false,
    useColors: true
}

function run(testsRoot, clb) {
    // Enable source map support
    require('source-map-support').install();

    if (!configuration.jestPath) {
        clb('jestPath not defined.')
    }

    var jestArgs = [];
    if (configuration.jestConfig) {
        jestArgs.push('--config');
        jestArgs.push(configuration.jestConfig);
    }
    if(configuration.watch) {
        jestArgs.push('--watch');
    }
    if (configuration.useColors) {
        process.env.FORCE_COLOR = true;
    }

    console.log(configuration.jestPath+'\n');

    var jest = spawn(configuration.jestPath, jestArgs, { env: process.env });

    jest.stdout.on('data', (data) => console.log(`${data}`));

    jest.stderr.on('data', (data) => console.log(`${data}`));

    jest.on('close', (code) => clb(null));
}

function configure(conf) {
    for(var setting in conf) {
        configuration[setting] = conf[setting]
    }
}

exports.run = run;
exports.configure = configure;