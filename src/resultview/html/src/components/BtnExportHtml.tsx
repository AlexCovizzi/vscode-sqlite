import * as React from "react";
import { Button, Icons } from './Base';

interface Props {
    onClick?: () => void;
}


const BtnExportHtml: React.FunctionComponent<Props> = (props) => {
    return (
        <Button background="transparent" title="Export HTML" width={16} height={16} onClick={props.onClick}>
            <Icons.ExportHtml/>
        </Button>
    );
};

export default BtnExportHtml;
