import { join } from 'path';
import { Constants } from '../constants/constants';

export function getHtml(content: string) {
    // style
    let indexcss = `vscode-resource:${join(Constants.htmlAssetsPath, 'css', 'index.css')}`;
    // scripts
    let indexjs = `vscode-resource:${join(Constants.htmlAssetsPath, 'js', 'index.js')}`;

    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0" content="default-src 'none'; img-src vscode-resource: https:; script-src vscode-resource:; style-src vscode-resource:;">
                
                <link rel="stylesheet" type="text/css" href="${indexcss}">
            </head>
    
            <body>
                <div id='section-query-result'>
                    ${content}
                </div>
            </body>
            <script src="${indexjs}"></script>
        </html>
        `;
}