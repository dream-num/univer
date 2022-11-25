import { Component } from '@univer/base-component';
import { FORMULA_PLUGIN_NAME } from '../../../Basic';
import { lang } from '../../../Controller/locale';
import { FormulaPlugin } from '../../../FormulaPlugin';
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
    formula: [];
    functionInfo: any;
    helpFormulaActive: boolean;
    position: {
        left: number;
        top: number;
    };
}

export class HelpFunction extends Component<IProps, IState> {
    initialize() {
        this.state = {
            activeIndex: 0,
            lang: '',
            locale: [],
            formula: [],
            functionInfo: null,
            helpFormulaActive: false,
            position: {
                left: 0,
                top: 0,
            },
        };
    }

    componentWillMount() {
        this.setLocale();
    }

    componentDidMount() {
        const plugin = this._context.getPluginManager().getPluginByName<FormulaPlugin>(FORMULA_PLUGIN_NAME)!;
        plugin.getObserver('onHelpFunctionDidMountObservable')!.notifyObservers(this);
    }

    updateState(helpFormulaActive: boolean, activeIndex: number = 0, functionName: string = '', position = { left: 0, top: 0 }) {
        const functionInfo = this.state.formula.find((item: any) => item.n === functionName) || {};
        this.setState({
            helpFormulaActive,
            functionInfo,
            activeIndex,
            position,
        });
    }

    getState() {
        return this.state;
    }

    setLocale() {
        const locale = this.context.locale.options.currentLocale;
        this.setState({
            lang: locale,
            formula: lang[`${locale}`],
            functionInfo: lang[`${locale}`][0],
        });
    }

    render(props: IProps, state: IState) {
        const { activeIndex, functionInfo, helpFormulaActive, position } = state;

        return (
            <div
                className={styles.helpFunction}
                style={{ display: helpFormulaActive ? 'block' : 'none', position: 'absolute', left: `${position.left}px`, top: `${position.top}px` }}
            >
                <div class={styles.helpFunctionTitle}>
                    <Help title={functionInfo.n} value={functionInfo.p} type="name" active={activeIndex} />
                </div>
                <div className={styles.helpFunctionContent}>
                    <div>示例</div>
                    <Help title={functionInfo.n} value={functionInfo.p} type="example" active={activeIndex} />
                    <Params title="摘要" value={functionInfo.d} />
                    <>
                        {functionInfo &&
                            functionInfo.p &&
                            functionInfo.p.map((item: any, i: number) => (
                                <Params className={activeIndex === i ? styles.helpFunctionActive : ''} title={item.name} value={item.detail} active={activeIndex} />
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
        {props.value && props.value.map((item: any, i: number) => <span className={props.active === i ? styles.helpFunctionActive : ''}>{item[`${props.type}`]},</span>)}
        <span>{')'}</span>
    </div>
);
