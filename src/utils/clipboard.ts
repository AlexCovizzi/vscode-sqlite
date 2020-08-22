import {env} from "vscode";

namespace Clipboard {
    export function copy(text: string): Promise<void> {
        return Promise.resolve(env.clipboard.writeText(text));
    }

    export function read(): Promise<string> {
        return Promise.resolve(env.clipboard.readText());
    }
}

export default Clipboard;
