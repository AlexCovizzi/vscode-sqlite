# vscode-sqlite

VSCode extension to explore and query SQLite databases.

![static/sqlite_workflow_1](https://raw.githubusercontent.com/AlexCovizzi/vscode-sqlite/master/static/sqlite_workflow_1.gif "SQLite Workflow")

## Requirements
#### Windows, OS X
No requirements

#### Linux
**sqlite3** installed in the system or **sqlite3 binaries** (at least version 3.9) that include the command line interface.

The extension will first look for the sqlite3 command (or the command/path specified in the `sqlite.sqlite3` setting), if not found it will fallback to the binaries in this extension's bin folder.

## Features

* Query SQLite3 databases and view results in a table.

* Export query results to ```json``` and ```csv```.

* Sidebar explorer: list databases, tables and columns.

## Commands

* **SQLite: New Query** &nbsp; Create new untitled ```sql``` file.

* **SQLite: Run Query** &nbsp; Execute query script in the editor.

* **SQLite: Quick Query** &nbsp; Choose a database and execute a query without creating a new ```sql``` document.

* **SQLite: Use Database** &nbsp; Bind current ```sql``` document to the selected database.

* **SQLite: Open Database in Explorer** &nbsp; Open the selected database in the sidebar explorer.

* **SQLite: Close Explorer Database** &nbsp; Remove the selected database from the explorer.



## Settings

* `"sqlite.sqlite3": <string>` &nbsp; sqlite3 command or binaries path.

* `"sqlite.autopick": <boolean>` &nbsp; Autopick database when there is only one choice.

* `"sqlite.logLevel": <string>` &nbsp; Set output channel log level (DEBUG, INFO, WARN, ERROR).

* `"sqlite.showTableLimit": <number>` &nbsp; Limit records diplayed when showing a table using Show Table (-1 to not limit).


## Known Issues

No known issues for now.
