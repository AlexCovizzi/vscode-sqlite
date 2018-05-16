import { join } from 'path';

export function getHtml(assetsPath: string): string {
    let title = 'SQLite Database';
    // style
    let dropdowncss = `vscode-resource:${join(assetsPath, 'dropdown.css')}`;
    let indexcss = `vscode-resource:${join(assetsPath, 'index.css')}`;
    // scripts
    let jqueryjs = `vscode-resource:${join(assetsPath, 'jquery.min.js')}`;
    let dropdownjs = `vscode-resource:${join(assetsPath, 'dropdown.js')}`;
    let indexjs = `vscode-resource:${join(assetsPath, 'index.js')}`;

    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" content="default-src 'none'; img-src vscode-resource: https:; script-src vscode-resource:; style-src vscode-resource:;">
            <title>${title}</title>

            <link rel="stylesheet" type="text/css" href="${dropdowncss}">
            <link rel="stylesheet" type="text/css" href="${indexcss}">
        </head>

        <body>
            <div class="menu-top">
                <button id='btn_query' class="btn left">Run SQL &#9658;</button>
                <button id='btn_refresh' class="btn left">Refresh &#8634</button>

                <button id='btn_show_master' class="btn right">Show master</button>
                <!--<button id='btn_show_tables' class="btn right">Show tables</button>-->
                <div class="dropdown right">
                    <button id="btn_table_list" class="btn dropbtn">Select table &#9662</button>
                    <div id="myDropdown" class="dropdown-content">
                    </div>
                </div>
            </div>
            
            <div id='input-sql' class="textarea" contentEditable="true" ></div>
            <br />
            <div id='section-result'></div>

            <dialog id="cellDetailDialog">
                <textarea wrap="off" id="cellDetailValue" cols=60 rows=15> </textarea>
            </dialog>
        </body>

        <script src="${jqueryjs}"></script>
        <script src="${dropdownjs}"></script>
        <script src="${indexjs}"></script>
    </html>
    `;
}