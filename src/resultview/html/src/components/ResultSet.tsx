import * as React from "react";
import { Hideable, Table } from "./Base";
import ResultSetHeader from "./ResultSetHeader";
import { ResultSetData } from "../api";

interface Props  extends ResultSetData {
    onExport: (format: string) => void;
    onRows: (offset: number, limit: number) => void;
}

interface State {
    showTable: boolean;
    showStatement: boolean;
}

class ResultSet extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {showTable: true, showStatement: false};
    }

    render() {
        return (
            <div style={styles.resultSet}>
                <ResultSetHeader
                    statement={this.props.statement}
                    pager={{total: this.props.size, offset: this.props.rows.offset, limit: RECORDS_PER_PAGE, onPage: this.props.onRows}}
                    showStatement={this.state.showStatement}
                    onToggleHidden={this.handleToggleShowTable.bind(this)}
                    onSql={this.handleToggleShowStatement.bind(this)}
                    onExport={this.props.onExport}
                />
                <Hideable hidden={!this.state.showTable}>
                    <Table
                        columns={this.props.columns}
                        rows={this.props.rows.rows}
                    />
                </Hideable>
            </div>
        );
    }

    private handleToggleShowStatement() {
        this.setState({showStatement: !this.state.showStatement});
    }

    private handleToggleShowTable() {
        this.setState({showTable: !this.state.showTable});
    }
}

export default ResultSet;

const styles: {[prop: string]: React.CSSProperties} = {
    resultSet: {
        margin: "8px 0px"
    }
};