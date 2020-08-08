import * as React from "react";
import { Button, Icons } from './Base';

interface Props {
    onClick?: () => void;
}


const BtnExportJson: React.FunctionComponent<Props> = (props) => {
    return (
        <Button background="transparent" title="Export JSON" onClick={props.onClick}>
            <Icons.ExportJson/>
        </Button>
    );
};

export default BtnExportJson;
