import * as React from "react";
import { isThemeLight } from "../../../utils";

const ExportCsv: React.FunctionComponent<{}> = () => {
    const themeLight = isThemeLight();
    const fgFill = themeLight ? "#656565" : "#c5c5c5";
    const actionFill = themeLight ? "#00539c" : "#75beff";
    return (
        <svg viewBox="0 0 16 16">
            <path id="fg" fill={fgFill} d="M8 5.414V6h-.586L8 5.414zM13 5v8s-.035 1-1.035 1h-8S3 14 3 13V8h1v5h2V7.414l1-1V13h2V4.414L9.414 4 9 3.586V3h-.586l-1-1h2.227L13 5zm-1 1h-2v7h2V6z"/>
            <path id="action" fill={actionFill} d="M8 4L5 7H3l2-2H1V3h4L3 1h2l3 3z"/>
        </svg>
    );
};

export default ExportCsv;