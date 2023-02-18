import { BaseComponentProps, BaseComponentRender, BaseComponentSheet, BaseSelectChildrenProps, Component, debounce, Icon } from '@univerjs/base-ui';
import styles from './index.module.less';

type FormulaState = {
    namedRanges: BaseSelectChildrenProps[];
    spanClass: string;
    formulaContent: string;
};

export interface BaseFormulaBarProps extends BaseComponentProps {}

export class FormulaBar extends Component<BaseFormulaBarProps, FormulaState> {
    private _render: BaseComponentRender;

    // formulaContent = createRef<HTMLDivElement>();

    initialize(props?: BaseFormulaBarProps) {
        this.state = {
            namedRanges: [
                {
                    value: '1',
                    label: '1',
                },
            ],
            spanClass: styles.formulaGrey,
            formulaContent: '',
        };

        this.onkeyUp = debounce(this.onkeyUp, 300);
    }

    onkeyUp = (value: any) => {
        // console.dir(value);
    };

    printChange = (e: KeyboardEvent) => {
        this.onkeyUp(e.target);
    };

    setFormulaContent(value: string) {
        this.setState({
            formulaContent: value,
        });
    }

    setNamedRanges(namedRanges: BaseSelectChildrenProps[]) {
        this.setState({
            namedRanges,
        });
    }

    componentDidMount() {
        this.props.getComponent?.(this);
        // this._context.getObserverManager().getObserver<FormulaBar>('onFormulaBarDidMountObservable')?.notifyObservers(this);
    }

    render(props: BaseFormulaBarProps, state: FormulaState) {

        // TODO: formula bar top left menu: 1. cell edit formula ,use formula list 2. cell selection ,use named range, 3. cell edit no formula, disable select
        const { namedRanges } = state;

        return (
            <div className={styles.formulaBox}>
                {/* <Select children={namedRanges} type={0}></Select> */}
                <div className={styles.formulaBar}>
                    <div className={styles.formulaIcon}>
                        <span className={state.spanClass}>
                            <Icon.Format.CloseIcon />
                        </span>
                        <span className={state.spanClass}>
                            <Icon.Format.CorrectIcon />
                        </span>
                        <span className={styles.formulaBlack}>
                            <Icon.Math.FxIcon />
                        </span>
                    </div>
                    <div className={styles.formulaInput}>
                        <div autoFocus contentEditable={true} className={styles.formulaContent} onKeyUp={(e) => this.printChange(e)}>
                            {state.formulaContent}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
