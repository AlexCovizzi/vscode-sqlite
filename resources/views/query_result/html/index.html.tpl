<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" content="default-src 'none'; img-src vscode-resource: https:; script-src vscode-resource:; style-src vscode-resource:;">
        
        <%= css("../css/styles.css") %>
        <%= css("../css/resultHeader.css") %>
        <%= css("../css/resultTable.css") %>
    </head>

    <body>
        <div id='section-query-results'>
          <% for (result of this.resultSet) { %>
            <div class="result-wrapper">
              <%= html("result-header.html.tpl", {stmt: result.stmt, id: result.id}) %>
              <%= html("result-table.html.tpl", {header: result.header, rows: result.rows, id: result.id}) %>
            </div>
          <% } %>
        </div>
    </body>

    <%= js("../js/index.js") %>
</html>