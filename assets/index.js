(function() {
    const vscode = acquireVsCodeApi();
    
    let clearLastResult = false;
    let tables = undefined;

    const cellDetailDialog = document.getElementById("dial");

    window.addEventListener("load", eventWindowLoad);
    window.addEventListener("click", eventWindowClick);
    window.addEventListener('message', eventWindowMessage);

    document.getElementById("btn_query").addEventListener("click", eventClickQuery);
    document.getElementById("btn_refresh").addEventListener("click", eventClickRefresh);
    document.getElementById("btn_table_list").addEventListener("click", eventClickTableList);
    document.getElementById("btn_show_tables").addEventListener("click", eventClickShowTables);
    document.getElementById("btn_show_master").addEventListener("click", eventClickShowMaster);

    function eventWindowLoad() {
    }

    function eventWindowClick(event) {
        // Close cell detail dialog if the user clicks outside of it
        if (event.target == cellDetailDialog) {
            cellDetailDialog.close();
        }
    }

    function eventWindowMessage(event) {
        const message = event.data;

        switch (message.command) {
            case 'query_result_html':
                let result_section = document.getElementById("section-result");
                if (clearLastResult) {
                    clearLastResult = false;
                    result_section.innerHTML = '';
                }
                result_section.innerHTML += message.text;

                $("#result-table .cell").dblclick((e) => {
                    document.getElementById("dial").showModal();
                    document.getElementById("d-text").innerHTML = $(e.target).text();
                });

                break;
            case 'tables':
                let dropdown_tables = document.getElementById("myDropdown");
                tables = JSON.parse(message.text);
                dropdown_tables.innerHTML = "";
                Array.prototype.forEach.call(tables, (table) => {
                    dropdown_tables.innerHTML += "<a class='link-table' href='#'>"+table.name+"</a>";
                });
                Array.prototype.forEach.call(document.getElementsByClassName('link-table'), (element) => {
                    element.addEventListener("click", function(e) {
                        let textarea = document.getElementById('input-sql');
                        textarea.innerText = 'SELECT * FROM '+e.target.innerText+';';
                        eventClickQuery();
                        return;
                    });
                });
                
                break;
        }
    }

    function eventClickQuery() {
        clearLastResult = true;
        let textarea = document.getElementById('input-sql');
        let query = textarea.innerText;
        vscode.postMessage({
            command: 'query',
            text: query
        })
        return;
    }

    function eventClickRefresh() {
        clearLastResult = true;
        vscode.postMessage({
            command: 'refresh'
        })
        return;
    }

    function eventClickTableQuery(tbl_name) {
        vscode.postMessage({
            command: 'table_query',
            text: tbl_name
        })
        return;
    }

    function eventClickTableList() {
        vscode.postMessage({
            command: 'tables',
            text: ''
        })
    }

    function eventClickShowTables() {
        let textarea = document.getElementById('input-sql');

        textarea.innerText = '';
        Array.prototype.forEach.call(tables, (table) => {
            textarea.innerText += 'PRAGMA table_info('+table.name+');\n';
            textarea.innerText += 'PRAGMA foreign_key_list('+table.name+');\n';
        });
        eventClickQuery();
        return;
    }

    function eventClickShowMaster() {
        let textarea = document.getElementById('input-sql');
        textarea.innerText = 'SELECT * FROM sqlite_master;';
        eventClickQuery();
        return;
    }
})();