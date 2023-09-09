import { Component } from 'react';
import { JSXComponent } from '../../BaseComponent';
import { BaseCheckboxProps, CheckboxComponent } from '../../Interfaces';
import { joinClassNames } from '../../Utils';
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
    override state = {
        classes: this.props.className ? `${this.props.className} ${styles.checkBox}` : styles.checkBox,
        check: true,
    };

    handleStyle = (checked?: boolean, disabled?: boolean) => {
        // Decide whether to check or disable based on the checkbox style
        const classGroup = joinClassNames(styles.checkBox, {
            [`${styles.checkBox}-checked`]: checked,
            [`${styles.checkBox}-disabled`]: disabled,
        }) as string;

        this.setState((prevState) => ({ classes: classGroup, check: checked }));
    };

    override UNSAFE_componentWillMount() {
        this.handleStyle(this.props.checked, this.props.disabled);
    }

    override UNSAFE_componentWillReceiveProps(nextProps: BaseCheckboxProps) {
        this.handleStyle(nextProps.checked, nextProps.disabled);
    }

    handleChange = (e: Event) => {
        const target = e.target as HTMLInputElement;

        this.handleStyle(target.checked, this.props.disabled);

        this.props.onChange?.(e);
    };

    render() {
        const { classes, check } = this.state;
        const { value, name, disabled, children } = this.props;
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
