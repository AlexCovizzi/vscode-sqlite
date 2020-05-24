import * as React from "react";
import Header from "../Header";
import HeaderItem from "../HeaderItem";
import Statement from "../Statement";
import ButtonShowHide from "../ButtonShowHide";
import ButtonExportCsv from "../ButtonExportCsv";
import ButtonExportHtml from "../ButtonExportHtml";
import ButtonExportJson from "../ButtonExportJson";
import Hideable from "../Hideable";
import Table from "../Table";
import Pager from "../Pager";

interface Props {
    
}

interface State {
    hidden: boolean;
    data: {
        header: string[];
        rows: string[][];
    };
}

class App extends React.Component<Props, State> {
    private data = {
        header: [...Array(5).keys()].map(i => "name"+i),
        rows: [...Array(10).keys()].map(i => [...Array(5).keys()].map(j => "alex"+i+j))
    };

    constructor(props: Props) {
        super(props);
        this.state = {hidden: false, data: this.data};
    }

    render() {
        return (
            <div>
                <Header>
                    <HeaderItem width="80%" align="left">
                        <Statement value="ciao sono alex e ho 25 anni dall' 8 Maggio"/>
                    </HeaderItem>
                    <HeaderItem align="right">
                        <ButtonShowHide onClick={this.handleToggleHidden.bind(this)} />
                        <ButtonExportCsv/>
                        <ButtonExportHtml/>
                        <ButtonExportJson/>
                    </HeaderItem>
                </Header>
                <Hideable hidden={this.state.hidden}>
                    <Table data={this.state.data}/>
                    <Pager start={1} total={10} onChangePage={this.handleChangePage.bind(this)}/>
                </Hideable>
            </div>
        );
    }

    private handleChangePage(newPage: number) {
        
    }

    private handleToggleHidden() {
        const oldHidden = this.state.hidden;
        this.setState({hidden: !oldHidden});
    }
}

export default App;