import { BaseFormulaBarProps, Component, debounce, FormulaBarComponent, ISelectButton, JSXComponent } from '@univer/base-component';
import * as Icon from '../Icon';
import { Select } from '../index';
import styles from './index.module.less';

type FormulaState = {
    data: Record<string, any>;
    spanClass: string;
};

export class FormulaBar extends Component<BaseFormulaBarProps, FormulaState> {
    initialize(props?: BaseFormulaBarProps) {
        this.state = {
            data: {
                selectType: ISelectButton.INPUT,
                needChange: true,
                icon: <Icon.Format.NextIcon />,
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
        return (
            <div className={styles.formulaBox}>
                <Select selectType={data.selectType} icon={data.icon} children={data.children} needChange={data.needChange}></Select>
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
                        <div autoFocus contentEditable={true} className={styles.formulaContent} onKeyUp={(e) => this.printChange(e)}></div>
                    </div>
                </div>
            </div>
        );
    }
}

export class UniverFormulaBar implements FormulaBarComponent {
    render(): JSXComponent<BaseFormulaBarProps> {
        return FormulaBar;
    }
}
