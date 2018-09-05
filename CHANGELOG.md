# Change Log

## 0.3.1 (5 Sep 2018)
Added
1. Autocompletion for sqlite keywords, table names, column names.
2. Added ```.db3```, ```.sdb```, ```.s3db``` as recognized extensions for an sqlite3 database (thanks to [LokiSharp](https://github.com/LokiSharp))
3. Added support for binary data, now displayed as hex string

Fixed
1. Fixed issue that prevented the correct execution of queries on tables with the same name as sqlite keywords (e.g Order, Select, Table...)

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
