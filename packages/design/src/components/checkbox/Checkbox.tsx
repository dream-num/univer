import clsx from 'clsx';
import React, { useRef } from 'react';

import styles from './index.module.less';

export interface ICheckboxProps {
    children?: React.ReactNode;

    /**
     * Used for setting the currently selected value
     * @default false
     */
    checked?: boolean;

    /**
     * Used for setting the currently selected value
     */
    value: string | number | boolean;

    /**
     * Specifies whether the checkbox is disabled
     * @default false
     */
    disabled?: boolean;

    /**
     * Set the handler to handle `click` event
     */
    onChange?: (value: string | number | boolean) => void;
}

/**
 * Checkbox Component
 */
export function Checkbox(props: ICheckboxProps) {
    const { children, checked, value, disabled = false, onChange } = props;

    const inputRef = useRef<HTMLInputElement>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.stopPropagation();

        if (!onChange || disabled) return;

        if (typeof value !== 'undefined') {
            onChange && onChange(value);
        } else {
            const checked = inputRef?.current?.checked!;
            onChange && onChange(checked);
        }
    }

    const _className = clsx(styles.checkbox, {
        [styles.checkboxDisabled]: disabled,
    });

    return (
        <label className={_className}>
            <span className={styles.checkboxTarget}>
                <input
                    ref={inputRef}
                    className={styles.checkboxTargetInput}
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={handleChange}
                />
                <span className={styles.checkboxTargetInner} />
            </span>

            <span>{children}</span>
        </label>
    );
}
