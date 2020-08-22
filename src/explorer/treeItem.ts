import { TreeItem, TreeItemCollapsibleState, Command, ExtensionContext } from "vscode";
import { join, basename } from "path";

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
    
    constructor(context: ExtensionContext, public dbPath: string, command?: Command) {
        super(
            dbPath,
            basename(dbPath),
            TreeItemCollapsibleState.Collapsed,
            command
        );

        console.log(__filename);

        this.iconPath = {
            light: context.asAbsolutePath(join('resources', 'light', 'database.svg')),
            dark: context.asAbsolutePath(join('resources', 'dark', 'database.svg'))
        };

        this.contextValue = 'sqlite.databaseItem';
    }

    get tooltip(): string {
        return `${this.dbPath}`;
    }
}

export class TableItem extends SQLItem {

    constructor(context: ExtensionContext, name: string, private type: string, command?: Command) {
        super(
            name,
            name,
            TreeItemCollapsibleState.Collapsed,
            command
        );
        this.contextValue = 'sqlite.tableItem';
        
        let icon_name = "table.svg";
        if (this.type === "view") {
            icon_name = "table_view.svg";
        }
        this.iconPath = {
            light: context.asAbsolutePath(join('resources', 'light', icon_name)),
            dark: context.asAbsolutePath(join('resources', 'dark', icon_name))
        };
    }

    get tooltip(): string {
        //var dbName = basename(dirname(this.id));
        //var dbNameNoExtension = dbName.substr(0, dbName.lastIndexOf('.')) || dbName;
        return `${this.name}\n${this.type === "view"? "VIEW" : "TABLE"}`;
    }
}

export class ColumnItem extends SQLItem {

    constructor(context: ExtensionContext, name:string, private type: string,
            private notnull: boolean, private pk: number, private defVal: string, command?: Command) {
        super(
            name,
            name+` : ${type.toLowerCase()}`,
            TreeItemCollapsibleState.None,
            command
        );
        
        this.contextValue = 'sqlite.columnItem';

        let iconName = notnull? 'col_notnull.svg' : 'col_nullable.svg';
        iconName = pk > 0? 'col_pk.svg' : iconName;

        this.iconPath = {
            light: context.asAbsolutePath(join('resources', 'light', iconName)),
            dark: context.asAbsolutePath(join('resources', 'dark', iconName))
        };
    }

    get tooltip(): string {
        let pkTooltip = this.pk? '\nPRIMARY KEY' : '';
        let notnullTooltip = this.notnull? '\nNOT NULL' : '';
        let defvalTooltip = this.defVal !== 'NULL'? `\nDEFAULT: ${this.defVal}` : '';
        return `${this.name}\n${this.type}${pkTooltip}${notnullTooltip}${defvalTooltip}`;
    }

}