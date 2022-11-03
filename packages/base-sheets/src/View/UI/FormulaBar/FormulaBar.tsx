import { BaseComponentProps, BaseComponentRender, BaseComponentSheet, Component, debounce, ISelectButton } from '@univer/base-component';
import { Select } from '../Common/Select/Select';
import styles from './index.module.less';

type FormulaState = {
    data: Record<string, any>;
    spanClass: string;
};

export interface BaseFormulaBarProps extends BaseComponentProps {}

export class FormulaBar extends Component<BaseFormulaBarProps, FormulaState> {
    Render: BaseComponentRender;

    initialize(props?: BaseFormulaBarProps) {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();

        const NextIcon = this.Render.renderFunction('NextIcon');

        this.state = {
            data: {
                selectType: ISelectButton.INPUT,
                needChange: true,
                icon: <NextIcon />,
                children: [],
            },
            spanClass: styles.formulaGrey,
        };

        this.onkeyUp = debounce(this.onkeyUp, 300);
    }

    onkeyUp = (value: any) => {
        // console.dir(value);
    };

    printChange = (e: KeyboardEvent) => {
        this.onkeyUp(e.target);
    };

    render(props: BaseFormulaBarProps, state: FormulaState) {
        const { data } = state;

        const CloseIcon = this.Render.renderFunction('CloseIcon');
        const CorrectIcon = this.Render.renderFunction('CorrectIcon');
        const FxIcon = this.Render.renderFunction('FxIcon');

        return (
            <div className={styles.formulaBox}>
                <Select children={data.children}></Select>
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
                        <div autoFocus contentEditable={true} className={styles.formulaContent} onKeyUp={(e) => this.printChange(e)}></div>
                    </div>
                </div>
            </div>
        );
    }
}
