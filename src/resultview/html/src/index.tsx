import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./components/App";
import { Api } from "./api";

const api = new Api();

ReactDOM.render(
    <App api={api} />,
    document.getElementById("root")
);
