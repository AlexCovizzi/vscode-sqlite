import * as React from "react";
import ExportJsonButton from "./ExportJsonButton";
import ExportCsvButton from "./ExportCsvButton";
import ExportHtmlButton from "./ExportHtmlButton";
import ShowHideButton from "./ShowHideButton";
import Statement from "./Statement";
import Header from "./Header";
import HeaderItem from "./HeaderItem";
import Table from "./Table";
import Pager from "./Pager";

interface Props {

}

interface State {
    currentPage: number;
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
        this.state = {currentPage: 1, data: this.data};
    }

    render() {
        return (
            <div>
                <Header>
                    <HeaderItem width="80%" float="left">
                        <Statement value="ciao sono alex e ho 25 anni dall' 8 Maggio"/>
                    </HeaderItem>
                    <HeaderItem float="right">
                        <ShowHideButton/>
                        <ExportCsvButton/>
                        <ExportHtmlButton/>
                        <ExportJsonButton/>
                    </HeaderItem>
                </Header>
                <Table data={this.state.data}/>
                <Pager current={this.state.currentPage} total={10} onChangePage={this.handleChangePage.bind(this)}/>
            </div>
        );
    }

    private handleChangePage(newPage: number) {
        this.setState({currentPage: newPage});
    }
}

export default App;
