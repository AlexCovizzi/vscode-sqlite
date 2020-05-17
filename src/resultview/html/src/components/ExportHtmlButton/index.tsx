import * as React from "react";
import Button from '../Button';
import ExportHtmlIcon from "../Icons/ExportHtmlIcon";

interface Props {
    
}


const ExportHtmlButton: React.FunctionComponent<Props> = (props) => {
    return (
        <Button style={getStyle()} title="Export HTML" width={24} height={24}>
            <ExportHtmlIcon/>
        </Button>
    );
};

export default ExportHtmlButton;

function getStyle(): React.CSSProperties {
    return {
        background: "transparent"
    };
}