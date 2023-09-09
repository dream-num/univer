import { BaseComponentProps, CellRange, CustomLabel } from '@univerjs/base-ui';
import { Component } from 'preact';
import { FormulaParamType, FunParams } from '../../../Basics';
import styles from './index.module.less';

interface IProps extends BaseComponentProps {
    funParams: FunParams;
    calc: string;
}

interface IState {
    description: FormulaParamType;
    rangeList: string[];
    index: number;
}

export class SearchItem extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        this.state = {
            description: {},
            rangeList: [],
            index: 0,
        };
    }

    override componentDidMount() {
        const { funParams } = this.props;
        const description = funParams?.funParams.p?.[0];
        this.setState({
            description,
        });
    }

    handleClick(index: number) {
        const { funParams } = this.props;
        const description = funParams?.funParams.p?.[index];

        this.setState({
            description,
            index,
        });
    }

    changeRange(range: string) {
        const { index, rangeList } = this.state;
        rangeList[index] = range;
        this.setState({
            rangeList,
        });
    }

    render() {
        const { funParams, calc } = this.props;
        const { description, rangeList } = this.state;

        if (!funParams) return;

        return (
            <div className={styles.functionParamModal}>
                <div className={styles.functionParamList}>
                    {funParams.funParams?.p?.map((item, index) => (
                        <div key={index}>
                            <span>{item.name}:</span>
                            <div onClick={() => this.handleClick(index)}>
                                <CellRange
                                    contentPlaceholder={(<CustomLabel label="formula.formulaMore.tipDataRangeTitle" />) as unknown as string}
                                    title={(<CustomLabel label="formula.formulaMore.tipSelectDataRange" />) as unknown as string}
                                    value={rangeList[index]}
                                />
                            </div>
                            <span>={'{}'}</span>
                        </div>
                    ))}
                </div>
                <div className={styles.functionParamDesc}>
                    <div className={styles.functionParamDescDetail}>{funParams.funParams?.d}</div>
                    <div className={styles.functionParamDescDetails}>
                        <p>
                            {description.name}: {description.detail}
                        </p>
                    </div>
                </div>
                <div className={styles.functionParamResult}>
                    {calc}={}
                </div>
            </div>
        );
    }
}
