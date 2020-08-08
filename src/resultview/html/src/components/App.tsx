import * as React from "react";
import produce from "immer";
import AppHeader from "./AppHeader";
import { Api } from "../api";
import ResultSetList from "./ResultSetList";

interface Props {
    api: Api;
}

interface State {
    results: Array<{
        refresh: boolean;
        statement: string;
        columns: string[];
        size: number;
        rows: string[][];
    }>;
}

class App extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {results: []};

        props.api.onResults((results) => {
            const state = produce(this.state, (draftState) => {
                draftState.results = results.map(result => ({...result, rows: [], refresh: true}));
            });
            this.setState(state);
        });

        props.api.onRows((rowsData) => {
            const state = produce(this.state, (draftState) => {
                draftState.results[rowsData.result].rows = rowsData.rows;
            });
            this.setState(state);
        });
    }

    render() {
        return (
            <div>
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