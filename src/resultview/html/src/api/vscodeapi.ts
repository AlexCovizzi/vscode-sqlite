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
  private listeners: Array<(message: Message) => void>;

  private constructor(api: Messageable) {
    this.api = api;
    this.listeners = [];

    window.addEventListener("message", (event) => {
      const data = event.data;
      console.debug("Receive: " + JSON.stringify(data));
      this.listeners.forEach((listener) => listener(data as Message));
    });
  }

  public static acquire(api?: Messageable) {
    if (!VsCodeApi.instance) {
      if (!api) {
        if (typeof acquireVsCodeApi === "function") {
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
    console.debug("Send: " + JSON.stringify(message));
    this.api.postMessage(message);
  }

  onMessage(listener: (message: Message) => void) {
    this.listeners.push(listener);
  }
}

export default VsCodeApi;
