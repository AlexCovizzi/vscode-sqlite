import * as React from "react";
import produce from "immer";
import AppHeader from "./AppHeader";
import { Api, ResultSetData } from "../api";
import ResultSetList from "./ResultSetList";

interface Props {
    api: Api;
}

interface State {
    results: Array<ResultSetData>;
}

class App extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {results: []};
    }

    componentDidMount() {
        this.props.api.onResults((results) => {
            const state = produce(this.state, (draftState) => {
                draftState.results = results.map(result => ({...result}));
            });
            this.setState(state);
        });

        this.props.api.onRows((rowsData) => {
            const state = produce(this.state, (draftState) => {
                draftState.results[rowsData.result].rows = rowsData;
            });
            this.setState(state);
        });
    }

    render() {
        // TODO: Move the style in a css file
        return (
            <div>
                <style>
                    {"button:focus {outline: 1px solid -webkit-focus-ring-color;}"}
                </style>
                <AppHeader onExport={this.handleExport.bind(this)}/>
                <ResultSetList
                    list={this.state.results}
                    onExport={this.handleExport.bind(this)}
                    onRows={this.handleRows.bind(this)}
                />
            </div>
        );
    }

    private handleExport(format: string, index?: number) {
        this.props.api.exportResults(format, index);
    }

    private handleRows(offset: number, limit: number, index: number) {
        this.props.api.fetchRows(index, offset, limit);
    }
}

export default App;