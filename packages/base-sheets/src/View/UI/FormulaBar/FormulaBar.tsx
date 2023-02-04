import { BaseComponentProps, BaseComponentRender, BaseComponentSheet, Component, debounce } from '@univerjs/base-ui';
import { BaseSelectChildrenProps, Select } from '../Common/Select/Select';
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
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        const NextIcon = this._render.renderFunction('NextIcon');

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
        this._context.getObserverManager().getObserver<FormulaBar>('onFormulaBarDidMountObservable')?.notifyObservers(this);
    }

    render(props: BaseFormulaBarProps, state: FormulaState) {
        const { namedRanges } = state;

        const CloseIcon = this._render.renderFunction('CloseIcon');
        const CorrectIcon = this._render.renderFunction('CorrectIcon');
        const FxIcon = this._render.renderFunction('FxIcon');

        return (
            <div className={styles.formulaBox}>
                <Select children={namedRanges} type={0}></Select>
                <div className={styles.formulaBar}>
                    <div className={styles.formulaIcon}>
                        <span className={state.spanClass}>
                            <CloseIcon />
                        </span>
                        <span className={state.spanClass}>
                            <CorrectIcon />
                        </span>
                        <span className={styles.formulaBlack}>
                            <FxIcon />
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
