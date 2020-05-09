'use strict';

const config = {
    transform: {
      "^.+\\.tsx?$": "ts-jest"
    },
    testRegex: "(tests\/.*(\\.|/)(test|spec))\\.(tsx?)$",
    moduleFileExtensions: [
      "ts",
      "tsx",
      "js",
      "jsx",
      "json",
      "node"
    ],
    setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
    globals: {
        'ts-jest': {
            diagnostics: false,
            tsConfig: "<rootDir>/tests/tsconfig.json"
        }
    }
}

module.exports = config;