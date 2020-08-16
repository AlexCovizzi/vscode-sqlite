import * as React from "react";

const Eye: React.FunctionComponent<{}> = () => {
    const fgFill = "var(--vscode-editor-foreground)";
    return (
        <svg viewBox="0 0 16 16">
            <path id="fg" fillRule="evenodd" fill={fgFill} d="M8.06 2C3 2 0 8 0 8s3 6 8.06 6C13 14 16 8 16 8s-3-6-7.94-6zM8 12c-2.2 0-4-1.78-4-4 0-2.2 1.8-4 4-4 2.22 0 4 1.8 4 4 0 2.22-1.78 4-4 4zm2-4c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"/>
        </svg>
    );
};

export default Eye;