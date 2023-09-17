import React, { useRef, useState } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { joinClassNames } from '../../Utils/util';
import styles from './Style/index.module.less';

// TODO@Dushusir disabled/bordered handle buttons

export interface BaseInputNumberProps extends BaseComponentProps {
    /**
     * The input content value
     */
    value?: number;

    /**
     * The input content placeholder
     */
    placeholder?: string;

    /**
     * minimum value
     */
    min?: number;

    /**
     * maximum number
     */
    max?: number;

    /**
     * Whether the input is read only
     * @default false
     */
    readonly?: boolean;

    /**
     * Whether the input is disabled
     * @default false
     */
    disabled?: boolean;

    /**
     * Whether has border style
     * @default true
     */
    bordered?: boolean;

    /**
     * Callback when user input
     */
    onChange?: (value: number) => void;

    /**
     * The callback function that is triggered when Enter key is pressed
     */
    onPressEnter?: (value: number) => void;

    /**
     * Whether the input is blur
     */
    onBlur?: (value: number) => void;
}

/**
 * Input Number Component
 */
export const InputNumber: React.FC<BaseInputNumberProps> = ({
    value = 0,
    placeholder = '',
    onChange,
    min = -Infinity,
    max = Infinity,
    onPressEnter,
    onBlur,
    readonly = false,
    disabled = false,
    bordered = true,
}) => {
    const [inputValue, setInputValue] = useState(value);
    const ref = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = parseFloat(e.target.value);
        if (isNaN(newValue)) {
            newValue = 0;
        }
        if (newValue < min) {
            newValue = min;
        } else if (newValue > max) {
            newValue = max;
        }
        setInputValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    const handleIncrement = () => {
        const newValue = inputValue + 1;
        if (newValue <= max) {
            setInputValue(newValue);
            if (onChange) {
                onChange(newValue);
            }
        }
    };

    const handleDecrement = () => {
        const newValue = inputValue - 1;
        if (newValue >= min) {
            setInputValue(newValue);
            if (onChange) {
                onChange(newValue);
            }
        }
    };

    const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onPressEnter) {
            onPressEnter(inputValue);
            ref.current?.blur();
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
        if (onBlur) {
            onBlur(inputValue);
        }
    };

    const classes = joinClassNames(styles.input, {
        [`${styles.input}-disable`]: disabled,
        [`${styles.input}-borderless`]: !bordered,
    });

    return (
        <div className={styles.inputNumber}>
            <div className={styles.inputWrap}>
                <input
                    ref={ref}
                    type="text"
                    placeholder={placeholder}
                    value={inputValue}
                    disabled={disabled}
                    onChange={handleInputChange}
                    className={classes}
                    onKeyUp={handlePressEnter}
                    onBlur={handleBlur}
                    readOnly={readonly}
                />
            </div>

            <div className={styles.inputButtons}>
                <button onClick={handleIncrement} className={styles.inputButton}>
                    <span>+</span>
                </button>
                <button onClick={handleDecrement} className={styles.inputButton}>
                    <span>-</span>
                </button>
            </div>
        </div>
    );
};
