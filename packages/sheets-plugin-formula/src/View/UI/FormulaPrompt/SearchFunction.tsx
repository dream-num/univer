import { Component } from '@univer/base-component';
import { Nullable, Observer, Workbook } from '@univer/core';
import { FORMULA_PLUGIN_NAME } from '../../../Basic';
import { lang } from '../../../Controller/locale';
import { FormulaPlugin } from '../../../FormulaPlugin';
import styles from './index.module.less';

interface IProps {}

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
    private _localeObserver: Nullable<Observer<Workbook>>;

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

    componentWillMount() {
        this.setLocale();
        this._localeObserver = this._context
            .getObserverManager()
            .getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    componentDidMount() {
        this.setState({
            functionList: this.state.locale,
        });

        const plugin = this._context.getPluginManager().getPluginByName<FormulaPlugin>(FORMULA_PLUGIN_NAME)!;
        plugin.getObserver('onSearchFunctionDidMountObservable')!.notifyObservers(this);
    }

    componentWillUpdate(nextProps: any) {}

    setLocale() {
        const locale = this.context.locale.options.currentLocale;

        this.setState({
            lang: locale,
            locale: lang[`${locale}`],
        });
    }

    onKeyDown(event: Event) {}

    /**
     * TODO: 是否可以抽象出updateState, getState 到Component
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
                        <div className={styles.formulaDetail}>{item.a}</div>
                    </li>
                ))}
            </ul>
        );
    }
}
