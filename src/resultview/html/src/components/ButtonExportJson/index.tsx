import * as React from "react";
import Button from '../Button';
import IconExportJson from '../Icons/IconExportJson';

interface Props {
    
}


const ButtonExportJson: React.FunctionComponent<Props> = (props) => {
    return (
        <Button background="transparent" title="Export JSON" width={24} height={24}>
            <IconExportJson/>
        </Button>
    );
};

export default ButtonExportJson;
