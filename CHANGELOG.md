# Change Log

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
