import * as React from "react";
import { Hideable, Table, Pager } from "./Base";
import ResultSetHeader from "./ResultSetHeader";

interface Props {
    refresh: boolean;
    statement: string;
    columns: string[];
    size: number;
    rows: string[][];
    onExport: (format: string) => void;
    onRows: (offset: number, limit: number) => void;
}

interface State {
    hidden: boolean;
}

const ROWS_PER_PAGE = 50;
const INITIAL_PAGE = 1;

class ResultSet extends React.Component<Props, State> {

    private dirty: boolean;

    constructor(props: Props) {
        super(props);
        this.state = {hidden: false};
        this.dirty = true;
    }

    componentDidMount() {
        if (this.dirty) this.props.onRows(0, ROWS_PER_PAGE);
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.rows == null) this.dirty = false;
        if (this.dirty) this.props.onRows(0, ROWS_PER_PAGE);
    }

    render() {
        return (
            <div>
                <ResultSetHeader
                    statement={this.props.statement}
                    onToggleHidden={this.handleToggleHidden.bind(this)}
                    onExport={this.props.onExport}
                />
                <Hideable hidden={this.state.hidden}>
                    <Table
                        columns={this.props.columns}
                        rows={this.props.rows}
                    />
                    <Pager
                        start={INITIAL_PAGE}
                        total={Math.ceil(this.props.size/ROWS_PER_PAGE)}
                        onPage={(page) => this.props.onRows((page-1)*ROWS_PER_PAGE, ROWS_PER_PAGE)}
                    />
                </Hideable>
            </div>
        );
    }

    private handleToggleHidden() {
        this.setState({hidden: !this.state.hidden});
    }
}

export default ResultSet;