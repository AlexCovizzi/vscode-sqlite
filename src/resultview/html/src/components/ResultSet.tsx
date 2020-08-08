import * as React from "react";
import { Hideable, Table, Pager } from "./Base";
import ResultSetHeader from "./ResultSetHeader";

interface Props {
    statement: string;
    columns: string[];
    size: number;
    rows?: string[][];
    onExport: (format: string) => void;
    onRows: (offset: number, limit: number) => void;
}

interface State {
    page: number;
    hidden: boolean;
}

const ROWS_PER_PAGE = 50;
const INITIAL_PAGE = 1;

class ResultSet extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {page: INITIAL_PAGE, hidden: false};
    }

    componentDidMount() {
        this.props.onRows(0, ROWS_PER_PAGE);
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.rows == null) {
            if (this.props.statement != prevProps.statement) {
                this.setState({page: INITIAL_PAGE});
            }
            this.props.onRows((this.state.page-1)*ROWS_PER_PAGE, ROWS_PER_PAGE);
        }
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
                        rows={this.props.rows || []}
                    />
                    <Pager
                        current={this.state.page}
                        total={Math.ceil(this.props.size/ROWS_PER_PAGE)}
                        onPage={this.handlePageChange.bind(this)}
                    />
                </Hideable>
            </div>
        );
    }

    private handleToggleHidden() {
        this.setState({hidden: !this.state.hidden});
    }

    private handlePageChange(page: number) {
        this.setState({page});
        this.props.onRows((page-1)*ROWS_PER_PAGE, ROWS_PER_PAGE);
    }
}

export default ResultSet;