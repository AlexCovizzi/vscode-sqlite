import * as React from "react";
import { Button, Icons } from './Base';

interface Props {
    onClick?: () => void;
}


const BtnShowHide: React.FunctionComponent<Props> = (props) => {
    return (
        <Button title="Show/Hide" onClick={props.onClick}>
            <Icons.Eye/>
        </Button>
    );
};

export default BtnShowHide;
