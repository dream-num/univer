import { useEffect, useState } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { joinClassNames } from '../../Utils';
import styles from './index.module.less';

export interface BaseCheckboxProps extends BaseComponentProps {
    children?: React.ReactNode;

    /** Semantic DOM class */
    className?: string;

    /** Used for setting the currently selected value */
    value?: string;

    /** The name of the checkbox */
    name?: string;

    /**
     * Specifies whether the checkbox is selected
     * @default false
     */
    checked?: boolean;

    /**
     * If disable checkbox
     * @default false
     */
    disabled?: boolean;

    /** The callback function that is triggered when the state changes */
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Checkbox Component
 */
export function Checkbox(props: BaseCheckboxProps) {
    const { children, className, value, name, checked: initialChecked = false, disabled = false, onChange } = props;

    const [checked, setChecked] = useState(initialChecked);
    const [classes, setClasses] = useState(className ? `${className} ${styles.checkBox}` : styles.checkBox);

    useEffect(() => {
        handleStyle(initialChecked, disabled);
    }, [initialChecked, disabled]);

    const handleStyle = (isChecked?: boolean, isDisabled?: boolean) => {
        const classGroup = joinClassNames(styles.checkBox, {
            [`${styles.checkBox}-checked`]: isChecked,
            [`${styles.checkBox}-disabled`]: isDisabled,
        }) as string;

        setClasses(classGroup);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked: newChecked } = e.target;

        handleStyle(newChecked, disabled);
        setChecked(newChecked);

        onChange?.(e);
    };

    return (
        <label className={styles.checkboxWrapper}>
            <span className={classes}>
                <span className={styles.checkboxInner} />
                <input className={styles.checkboxInput} type="checkbox" name={name} checked={checked} disabled={disabled} value={value} onChange={handleChange} />
            </span>
            {children && <span>{children}</span>}
        </label>
    );
}
