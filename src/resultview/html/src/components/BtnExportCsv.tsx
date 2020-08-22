import * as React from "react";
import { Button, Icons } from './Base';

interface Props {
    onClick?: () => void;
}


const BtnExportCsv: React.FunctionComponent<Props> = (props) => {
    return (
        <Button title="Export CSV" onClick={props.onClick}>
            <Icons.ExportCsv/>
        </Button>
    );
};

export default BtnExportCsv;
