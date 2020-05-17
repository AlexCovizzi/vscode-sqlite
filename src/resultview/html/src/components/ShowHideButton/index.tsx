import * as React from "react";
import Button from '../Button';
import EyeIcon from '../Icons/EyeIcon';

interface Props {
    
}


const ShowHideButton: React.FunctionComponent<Props> = (props) => {
    return (
        <Button style={getStyle()} title="Show/Hide" width={24} height={24}>
            <EyeIcon/>
        </Button>
    );
};

export default ShowHideButton;

function getStyle(): React.CSSProperties {
    return {
        background: "transparent"
    };
}