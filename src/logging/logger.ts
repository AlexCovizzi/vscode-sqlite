import { window, OutputChannel, Disposable } from "vscode";
import { Constants } from "../constants/constants";

export enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}

class Logger implements Disposable {

    private logLevel: string;
    private outputChannel: OutputChannel;

    constructor() {
        this.logLevel = LogLevel.INFO;
        this.outputChannel = window.createOutputChannel(`${Constants.outputChannelName}`);
    }

    setLogLevel(logLevel: string) {
        this.logLevel = logLevel;
    }

    debug(msg: any) {
        this.log(`${msg.toString()}`, LogLevel.DEBUG);
    }

    info(msg: any) {
        this.log(`${msg.toString()}`, LogLevel.INFO);
    }

    warn(msg: any) {
        this.log(`${msg.toString()}`, LogLevel.WARN);
    }

    error(msg: any) {
        this.log(`${msg.toString()}`, LogLevel.ERROR);
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
    
    dispose() {
        this.outputChannel.dispose();
    }

    private log(msg: string, level: LogLevel) {
        const time = new Date().toLocaleTimeString();
        msg = `[${time}][${Constants.extensionName}][${LogLevel}] ${msg}`;
        // i dont think log to console is needed for the extension
        /*
        switch(level) {
            case LogLevel.ERROR: console.error(msg); break;
            case LogLevel.WARN: console.warn(msg); break;
            case LogLevel.INFO: console.info(msg); break;
            default: console.log(msg); break;
        }
        */
        // log to output channel
        if (this.logLevel && logLevelGreaterThan(level, this.logLevel as LogLevel)) {
            this.output(msg);
        }
    }
}

/**
 * Verify if log level l1 is greater than log level l2
 * DEBUG < INFO < WARN < ERROR
 */
function logLevelGreaterThan(l1: LogLevel, l2: LogLevel) {
    switch(l2) {
        case LogLevel.ERROR:
            return (l1 === LogLevel.ERROR);
        case LogLevel.WARN:
            return (l1 === LogLevel.WARN || l1 === LogLevel.ERROR);
        case LogLevel.INFO:
            return (l1 === LogLevel.INFO || l1 === LogLevel.WARN || l1 === LogLevel.ERROR);
        case LogLevel.DEBUG:
            return true;
        default:
            return (l1 === LogLevel.INFO || l1 === LogLevel.WARN || l1 === LogLevel.ERROR);
    }
}

export const logger: Logger = new Logger();