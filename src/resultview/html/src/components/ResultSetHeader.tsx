import * as React from "react";
import { Pager } from "./Base";
import BtnShowHide from "./BtnShowHide";
import BtnExportJson from "./BtnExportJson";
import BtnExportHtml from "./BtnExportHtml";
import BtnExportCsv from "./BtnExportCsv";
import BtnSql from "./BtnSql";
import Statement from "./Statement";

interface Props {
    statement: string;
    showStatement: boolean;
    pager: {
        total: number;
        offset: number;
        limit: number;
        onPage?: (offset: number, limit: number) => void;
    };
    onToggleHidden: () => void;
    onExport: (format: "csv"|"html"|"json") => void;
    onSql: () => void;
}

const ResultSetHeader: React.FunctionComponent<Props> = (props) => {
    return (
        <div style={styles.header}>
            <div style={styles.row}>
                <BtnSql onClick={() => props.onSql()}/>
                <Pager {...props.pager}/>
                <div>
                    <BtnExportCsv onClick={() => props.onExport("csv")}/>
                    <BtnExportHtml onClick={() => props.onExport("html")}/>
                    <BtnExportJson onClick={() => props.onExport("json")}/>
                    <BtnShowHide onClick={props.onToggleHidden} />
                </div>
            </div>
            {props.showStatement && <div style={styles.row}>
                <Statement value={props.statement} />
            </div>}
        </div>
    );
};

export default ResultSetHeader;

const styles: {[prop: string]: React.CSSProperties} = {
    header: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(127, 127, 127, 0.25)",
        boxShadow: "0px 1px 0px rgba(0,0,0,0.5)",
        padding: "2px 2px",
        zIndex: 10,
        margin: "1px 0px"
    },
    row: {
        justifyContent: "space-between",
        display: "flex",
        alignItems: "center"
    }
};