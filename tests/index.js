'use strict';
Object.defineProperty(exports, "__esModule", { value: true });

var { join } = require('path');
var testrunner = require('./testrunner');

testrunner.configure({
    jestPath: join(__dirname, '..', 'node_modules', 'jest', 'bin', 'jest.js'),
    jestConfig: join(__dirname, '..', 'jest.json'),
    watch: false,
    useColors: true
});

module.exports = testrunner;