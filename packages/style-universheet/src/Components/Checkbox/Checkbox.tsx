import { BaseCheckboxProps, CheckboxComponent, Component, joinClassNames, JSXComponent } from '@univer/base-component';
import styles from './index.module.less';
// export type CheckboxBaseProps = {
//     value?: string;
//     checked?: boolean;
//     className?: string;
//     disabled?: boolean;
//     name?: string;
//     onChange?: (e: Event) => void;
//     children?: string | JSX.Element;
// };

type CheckboxState = {
    classes: string;
    check: boolean;
};

export class Checkbox extends Component<BaseCheckboxProps, CheckboxState> {
    state = {
        classes: this.props.className ? `${this.props.className} ${styles.checkBox}` : styles.checkBox,
        check: true,
    };

    handleStyle = (checked?: boolean, disabled?: boolean) => {
        // Decide whether to check or disable based on the checkbox style
        let classGroup = joinClassNames(styles.checkBox, {
            [`${styles.checkBox}-checked`]: checked,
            [`${styles.checkBox}-disabled`]: disabled,
        }) as string;

        this.setState((prevState) => ({ classes: classGroup, check: checked }));
    };

    componentWillMount() {
        this.handleStyle(this.props.checked, this.props.disabled);
    }

    componentWillReceiveProps(nextProps: BaseCheckboxProps) {
        this.handleStyle(nextProps.checked, nextProps.disabled);
    }

    handleChange = (e: Event) => {
        const target = e.target as HTMLInputElement;

        this.handleStyle(target.checked, this.props.disabled);

        this.props.onChange?.(e);
    };

    render(props: BaseCheckboxProps, state: CheckboxState) {
        const { classes, check } = state;
        const { value, name, disabled, children } = props;
        return (
            <label className={styles.checkboxWrapper}>
                <span className={classes}>
                    <span className={styles.checkboxInner}></span>
                    <input type="checkbox" name={name} checked={check} disabled={disabled} className={styles.checkboxInput} value={value} onChange={this.handleChange} />
                </span>
                {children && <span>{children}</span>}
            </label>
        );
    }
}

export class UniverCheckbox implements CheckboxComponent {
    render(): JSXComponent<BaseCheckboxProps> {
        return Checkbox;
    }
}
