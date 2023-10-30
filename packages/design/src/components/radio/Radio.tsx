import clsx from 'clsx';
import { useRef } from 'react';

import styles from './index.module.less';

export interface IRadioProps {
    children?: React.ReactNode;

    /**
     * Used for setting the currently selected value
     * @default false
     */
    checked?: boolean;

    /**
     * Used for setting the currently selected value
     */
    value?: string | number | boolean;

    /**
     * Specifies whether the radio is disabled
     * @default false
     */
    disabled?: boolean;

    /**
     * Set the handler to handle `click` event
     */
    onChange?: (value: string | number | boolean) => void;
}

/**
 * Radio Component
 */
export function Radio(props: IRadioProps) {
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

    const _className = clsx(styles.radio, {
        [styles.radioDisabled]: disabled,
    });

    return (
        <label className={_className}>
            <span className={styles.radioTarget}>
                <input
                    ref={inputRef}
                    className={styles.radioTargetInput}
                    type="radio"
                    checked={checked}
                    disabled={disabled}
                    onChange={handleChange}
                />
                <span className={styles.radioTargetInner} />
            </span>

            <span>{children}</span>
        </label>
    );
}
