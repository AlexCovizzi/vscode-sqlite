import * as React from "react";
import Button from '../Button';
import IconExportHtml from "../Icons/IconExportHtml";

interface Props {
    
}


const ButtonExportHtml: React.FunctionComponent<Props> = (props) => {
    return (
        <Button background="transparent" title="Export HTML" width={24} height={24}>
            <IconExportHtml/>
        </Button>
    );
};

export default ButtonExportHtml;
