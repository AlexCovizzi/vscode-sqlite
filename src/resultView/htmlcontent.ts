
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
    `;
}