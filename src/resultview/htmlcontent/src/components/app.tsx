import { h, Component } from 'preact';
import { range } from '../utils/utils';
import { Result } from './result';
import { Fetch, Response } from './fetch';
import { ExportCsv } from './exportcsv';
import { ExportJson } from './exportjson';
import { ExportHtml } from './exporthtml';
import { Header } from './header';
import style from './style.css';

export default class App extends Component {

    render({}, {}) {
        return (
            <div>
                <Fetch resource={`resultSet/length`}>
                    {(response: Response) => 
                        <div>
                        {
                            response.data > 1 && (<Header noBackground={true}>
                                                    <ExportCsv right={true} />
                                                    <ExportJson right={true} />
                                                    <ExportHtml right={true} />
                                                </Header>)
                        }
                        {response.loading && <div class={style.loader_line}></div>}
                        {response.data && range(0,response.data-1).map(idx => <Result idx={idx}/>)}
                        </div>
                    }
                </Fetch>
            </div>
        );
    }
}