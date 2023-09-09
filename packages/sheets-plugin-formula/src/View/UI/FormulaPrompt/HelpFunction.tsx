import { BaseComponentProps, CustomLabel } from '@univerjs/base-ui';
import { Component, createRef } from 'preact';
import { IKeyValue } from '@univerjs/core';
import { FormulaParamType, FormulaType } from '../../../Basics';
import styles from './index.module.less';

interface IProps extends BaseComponentProps {
    funName: any;
    paramIndex: number;
}

interface IState {
    activeIndex: number;
    functionInfo: FormulaType;
    helpFormulaActive: boolean;
    position: {
        left: number;
        top: number;
    };
}

export class HelpFunction extends Component<IProps, IState> {
    contentRef = createRef<HTMLDivElement>();

    constructor(props: IProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        this.state = {
            activeIndex: 0,
            functionInfo: {},
            helpFormulaActive: false,
            position: {
                left: 0,
                top: 0,
            },
        };
    }

    override UNSAFE_componentWillMount() {}

    override componentDidMount() {
        this.props.getComponent?.(this);
    }

    updateState(helpFormulaActive: boolean, activeIndex: number = 0, functionInfo: FormulaType = {}, position = { left: 0, top: 0 }, cb?: () => void) {
        this.setState(
            {
                helpFormulaActive,
                functionInfo,
                activeIndex,
                position,
            },
            cb
        );
    }

    getState() {
        return this.state;
    }

    getContentRef() {
        return this.contentRef;
    }

    render() {
        const { activeIndex, functionInfo, helpFormulaActive, position } = this.state;

        return (
            <div
                className={styles.helpFunction}
                style={{ display: helpFormulaActive ? 'block' : 'none', position: 'absolute', left: `${position.left}px`, top: `${position.top}px` }}
                ref={this.contentRef}
            >
                <div class={styles.helpFunctionTitle}>
                    <Help title={functionInfo.n} value={functionInfo.p} type="name" active={activeIndex} />
                </div>
                <div className={styles.helpFunctionContent}>
                    <div>
                        <CustomLabel label="formula.formulaMore.helpExample" />
                    </div>
                    <Help title={functionInfo.n} value={functionInfo.p} type="example" active={activeIndex} />
                    <Params
                        title={(<CustomLabel label="formula.formulaMore.helpAbstract" />) as unknown as string}
                        value={(<CustomLabel label={functionInfo.d} />) as unknown as string}
                    />
                    <>
                        {functionInfo &&
                            functionInfo.p &&
                            functionInfo.p.map((item: FormulaParamType, i: number) => (
                                <Params
                                    key={i}
                                    className={activeIndex === i ? styles.helpFunctionActive : ''}
                                    title={(<CustomLabel label={item.name} />) as unknown as string}
                                    value={(<CustomLabel label={item.detail} />) as unknown as string}
                                    active={activeIndex}
                                />
                            ))}
                    </>
                </div>
            </div>
        );
    }
}

interface IParamsProps {
    className?: string;
    title?: string;
    value?: string;
    active?: number;
}

interface IParamsState {}

const Params = (props: IParamsProps) => (
    <div className={`${styles.helpFunctionContentParams} ${props.className}`}>
        <div className={styles.helpFunctionContentTitle}>{props.title}</div>
        <div className={styles.helpFunctionContentDetail}>{props.value}</div>
    </div>
);

interface IHelpProps {
    title?: string;
    value?: FormulaParamType[];
    type: string;
    active: number;
}

interface IHelpState {}

class Help extends Component<IHelpProps, IHelpState> {
    render() {
        return (
            <div>
                <span>
                    {this.props.title}
                    {'('}
                </span>
                {this.props.value &&
                    this.props.value.map((item: FormulaParamType, i: number) => (
                        <span key={i} className={this.props.active === i ? styles.helpFunctionActive : ''}>
                            <CustomLabel label={(item as IKeyValue)[`${this.props.type}`]} />,
                        </span>
                    ))}
                <span>{')'}</span>
            </div>
        );
    }
}
