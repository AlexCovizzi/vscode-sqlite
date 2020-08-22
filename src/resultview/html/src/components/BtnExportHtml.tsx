import * as React from "react";
import { Button, Icons } from './Base';

interface Props {
    onClick?: () => void;
}


const BtnExportHtml: React.FunctionComponent<Props> = (props) => {
    return (
        <Button title="Export HTML" onClick={props.onClick}>
            <Icons.ExportHtml/>
        </Button>
    );
};

export default BtnExportHtml;
