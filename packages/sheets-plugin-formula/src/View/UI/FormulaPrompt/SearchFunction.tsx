import { BaseComponentProps, Component } from '@univerjs/base-ui';
import styles from './index.module.less';

interface IProps extends BaseComponentProps {}

interface IState {
    lang: string;
    locale: [];
    formulaValue: string;
    formula: [];
    functionList: any;
    selectIndex: number;
    searchActive: boolean;
    position: {
        left: number;
        top: number;
    };
}

export class SearchFunction extends Component<IProps, IState> {
    initialize() {
        this.state = {
            lang: '',
            locale: [],
            formulaValue: '',
            functionList: [],
            selectIndex: 0,
            formula: [],
            searchActive: false,
            position: {
                left: 0,
                top: 0,
            },
        };
    }

    componentDidMount() {}

    componentWillUpdate(nextProps: any) {}

    onKeyDown(event: Event) {}

    /**
     *
     * @param searchActive
     * @param formula
     * @param selectIndex
     */
    updateState(searchActive: boolean, formula: [] = [], selectIndex: number = 0, position = { left: 0, top: 0 }) {
        this.setState({ searchActive, formula, selectIndex, position });
    }

    getState() {
        return this.state;
    }

    render(props: IProps, state: IState) {
        const { selectIndex, formula, searchActive, position } = state;
        return (
            <ul
                className={styles.searchFunction}
                onKeyDown={this.onKeyDown.bind(this)}
                style={{ display: searchActive ? 'block' : 'none', position: 'absolute', left: `${position.left}px`, top: `${position.top}px` }}
            >
                {formula.map((item: any, i: number) => (
                    <li className={selectIndex === i ? styles.searchFunctionActive : ''}>
                        <div className={styles.formulaName}>{item.n}</div>
                        <div className={styles.formulaDetail}>{this.getLocale(item.d)}</div>
                    </li>
                ))}
            </ul>
        );
    }
}
