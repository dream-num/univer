import { Component } from '@univer/base-component';
import { Nullable, Observer, Workbook } from '@univer/core';
import { lang } from '../locale';
import styles from './index.module.less';

type Formula = {
    n: string;
    t: number;
    d: string;
    a: string;
    m: number[];
    p: Array<{
        name: string;
        detail: string;
        example: string;
        require: string;
        repeat: string;
        type: string;
    }>;
};

interface IProps {
    funName: any;
    paramIndex: number;
}

interface IState {
    activeIndex: number;
    lang: string;
    locale: [];
    formula: any;
}

export class HelpFunction extends Component<IProps, IState> {
    private _localeObserver: Nullable<Observer<Workbook>>;

    initialize() {
        this.state = {
            activeIndex: 0,
            lang: '',
            locale: [],
            formula: {},
        };
    }

    componentWillMount() {
        this.setLocale();
    }

    componentDidMount() {}

    componentWillUpdate(nextProps: IProps) {
        this.setFun(nextProps);
    }

    setFun(nextProps: IProps) {
        const funName = nextProps.funName;
        const fun = this.state.locale.filter((item: any) => item.n === funName);
        this.setState({
            formula: fun[0],
            activeIndex: nextProps.paramIndex,
        });
    }

    setLocale() {
        const locale = this.context.locale.options.currentLocale;
        const fun = lang[`${locale}`].filter((item: any) => item.n === this.props.funName);

        this.setState({
            lang: locale,
            locale: lang[`${locale}`],
            formula: fun[0],
        });
    }

    render() {
        return (
            <div className={styles.helpFunction}>
                <div class={styles.helpFunctionTitle}>
                    <Help title={this.state.formula.n} value={this.state.formula.p} type="name" active={this.state.activeIndex} />
                </div>
                <div className={styles.helpFunctionContent}>
                    <div>示例</div>
                    <Help title={this.state.formula.n} value={this.state.formula.p} type="example" active={this.state.activeIndex} />
                    <Params title="摘要" value={this.state.formula.d} />
                    <>
                        {this.state.formula.p.map((item: any, i: number) => (
                            <Params
                                className={this.state.activeIndex === i ? styles.helpFunctionActive : ''}
                                title={item.name}
                                value={item.detail}
                                active={this.state.activeIndex}
                            />
                        ))}
                    </>
                </div>
            </div>
        );
    }
}
const Params = (props: any) => (
    <div className={`${styles.helpFunctionContentParams} ${props.className}`}>
        <div className={styles.helpFunctionContentTitle}>{props.title}</div>
        <div className={styles.helpFunctionContentDetail}>{props.value}</div>
    </div>
);
const Help = (props: any) => (
    <div>
        <span>
            {props.title}
            {'('}
        </span>
        {props.value.map((item: any, i: number) => (
            <span className={props.active === i ? styles.helpFunctionActive : ''}>{item[`${props.type}`]},</span>
        ))}
        <span>{')'}</span>
    </div>
);
