import * as React from "react";
import { Header, Item } from "./Base";
import BtnExportJson from "./BtnExportJson";
import BtnExportHtml from "./BtnExportHtml";
import BtnExportCsv from "./BtnExportCsv";

interface Props {
    onExport: (format: "csv"|"html"|"json") => void;
}

const AppHeader: React.FunctionComponent<Props> = (props) => {
    return (
        <Header transparent={true}>
            <Item align="right">
                <BtnExportCsv onClick={() => props.onExport("csv")}/>
                <BtnExportHtml onClick={() => props.onExport("html")}/>
                <BtnExportJson onClick={() => props.onExport("json")}/>
            </Item>
        </Header>
    );
};

export default AppHeader;