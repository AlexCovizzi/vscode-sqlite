import * as React from "react";
import Button from '../Button';
import IconEye from '../Icons/IconEye';

interface Props {
    onClick: () => void;
}


const ButtonShowHide: React.FunctionComponent<Props> = (props) => {
    return (
        <Button background="transparent" title="Show/Hide" width={24} height={24} onClick={props.onClick}>
            <IconEye/>
        </Button>
    );
};

export default ButtonShowHide;
