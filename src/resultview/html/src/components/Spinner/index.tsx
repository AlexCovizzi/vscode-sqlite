import * as React from "react";

interface Props {
    loading?: boolean;
}

const Spinner: React.FunctionComponent<Props> = (props) => {
    return (
        <div>
            <style>{
                `@keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }`
            }</style>
            <div style={getStyle()}></div>
        </div>
    );
};

export default Spinner;

function getStyle(): React.CSSProperties {
    return {
        border: "2px solid var(--light)",
        borderTop: "2px solid #3498db",
        borderRadius: "50%",
        width: "12px",
        height: "12px",
        margin: "2px 2px",
        animation: "spin 2s linear infinite",
    };
}