import { Disposable } from "vscode";
import { HtmlView } from "./htmlview";
import { ResultSet, ResultViewMessageHandler } from "./resultviewHandler";
import { join } from "path";

class ResultView implements Disposable {
    private disposable: Disposable;

    private htmlview: HtmlView;

    constructor(private extensionPath: string) {
        this.htmlview = new HtmlView(extensionPath, 'sqlite', 'SQLite');

        let subscriptions: Disposable[] = [];
        subscriptions.push(this.htmlview);

        this.disposable = Disposable.from(...subscriptions);
    }

    display(resultSet: Promise<ResultSet|undefined>, recordsPerPage: number): void {
        let htmlPath = join(this.extensionPath, 'out', 'resultview', 'htmlcontent', 'index.html');
        this.htmlview.show(htmlPath);
        resultSet.then(res => {
            if (res) this.htmlview.setHandler(new ResultViewMessageHandler(recordsPerPage, res));
        });
    }

    dispose() {
        this.disposable.dispose();
    }
}

export default ResultView;