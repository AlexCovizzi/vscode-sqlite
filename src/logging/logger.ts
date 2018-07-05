import { window, OutputChannel } from "vscode";
import { Constants } from "../constants/constants";
import { Configuration } from "../configuration/configuration";

enum Level {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}

class Logger {

    private configuration!: Configuration;
    private outputChannel: OutputChannel;

    constructor() {
        this.outputChannel = window.createOutputChannel(`${Constants.outputChannelName}`);
    }

    setConfiguration(configuration: Configuration) {
        this.configuration = configuration;
    }

    debug(msg: any) {
        this.log(`${msg.toString()}`, Level.DEBUG);
    }

    info(msg: any) {
        this.log(`${msg.toString()}`, Level.INFO);
    }

    warn(msg: any) {
        this.log(`${msg.toString()}`, Level.WARN);
    }

    error(msg: any) {
        this.log(`${msg.toString()}`, Level.ERROR);
    }

    output(msg: any) {
        this.outputChannel.appendLine(msg.toString());
    }

    showOutput() {
        this.outputChannel.show();
    }

    getOutputChannel(): OutputChannel {
        return this.outputChannel;
    }

    private log(msg: string, level: Level) {
        const time = new Date().toLocaleTimeString();
        msg = `[${time}][${Constants.extensionName}][${level}] ${msg}`;
        switch(level) {
            case Level.ERROR: console.error(msg); break;
            case Level.WARN: console.warn(msg); break;
            case Level.INFO: console.info(msg); break;
            default: console.log(msg); break;
        }
        // log to output channel
        if (this.configuration && logLevelGreaterThan(level, this.configuration.logLevel as Level)) {
            this.output(msg);
        }
    }
}

/**
 * Verify if log level l1 is greater than log level l2
 * DEBUG < INFO < WARN < ERROR
 */
function logLevelGreaterThan(l1: Level, l2: Level) {
    switch(l2) {
        case Level.ERROR:
            return (l1 === Level.ERROR);
        case Level.WARN:
            return (l1 === Level.WARN || l1 === Level.ERROR);
        case Level.INFO:
            return (l1 === Level.INFO || l1 === Level.WARN || l1 === Level.ERROR);
        case Level.DEBUG:
            return true;
        default:
            return (l1 === Level.INFO || l1 === Level.WARN || l1 === Level.ERROR);
    }
}

export const logger: Logger = new Logger();