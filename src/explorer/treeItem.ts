import { TreeItem, TreeItemCollapsibleState, Command } from "vscode";
import { join, basename } from "path";

export interface SQLTree {
    [dbPath: string]: DBItem;
}

export class SQLItem extends TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        public readonly command?: Command
    ) {
        super(label, collapsibleState);
    }
}

export class DBItem extends SQLItem {
    
    constructor(public dbPath: string, command?: Command) {
        super(
            basename(dbPath),
            TreeItemCollapsibleState.Collapsed,
            command
        );

        this.iconPath = {
            light: join(__filename, '..', '..', '..', 'resources', 'light', 'database.svg'),
            dark: join(__filename, '..', '..', '..', 'resources', 'dark', 'database.svg')
        };

        this.contextValue = 'database-item';
    }

    get tooltip(): string {
        return `${this.dbPath}`;
    }
}

export class TableItem extends SQLItem {
    parent: DBItem;

    constructor(parent: DBItem, name: string, command?: Command) {
        super(
            name,
            TreeItemCollapsibleState.Collapsed,
            command
        );
        this.parent = parent;
    }

    get tooltip(): string {
        //var dbName = basename(dirname(this.id));
        //var dbNameNoExtension = dbName.substr(0, dbName.lastIndexOf('.')) || dbName;
        return `${this.label}`;
    }
}

export class ColumnItem extends SQLItem {
    parent: TableItem;

    constructor(parent: TableItem, private name:string, private type: string, private defValue: string,
            private notnull: boolean, private pk: boolean, command?: Command) {
        super(
            name,
            TreeItemCollapsibleState.None,
            command
        );
        this.parent = parent;
    }

    get tooltip(): string {
        return `${this.name}\n${this.type}${this.notnull? '\nNOT NULL' : ''}${this.pk? '\nPRIMARY KEY' : ''}`;
    }

}