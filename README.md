# vscode-sqlite

VSCode extension to explore and query SQLite databases.

![static/sqlite_workflow_1](https://raw.githubusercontent.com/AlexCovizzi/vscode-sqlite/master/static/sqlite_workflow_1.gif "SQLite Workflow")

## Requirements
No requirements

**Note**: The extension includes binaries for the sqlite cli (used to execute queries), in case the included binaries do not work you need to provide your own path/command for the sqlite cli in the setting `sqlite.sqlite3`

## Features

* **Query** sqlite databases and view results in a table.

* **Export** query results to ```json```, ```csv``` and ```html```.

* **Sidebar explorer**: list databases, tables, views and columns.

* **Autocompletion** for sqlite keywords, table and views names, column names (autocompletion is available for an sql document once its bound to a database, to bind an sql document to a database use the command ```SQLite: Use Database```)

* **Grammar** support for sqlite keywords. This is available for documents with language ```sqlite```. You can mark a document as an ```sqlite``` document adding ```-- sqlite``` in the first line.

## Commands

* **SQLite: New Query** &nbsp; Create a new untitled ```sqlite``` file.

* **SQLite: Run Query** &nbsp; Execute query script in the editor.

* **SQLite: Quick Query** &nbsp; Choose a database and execute a query without creating a new document.

* **SQLite: Use Database** &nbsp; Bind current ```sql``` document to the selected database.

* **SQLite: Open Database** &nbsp; Open the selected database in the sqlite explorer.

* **SQLite: Close Database** &nbsp; Remove the selected database from the sqlite explorer.

* **SQLite: Refresh Databases** &nbsp; Refresh databases open in the sqlite explorer.

* **SQLite: Show output** &nbsp; Show the extension's output channel.



## Settings

* `"sqlite.sqlite3": <string>` &nbsp; sqlite3 command or binaries path.

* `"sqlite.logLevel": <string>` &nbsp; Set output channel log level (DEBUG, INFO, WARN, ERROR).

* `"sqlite.recordsPerPage": <number>` &nbsp; Number of records to show per page. (-1 to show all records).

* `"sqlite.databaseExtensions": <string[]>` &nbsp; The file extensions recognized as SQLite database.


## Known Issues

No known issues.

## Thanks to the [Contributors](https://github.com/AlexCovizzi/vscode-sqlite/graphs/contributors)!
* [mandel59 (Ryusei YAMAGUCHI)](https://github.com/mandel59)
* [LokiSharp (LokiSharp)](https://github.com/LokiSharp)