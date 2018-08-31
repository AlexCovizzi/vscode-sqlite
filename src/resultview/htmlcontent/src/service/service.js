import { range, randId } from "../utils/utils";

/*
interface VscodeApi { postMessage: (data: any) => void; }
declare function acquireVsCodeApi(): VscodeApi;
*/
export var Service = (function(){
    console.log("Service called");
    
    let requests = {};
    let cache = {};
    let instance;
    let vscodeApi;

    if (typeof window !== "undefined") {
        if (typeof acquireVsCodeApi !== "undefined") {
            vscodeApi = acquireVsCodeApi();
        } else {
            // for development
            let resources = getFakeResultSetResources();
            vscodeApi = {
                postMessage: function(msg) {
                    let command = msg.command.replace(/fetch\:\/(.*)/, '$1');
                    if (resources[command]) {
                        setTimeout(() => {
                            window.postMessage({command: msg.command, data: resources[command], id: msg.id}, "*");
                        }, 10);
                    }
                }
            }
        }
        
        console.log("Acquired vscode api");

        window.addEventListener('message', event => {
            //console.log("Received message from vscode: "+JSON.stringify(event.data));
            
            let message = event.data;

            let request = requests[message.id];
            if (request) {
                request.callback(message.data);
                delete requests[message.id];
            }
        });
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = {
                    request: function(message) {
                        if (vscodeApi) {
                            message.id = randId();
                            vscodeApi.postMessage(message);
                            return new Promise((resolve, reject) => {
                                requests[message.id] = {
                                    message: message,
                                    callback: (data) => {
                                        resolve(data);
                                    }
                                }
                            });
                        } else {
                            return Promise.reject();
                        }
                    }
                };
            }
            return instance;
        }
    };
})();