export class HTMLTable {

    private header: string[];
    private rows: string[][];

    private enumerated: boolean;

    constructor(enumerated?: boolean) {
        this.header = [];
        this.rows = [];
        this.enumerated = enumerated? true : false;
    }

    setHeader(header: string[]) {
        this.header = header;
    }

    addRow(row: string[]) {
        this.rows.push(row);
    }

    setRows(rows: string[][]) {
        this.rows = rows;
    }

    toString() {
        let html = `<table ${this.enumerated? 'class="enumerated"' : ''}>`;

        html += this.headerToHtml();

        this.rows.forEach(row => {
            html += this.rowToHtml(row);
        });
        
        html += '</table>';

        return html;
    }

    private headerToHtml() {
        let html = '<tr>';
        if (this.enumerated) {
            html += '<th>#</th>';
        }
        this.header.forEach(h => {
            h = this.sanitizeStringForHtml(h);
            html += '<th>' + h + '</th>';
        });
        html += '</tr>';
        return html;
    }

    private rowToHtml(row: string[]) {
        let html = '<tr>';
        if (this.enumerated) {
            html += '<td></td>';
        }
        row.forEach(r => {
            r = this.sanitizeStringForHtml(r);
            html += '<td class="cell">' + r + '</td>';
        });
        html += '</tr>';
        return html;
    }

    private sanitizeStringForHtml(s: string) {
        s = s.replace('&', '&amp;');
        s = s.replace('/', '&#x2F;');
        s = s.replace(/<(\w+)>/, '&lt;$1&gt;');
        return s;
    }
}