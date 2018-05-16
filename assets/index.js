(function() {
    const vscode = acquireVsCodeApi();
    
    let clearLastResult = false;
    let tables = undefined;

    const cellDetailDialog = document.getElementById("cellDetailDialog");
    const cellDetailValue = document.getElementById("cellDetailValue");

    window.addEventListener("load", eventWindowLoad);
    window.addEventListener("click", eventWindowClick);
    window.addEventListener('message', eventWindowMessage);

    document.getElementById("section-result").addEventListener("dblclick", eventDblClickResultSection)
    document.getElementById("btn_query").addEventListener("click", eventClickQuery);
    document.getElementById("btn_refresh").addEventListener("click", eventClickRefresh);
    document.getElementById("btn_table_list").addEventListener("click", eventClickTableList);
    //document.getElementById("btn_show_tables").addEventListener("click", eventClickShowTables);
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
            case 'query_result':
                result = JSON.parse(message.text);
                query_result(result);
        }
    }

    function query_result(result) {
        let result_section = document.getElementById("section-result");
        if (clearLastResult) {
            clearLastResult = false;
            result_section.innerHTML = '';
        }

        let cols = Object.keys(result[0]);
        let wrapper = document.createElement('div');
        wrapper.classList.add('table-wrapper');
        result_section.appendChild(wrapper);

        let table = document.createElement('table');
        table.id = "result-table";
        table.classList.add('enumerated');
        wrapper.appendChild(table);

        appendHeaders(table, cols);
        appendRows(table, result, cols);

        return;
    }

    function appendHeaders(table, cols) {
        let tr = document.createElement('tr');
        tr.appendChild(document.createElement('th'));
        cols.forEach(col => {
            let th = document.createElement('th');
            th.innerText = col;
            tr.appendChild(th);
        });
        table.appendChild(tr);
    }

    function appendRows(table, rows, cols) {
        rows.forEach(row => {
            let tr = document.createElement('tr');
            tr.appendChild(document.createElement('td'));
            cols.forEach(col => {
                let td = document.createElement('td');
                td.classList.add('cell');
                let val = row[col];
                td.innerText = val;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
    }

    function eventDblClickResultSection(event) {
        if (event.target.matches(".cell")) {
            cellDetailValue.value = event.target.innerText;
            cellDetailValue.selectionStart = 0;
            cellDetailValue.selectionEnd = 0;
            cellDetailDialog.showModal();
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