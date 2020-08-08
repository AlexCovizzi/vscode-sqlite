import * as React from "react";
import { isThemeLight } from "../../../utils";

const ExportJson: React.FunctionComponent<{}> = () => {
    const themeLight = isThemeLight();
    const fgFill = themeLight ? "#656565" : "#c5c5c5";
    const actionFill = themeLight ? "#00539c" : "#75beff";
    return (
        <svg viewBox="0 0 16 16">
            <path id="fg" fill={fgFill} d="M15 8.38v1.258c-.697 0-1.046.426-1.046 1.278v1.579c0 .961-.223 1.625-.666 1.989-.445.364-1.166.547-2.164.547v-1.278c.383 0 .661-.092.834-.277s.26-.498.26-.94V11.08c0-1.089.349-1.771 1.046-2.044v-.027c-.697-.287-1.046-1-1.046-2.14V5.468c0-.793-.364-1.189-1.094-1.189V3c.993 0 1.714.19 2.16.571s.67 1.031.67 1.952v1.565c0 .861.349 1.292 1.046 1.292zm-9.967 4.142v-1.401c0-1.117-.351-1.816-1.053-2.099v-.027c.429-.175.71-.519.877-.995H3.049c-.173.247-.436.38-.805.38v1.258c.692 0 1.039.419 1.039 1.258v1.641c0 .934.226 1.584.677 1.948s1.174.547 2.167.547v-1.278c-.388 0-.666-.093-.838-.28-.17-.188-.256-.505-.256-.952z"/>
            <path id="action" fill={actionFill} d="M8 4L5 7H3l2-2H1V3h4L3 1h2l3 3z"/>
        </svg>
    );
};

export default ExportJson;