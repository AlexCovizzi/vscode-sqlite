import * as clipboardy from 'clipboardy';

namespace Clipboard {
    export function copy(text: string): Promise<void> {
        return clipboardy.write(text);
    }

    export function read(): Promise<string> {
        return clipboardy.read();
    }
}

export default Clipboard;
