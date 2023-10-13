import { DropdownPromptSmall8 } from '@univerjs/icons';
import React, { useRef, useState } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { joinClassNames } from '../../Utils/util';
import styles from './Style/index.module.less';

export interface BaseInputNumberProps extends BaseComponentProps {
    /**
     * Input's class name
     */
    className?: string;

    /** Semantic DOM style */
    style?: React.CSSProperties;

    /**
     * The input content value
     */
    value?: number;

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
    onChange,
    min = -Infinity,
    max = Infinity,
    onPressEnter,
    onBlur,
    readonly = false,
    disabled = false,
    bordered = true,
    className = '',
    style = {},
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
        if (readonly) return;

        const newValue = inputValue + 1;
        if (newValue <= max) {
            setInputValue(newValue);
            if (onChange) {
                onChange(newValue);
            }
        }
    };

    const handleDecrement = () => {
        if (readonly) return;

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
        <div className={`${styles.inputNumber} ${className}`} style={style}>
            <div className={styles.inputWrap}>
                <input
                    ref={ref}
                    type="text"
                    value={inputValue}
                    disabled={disabled}
                    onChange={handleInputChange}
                    className={classes}
                    onKeyUp={handlePressEnter}
                    onBlur={handleBlur}
                    readOnly={readonly}
                />
            </div>

            <div className={styles.inputButtons} style={{ display: disabled ? 'none' : 'flex' }}>
                <button onClick={handleIncrement} className={styles.inputButton}>
                    <span>
                        <DropdownPromptSmall8 style={{ transform: 'rotateZ(180deg)' }} />
                    </span>
                </button>
                <button onClick={handleDecrement} className={styles.inputButton}>
                    <span>
                        <DropdownPromptSmall8 />
                    </span>
                </button>
            </div>
        </div>
    );
};
