import * as React from "react";

const ArrowLeft: React.FunctionComponent<{}> = () => {
    const fgFill = "var(--vscode-editor-foreground)";
    return (
        <svg viewBox="0 0 16 16">
            <path id="fg" fill={fgFill} fillRule="evenodd" d="M5.5 3L7 4.5 3.25 8 7 11.5 5.5 13l-5-5 5-5z"/>
        </svg>
    );
};

export default ArrowLeft;