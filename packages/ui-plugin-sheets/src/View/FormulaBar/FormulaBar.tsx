import { BaseComponentProps, BaseComponentRender, BaseSelectChildrenProps, Component, debounce, Icon } from '@univerjs/base-ui';
import { Nullable } from '@univerjs/core';
import { SHEET_UI_PLUGIN_NAME } from '../../Basics';
import { SheetUIPlugin } from '../../SheetUIPlugin';
import styles from './index.module.less';

type FormulaState = {
    namedRanges: BaseSelectChildrenProps[];
    spanClass: string;
    formulaContent: string;
    fx: Nullable<Fx>;
};

export type Fx = {
    icon: string;
    onClick: () => void;
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
            fx: null,
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

    setFx(fx: Fx) {
        this.setState({
            fx,
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

    getIcon(name: string) {
        const componentManager = this.getContext().getPluginManager().getPluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)?.getComponentManager();
        const Icon = componentManager?.get(name);
        return <Icon />;
    }

    render(props: BaseFormulaBarProps, state: FormulaState) {
        // TODO: formula bar top left menu: 1. cell edit formula ,use formula list 2. cell selection ,use named range, 3. cell edit no formula, disable select
        const { namedRanges, fx } = state;

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
                        {fx ? (
                            <span className={styles.formulaBlack} onClick={fx.onClick}>
                                {this.getIcon(fx.icon)}
                            </span>
                        ) : null}
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
