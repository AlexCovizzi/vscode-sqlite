import { window, OutputChannel } from "vscode";
import { Constants } from "../constants/constants";
import { Configuration } from "../configuration/configuration";

enum Level {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR"
}

class Logger {

    private configuration?: Configuration;
    private outputChannel: OutputChannel;

    constructor() {
        console.log("Logger activated");
        this.outputChannel = window.createOutputChannel(`${Constants.outputChannelName}`);
    }

    setConfiguration(configuration: Configuration) {
        this.configuration = configuration;
    }

    debug(msg: any, output?: boolean) {
        this.log(`${msg.toString()}`, Level.DEBUG);
    }

    info(msg: any, output?: boolean) {
        this.log(`${msg.toString()}`, Level.INFO);
    }

    warn(msg: any, output?: boolean) {
        this.log(`${msg.toString()}`, Level.WARNING);
    }

    error(msg: any, output?: boolean) {
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
        msg = `[${time}][${Constants.extensionName} v-${Constants.extensionVersion}][${level}] ${msg}`;
        switch(level) {
            case Level.ERROR: console.error(msg); break;
            case Level.WARNING: console.warn(msg); break;
            case Level.INFO: console.info(msg); break;
            default: console.log(msg); break;
        }
        // forward to output channel
        if (this.configuration && this.configuration.debug) {
            this.output(msg);
        }
    }
}

export const logger: Logger = new Logger();