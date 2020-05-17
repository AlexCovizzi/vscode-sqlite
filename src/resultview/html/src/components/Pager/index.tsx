import * as React from "react";
import Button from "../Button";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import ArrowRightIcon from "../Icons/ArrowRightIcon";

interface Props {
    total: number;
    current: number;
    onChangePage?: (page: number) => void;
}

const Pager: React.FunctionComponent<Props> = (props) => {
    const handlePrevClick = (event: React.MouseEvent) => {
        event.preventDefault();
        changePage(props.current - 1);
    };

    const handleNextClick = (event: React.MouseEvent) => {
        event.preventDefault();
        changePage(props.current + 1);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        let keyCode = event.keyCode || event.which;
        if (keyCode === 13){
            event.preventDefault();
            changePage(parseInt(event.currentTarget.value));
        }
    };

    const changePage = (newPage: number) => {
        if (newPage < 1) newPage = 1;
        if (newPage > props.total) newPage = props.total;
        if (newPage === props.current) return;
        if (props.onChangePage){
            props.onChangePage(newPage);
        }
    };

    return (
        <div style={getStyle()}>
            <Button style={{background: "transparent"}} onClick={handlePrevClick}><ArrowLeftIcon/></Button>
            <input type="number" min={1} max={props.total}
                defaultValue={props.current} onKeyPress={handleKeyPress}
            />
            <small>{`/${props.total}`}</small>
            <Button style={{background: "transparent"}} onClick={handleNextClick}><ArrowRightIcon/></Button>
        </div>
    );
};

export default Pager;

function getStyle(): React.CSSProperties {
    return {
        
    };
}