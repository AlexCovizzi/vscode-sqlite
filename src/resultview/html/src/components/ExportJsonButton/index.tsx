import * as React from "react";
import Button from '../Button';
import ExportJsonIcon from '../Icons/ExportJsonIcon';

interface Props {
    
}


const ExportJsonButton: React.FunctionComponent<Props> = (props) => {
    return (
        <Button style={getStyle()} title="Export JSON" width={24} height={24}>
            <ExportJsonIcon/>
        </Button>
    );
};

export default ExportJsonButton;

function getStyle(): React.CSSProperties {
    return {
        background: "transparent"
    };
}