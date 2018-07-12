var toggleResult;
var exportJson;
var exportCsv;

(function() {

    let resultTableList = Array.from(document.getElementsByClassName("result-table"));
    resultTableList.forEach(elem => {
        paginator({
            tableId: elem.getElementsByTagName('table')[0].id,
            box: elem.getElementsByClassName("pagination")[0],
            rows_per_page: recordsPerPage
        });
    });
    
    const vscode = acquireVsCodeApi();
    window.addEventListener('message', function(event) {
        let command = event.data.command;
        let text = event.data.text;
        handleMessage(command, text);
    });

    function sendMessage(command, text) {
        vscode.postMessage({ command: command, text: text });
    }
    
    function handleMessage(command, text) {
        switch(command) {
            case 'prova': document.body.innerHTML += text;
        }
    }

    toggleResult = function(resultId) {
        let resultTable = document.getElementById("result_table_"+resultId);
        if (resultTable.style.display === "none") {
            resultTable.style.display = "block";
        } else {
            resultTable.style.display = "none";
        }
    }

    exportJson = function(resultId) {
        sendMessage('export.json', JSON.stringify({result_id: resultId}));
    };

    exportCsv = function(resultId) {
        sendMessage('export.csv', JSON.stringify({result_id: resultId}));
    };

}())