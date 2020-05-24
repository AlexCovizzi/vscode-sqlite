import * as React from "react";
import Button from '../Button';
import IconExportCsv from "../Icons/IconExportCsv";

interface Props {
    
}


const ButtonExportCsv: React.FunctionComponent<Props> = (props) => {
    return (
        <Button background="transparent" title="Export CSV" width={24} height={24}>
            <IconExportCsv/>
        </Button>
    );
};

export default ButtonExportCsv;
