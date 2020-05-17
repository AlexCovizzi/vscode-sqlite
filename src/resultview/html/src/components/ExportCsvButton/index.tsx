import * as React from "react";
import Button from '../Button';
import ExportCsvIcon from "../Icons/ExportCsvIcon";

interface Props {
    
}


const ExportCsvButton: React.FunctionComponent<Props> = (props) => {
    return (
        <Button style={getStyle()} title="Export CSV" width={24} height={24}>
            <ExportCsvIcon/>
        </Button>
    );
};

export default ExportCsvButton;

function getStyle(): React.CSSProperties {
    return {
        background: "transparent"
    };
}