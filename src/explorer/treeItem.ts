import { TreeItem, TreeItemCollapsibleState, Command, ExtensionContext } from "vscode";
import { join, basename } from "path";
import { Schema } from "../sqlite/schema";

export interface SQLTree {
    [dbPath: string]: DBItem;
}

export class SQLItem extends TreeItem {

    constructor(
        public readonly name: string,
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        public readonly command?: Command
    ) {
        super(label, collapsibleState);
    }
}

export class DBItem extends SQLItem {
    private db: Schema.Database;
    constructor(context: ExtensionContext, db: Schema.Database, command?: Command) {
        super(
            db.path,
            basename(db.path),
            TreeItemCollapsibleState.Collapsed,
            command
        );
        this.db = db;

        this.iconPath = {
            light: context.asAbsolutePath(join('resources', 'light', 'database.svg')),
            dark: context.asAbsolutePath(join('resources', 'dark', 'database.svg'))
        };

        this.contextValue = 'sqlite.databaseItem';
    }

    // @ts-ignore
    get tooltip(): string {
        return `${this.db.path}`;
    }
}

export class TableItem extends SQLItem {
    private table: Schema.Table;
    constructor(context: ExtensionContext, table: Schema.Table, command?: Command) {
        super(
            table.name,
            table.name,
            TreeItemCollapsibleState.Collapsed,
            command
        );
        this.table = table;
        this.contextValue = 'sqlite.tableItem';
        
        let icon_name = "table.svg";
        if (table.type === "view") {
            icon_name = "table_view.svg";
        }
        this.iconPath = {
            light: context.asAbsolutePath(join('resources', 'light', icon_name)),
            dark: context.asAbsolutePath(join('resources', 'dark', icon_name))
        };
    }

    // @ts-ignore
    get tooltip(): string {
        //var dbName = basename(dirname(this.id));
        //var dbNameNoExtension = dbName.substr(0, dbName.lastIndexOf('.')) || dbName;
        return `${this.name}\n${this.table.type === "view" ? "VIEW" : "TABLE"}`;
    }
}

export class ColumnItem extends SQLItem {
    private column: Schema.Column
    constructor(context: ExtensionContext, column: Schema.Column, command?: Command) {
        const name = column.name;
        const type = column.type;
        const notnull = column.notnull;
        const pk = column.pk;
        super(
            name,
            name+` : ${type.toLowerCase()}`,
            TreeItemCollapsibleState.None,
            command
        );
        this.column = column;
        
        this.contextValue = 'sqlite.columnItem';

        let iconName = notnull? 'col_notnull.svg' : 'col_nullable.svg';
        iconName = pk > 0? 'col_pk.svg' : iconName;

        this.iconPath = {
            light: context.asAbsolutePath(join('resources', 'light', iconName)),
            dark: context.asAbsolutePath(join('resources', 'dark', iconName))
        };
    }

    // @ts-ignore
    get tooltip(): string {
        const lines = [];
        lines.push(this.name);
        lines.push(this.column.type);
        if (this.column.pk) lines.push('PRIMARY KEY');
        if (this.column.notnull) lines.push('NOT NULL');
        if (this.column.defVal !== 'NULL') lines.push(`DEFAULT: ${this.column.defVal}`);
        if (this.column.generatedAlways) lines.push('GENERATED ALWAYS')
        if (this.column.virtual) lines.push('VIRTUAL');
        if (this.column.stored) lines.push('STORED');
        return lines.join('\n');
    }

}