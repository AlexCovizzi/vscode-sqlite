# Change Log

## 0.8.0 (24 Jul 2019)

Added
1. Added command ```Run Selected Query``` to run only the query selected in the document.

Changed
1. The command ```Run Query``` now runs every query in the document (previously if there was a query selected it ran that query)

## 0.7.1 (20 Jun 2019)

Fixed
1. Fixed bug that caused SQLite binaries with version not supported to not throw an error when used.
2. Fixed bug that caused, in some OSs, SQLite binaries to not work as expected.

## 0.7.0 (6 Jun 2019)

Added
1. Added setting ```"sqlite.databaseExtensions"```, to customize file extensions recognized as SQLite database.

Changed
1. Autocompletion now suggests only the name of the column (instead of `[table].[column]`)
2. The statement in the result panel is now collapsed in a single line and can be expanded clicking on it.

## 0.6.0 (13 Mar 2019)

Added
1. Added option in the sqlite explorer to copy database path.
2. Added option in the sqlite explorer to copy table/column name.
3. Added option in the sqlite explorer to create a new table query (Select/Insert).
4. Added option in the files explorer to create a new database query.
5. Added command in the command palette to refresh sqlite explorer databases.
6. Added support for ```EXPLAIN QUERY PLAN```.

Fixed
1. Log level is now changed correctely.
2. Fixed bug that caused the last line of the result table to disappear after hiding and then showing the result table.
3. Fixed bug that prevented empty tables from showing in the sqlite explorer ([#63](https://github.com/AlexCovizzi/vscode-sqlite/issues/63))

Changed
1. Changed view table icon.
2. New lines are now rendered in the result table.

Other
1. Improved query performance.
2. Improved query logging.

## 0.5.3 (1 Mar 2019)

Fixed
1. Fixed bug that caused table field with HTML code to be rendered. ([#59](https://github.com/AlexCovizzi/vscode-sqlite/issues/59))

## 0.5.1 (20 Feb 2019)

Fixed
1. Fixed bug that caused intellisense to not work on ```New Query``` document ([#55](https://github.com/AlexCovizzi/vscode-sqlite/issues/55))

## 0.5.0 (3 Feb 2019)

Added
1. Added language ```sqlite``` (thanks to [mandel59](https://github.com/mandel59)).

Fixed
1. Fixed bug on Windows that prevented the result view from being show when the extension was not on the same disk as Visual Studio Code (thanks to [mandel59](https://github.com/mandel59))
2. Fixed bug on Windows that replaced unicode characters in the database path and in the query with question marks (thanks to [mandel59](https://github.com/mandel59))
3. Fixed bug that sometimes prevented the last line of the table in the result view from being shown.
4. The result view is now kept open when there is an error in the query.
5. Removed system tables (```sqlite_sequence``` and ```sqlite_stat1```) from the sqlite explorer.
6. Removed ```:memory:``` from the databases you can choose when adding a database to the explorer.

## 0.4.0 (18 Jan 2019)

Added
1. The sqlite explorer now supports views.
2. Added icons to distinguish between tables and views in the explorer.
3. Added support for :memory: database.

## 0.3.3 (24 Dec 2018)

Fixed
1. Fixed bug that prevented custom sqlite paths from being recognized as a command on Windows.
2. Fixed bug that sometimes truncated the error message.

Added
1. Added command: ```SQLite: Show output```, to show the extension's output channel.

Other
1. Updated SQLite3 binaries to the version 3.26.0

## 0.3.2 (24 Nov 2018)

Fixed
1. Fixed bug that prevented the extension from recognizing executable paths set in the setting ```sqlite.sqlite3```.

## 0.3.1 (5 Sep 2018)

Added
1. Added autocompletion for sqlite keywords, table names, column names.
2. Added ```.db3```, ```.sdb```, ```.s3db``` as recognized extensions for an sqlite3 database (thanks to [LokiSharp](https://github.com/LokiSharp))
3. Added support for binary data, now displayed as hex string

Fixed
1. Fixed bug that prevented the correct execution of queries on tables with the same name as sqlite keywords (e.g Order, Select, Table...)

## 0.3.0 (2 Sep 2018)

Added
1. Export result to ```html```.
2. Export multiple results to ```csv```, ```html``` or ```json```.
3. Added option to open/use a database outside your workspace.
4. Keyboard shortcut ```ctrl+shift+q``` to execute document query

Removed
1. Setting: ```sqlite.outputBuffer```.
2. Setting: ```sqlite.autopick```, the option to choose a database outside the workspace removed the usefulness of autopick.

Fixed
1. Fixed an issue that prevented the correct execution of a query in multiple lines and without an ending semicolon.

Other
1. Improved performance and responsiveness.


## 0.2.3 (12 Jul 2018)

Added
1. Setting: ```sqlite.outputBuffer```, query output buffer in bytes.

## 0.2.2 (12 Jul 2018)

Added
1. Pagination, tables are now displayed in pages, each page with a set number of records.
2. Setting: ```sqlite.recordsPerPage```, to set the number of records per page.

Removed
1. Setting: ```sqlite.showTableLimit```, now that pagination is supported this setting is useless.

Fixed
1. Fixed a bug that prevented the export button from working correctely.
2. Fixed a bug that prevented the correct execution on Windows of queries composed of multiple statements.

## 0.2.1 (11 Jul 2018)

Fixed
1. Fixed bug that prevented the query result from showing on Windows.

## 0.2.0 (11 Jul 2018)

Added
1. Export query result to Json.
2. Export query result to Csv.
3. Show/Hide query result.

Changed
1. Improved query result graphic.

Fixed
1. Explorer: Show Table can now display more records.

## 0.1.2 (5 Jul 2018)

Fixed
1.  Fixed bug that prevented the database from showing in the explorer if it was previously closed.

## 0.1.1 (5 Jul 2018)

Added
1. New setting: ```sqlite3.logLevel```, to set the logging level of the output channel.
2. New setting: ```sqlite3.showTableLimit```, to limit the records displayed when showing a table using Show Table (in SQLite Explorer).

Changed
1. ```sql``` document database can now be changed from the status bar.
2. SQLite output channel now displays time and log level.

## 0.1.0 (29 Jun 2018)

Added
1. Added new command: Quick Query, execute a query directly without creating a new sql document.
2. Tables in the explorer are now ordered alphabetically.
3. Explorer: new icons for primary key, not null and nullable fields.
4. Explorer: added default value in the columns' tooltip when default value is not NULL

Fixed
1. Composite primary keys are now all recognized as primary keys.
2. Comments inside a comment in an sql document are now parsed correctely.

## 0.0.4 (26 Jun 2018)

Fixed
1. unicode characters are now shown correctely

## 0.0.3 (26 Jun 2018)

Fixed
1. fixed a bug that prevented the correct parsing of the query result when it contained an escaped quote
2. fixed a bug that crashed the extension when the query result contained a unicode character inside the string

Other
1. improved quality of the icon

## 0.0.2 (25 Jun 2018)

Fixed
1. fixed a bug that showed unicode characters as octets.

## 0.0.1 (23 Jun 2018)

Initial release
