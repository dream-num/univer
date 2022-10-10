import { Component } from '@univer/base-component';
import { Nullable, Observer, Workbook1 } from '@univer/core';
import { lang } from '../locale';
import styles from './index.module.less';

interface IProps {
    value: any[];
    active: number;
}

interface IState {
    lang: string;
    locale: [];
    formulaValue: string;
    functionList: any;
    selectIndex: number;
}

export class SearchFunction extends Component<IProps, IState> {
    private _localeObserver: Nullable<Observer<Workbook1>>;

    initialize() {
        this.state = {
            lang: '',
            locale: [],
            formulaValue: '',
            functionList: [],
            selectIndex: 0,
        };
    }

    componentWillMount() {
        this.setLocale();
        this._localeObserver = this._context
            .getObserverManager()
            .getObserver<Workbook1>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    componentDidMount() {
        this.setState({
            functionList: this.state.locale,
        });
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

    createLi() {
        return this.props.value.map((item: any, i: number) => (
            <li className={this.props.active === i ? styles.searchFunctionActive : ''}>
                <div className={styles.formulaName}>{item.n}</div>
                <div className={styles.formulaDetail}>{item.a}</div>
            </li>
        ));
    }

    render() {
        return (
            <ul className={styles.searchFunction} onKeyDown={this.onKeyDown.bind(this)}>
                {this.createLi()}
            </ul>
        );
    }
}
