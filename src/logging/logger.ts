import { window, OutputChannel } from "vscode";
import { Constants } from "../constants/constants";

export namespace DebugLogger {
    export function debug(msg: any) {
        log(`[DEBUG] ${msg.toString()}`);
    }
    export function error(msg: any) {
        log(`[ERROR] ${msg.toString()}`);
    }
    export function info(msg: any) {
        log(`[INFO] ${msg.toString()}`);
    }
    export function warn(msg: any) {
        log(`[WARN] ${msg.toString()}`);
    }

    export function log(msg: string) {
        const time = new Date().toLocaleTimeString();
        let outputMsg = `[${time}][${Constants.extensionVersion}] ${msg}`;
        console.log(outputMsg);
    }
}

export namespace OutputLogger {
    const outputChannel = window.createOutputChannel(`${Constants.outputChannelName}`);
    export function debug(msg: any) {
        log(msg, `DEBUG`);
    }
    export function error(msg: any) {
        log(msg, `ERROR`);
    }
    export function info(msg: any) {
        log(msg, `INFO`);
    }
    export function warn(msg: any) {
        log(msg, `WARN`);
    }
    export function showOutput() {
        outputChannel.show();
    }
    export function getOutputChannel(): OutputChannel {
        return outputChannel;
    }

    export function log(msg: any, level?:string) {
        const time = new Date().toLocaleTimeString();
        let outputMsg = ``;
        outputMsg += Constants.outputChannelShowTime? `[${time}]` : ``;
        outputMsg += Constants.outputChannelShowVersion? `[${Constants.extensionVersion}]` : ``;
        outputMsg += (Constants.outputChannelShowLevel && level)? `[${level}]` : ``;
        outputMsg += ` ${msg.toString()}`;
        outputChannel.appendLine(outputMsg.trim());
    }
}