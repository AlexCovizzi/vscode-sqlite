
export function getHtml(content: string) {
    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0" content="default-src 'none'; img-src vscode-resource: https:; script-src vscode-resource:; style-src vscode-resource:;">
                
                <style>${getCss()}</style>
            </head>
    
            <body>
                <div class="separator"></div>
                <div id='section-query-result'>
                    ${content}
                </div>
            </body>
            <script>
                (function() {
                    const vscode = acquireVsCodeApi();

                    let btnExportJsonList = document.getElementsByClassName("export-json");
                    Array.prototype.forEach.call(btnExportJsonList, function(btn) {
                        btn.onclick = function() { exportJSON(btn.value) };
                    });

                    let btnExportCsvList = document.getElementsByClassName("export-csv");
                    Array.prototype.forEach.call(btnExportCsvList, function(btn) {
                        btn.onclick = function() { exportCSV(btn.value) };
                    });
                    
                    function exportJSON(result_id) {
                        vscode.postMessage({
                            command: 'export.json',
                            text: JSON.stringify({result_id: result_id})
                        });
                    }

                    function exportCSV(result_id) {
                        vscode.postMessage({
                            command: 'export.csv',
                            text: JSON.stringify({result_id: result_id})
                        });
                    }
                    
                }())
            </script>
        </html>
        `;
}

function getCss() {
    return `
    /* colors */
    :root {
        --table-border: #ccc;
        --table-header: rgba(127, 127, 127, 0.5);
    }
    table {
        border-collapse:collapse;
    }
    table, td, th {
        border:1px dotted var(--table-border);
        padding:5px;
        margin-top: 4px;
        margin-bottom: 4px;
    }
    td {
        white-space: pre;
    }
    th {
        background: var(--table-header)
    }

    .separator {
        padding: 8px;
    }

    .no-result {
        marging-top: 8px;
    }

    /* enumerated table */
    .enumerated {
        counter-reset: serial-number;
    }

    .enumerated td:first-child:before {
        counter-increment: serial-number;
        content: counter(serial-number);
    }

    .enumerated tr td:first-child, tr th:first-child {
        font-style: italic;
        background: var(--table-header);
    }

    .btn {
        background-color: var(--table-header);
        border: none;
        color: inherit;
        padding: 4px 4px;
        margin: 4px 2px;
        cursor: pointer;
    }
    `;
}