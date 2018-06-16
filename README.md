# vscode-sqlite

VSCode extension to explore and query SQLite databases.

![static/sqlite_workflow_1](https://raw.githubusercontent.com/AlexCovizzi/vscode-sqlite/master/static/sqlite_workflow_2.gif "SQLite Workflow")

## Requirements
**sqlite3** installed in the system or **sqlite3 binaries** (at least version 3.9) that include the command line interface.

The extension will first look for the sqlite3 command (or the command/path specified in the sqlite.sqlite3 setting), if not found it will fallback to the binaries in this extension's bin folder.

## Features

* Query SQLite3 databases.
* Sidebar explorer: list databases, tables and columns.

![static/sqlite_explorer](https://raw.githubusercontent.com/AlexCovizzi/vscode-sqlite/master/static/sqlite_explorer.png)

## Usage

TODO

## Settings

`"sqlite.sqlite3": ` sqlite3 command or binaries path.

## Known Issues

No known issues for now.
