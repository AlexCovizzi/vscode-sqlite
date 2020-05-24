import * as React from "react";
import { isThemeLight } from "../../utils";

const IconArrowRight: React.FunctionComponent<{}> = () => {
    const fgFill = isThemeLight() ? "#656565" : "#c5c5c5";
    return (
        <svg viewBox="0 0 16 16" transform="rotate(180)">
            <path id="fg" fill={fgFill} fillRule="evenodd" d="M5.5 3L7 4.5 3.25 8 7 11.5 5.5 13l-5-5 5-5z"/>
        </svg>
    );
};

export default IconArrowRight;