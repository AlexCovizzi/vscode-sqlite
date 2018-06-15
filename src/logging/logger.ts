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
        let outputMsg = `[${time}][v-${Constants.extensionVersion}] ${msg}`;
        console.log(outputMsg);
    }
}

export namespace OutputLogger {
    const outputChannel = window.createOutputChannel(`${Constants.outputChannelName}`);

    export function showOutput() {
        outputChannel.show();
    }
    export function getOutputChannel(): OutputChannel {
        return outputChannel;
    }

    export function log(msg: any) {
        outputChannel.appendLine(msg.toString());
    }
}