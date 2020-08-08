import * as React from "react";
import { Header, Item } from "./Base";
import BtnShowHide from "./BtnShowHide";
import BtnExportJson from "./BtnExportJson";
import BtnExportHtml from "./BtnExportHtml";
import BtnExportCsv from "./BtnExportCsv";
import Statement from "./Statement";

interface Props {
    statement: string;
    onToggleHidden: () => void;
    onExport: (format: "csv"|"html"|"json") => void;
}

const ResultSetHeader: React.FunctionComponent<Props> = (props) => {
    return (
        <Header>
            <Item width="80%" align="left">
                <Statement value={props.statement}/>
            </Item>
            <Item align="right">
                <BtnShowHide onClick={props.onToggleHidden} />
                <BtnExportCsv onClick={() => props.onExport("csv")}/>
                <BtnExportHtml onClick={() => props.onExport("html")}/>
                <BtnExportJson onClick={() => props.onExport("json")}/>
            </Item>
        </Header>
    );
};

export default ResultSetHeader;