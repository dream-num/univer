import { Component } from '@univerjs/base-component';
import { CellRange } from '@univerjs/base-sheets';
import { FORMULA_PLUGIN_NAME, P } from '../../../Basic';
import { FunParams } from '../../../Controller/SearchFormulaModalController';
import { FormulaPlugin } from '../../../FormulaPlugin';
import styles from './index.module.less';

interface IProps {
    funParams: FunParams;
    calc: string;
    onTableClick: () => void;
}

interface IState {
    description: P;
    rangeList: string[];
    index: number;
}

export class SearchItem extends Component<IProps, IState> {
    initialize() {
        this.state = {
            description: {},
            rangeList: [],
            index: 0,
        };
    }

    componentDidMount() {
        const plugin = this._context.getPluginManager().getPluginByName<FormulaPlugin>(FORMULA_PLUGIN_NAME)!;
        plugin.getObserver('onSearchItemDidMountObservable')!.notifyObservers(this);

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
        const { funParams, calc, onTableClick } = this.props;
        const { description, rangeList } = this.state;

        if (!funParams) return;

        return (
            <div className={styles.functionParamModal}>
                <div className={styles.functionParamList}>
                    {funParams.funParams?.p?.map((item, index) => (
                        <div>
                            <span>{item.name}：</span>
                            <CellRange onTableClick={onTableClick} value={rangeList[index]} onClick={() => this.handleClick(index)}></CellRange>
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
