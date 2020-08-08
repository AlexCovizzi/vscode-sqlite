declare function acquireVsCodeApi(): any;

interface Message {
    type: string;
    payload?: any;
}

interface Messageable {
    postMessage(message: Message): void;
}

class VsCodeApi {
    private static instance: VsCodeApi;
    private api: Messageable;

    private constructor(api: Messageable) {
        this.api = api;
    }

    public static acquire(api?: Messageable) {
        if (!VsCodeApi.instance) {
            if (!api) {
                if (typeof acquireVsCodeApi === 'function') {
                    api = acquireVsCodeApi();
                } else {
                    throw Error("Unable to acquire VsCode API");
                }
            }
            VsCodeApi.instance = new VsCodeApi(api as Messageable);
        }
        return VsCodeApi.instance;
    }

    postMessage(message: Message) {
        console.log("Sent: " + JSON.stringify(message));
        this.api.postMessage(message);
    }

    onMessage(listener: (message: Message) => void) {
        window.addEventListener('message', (event) => {
            const data = event.data;
            console.log("Received: " + JSON.stringify(data));
            listener(data as Message);
        });
    }

}

export default VsCodeApi;