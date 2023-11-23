import RcInputNumber from 'rc-input-number';
import React from 'react';

import styles from './index.module.less';

export interface IInputNumberProps {
    /**
     * The input content value
     */
    value?: number | null;

    /**
     * The maximum value of the input
     */
    max?: number;

    /**
     * The minimum value of the input
     */
    min?: number;

    /**
     * The step of the input
     * @default 1
     */
    step?: number;

    /**
     * The precision of the input
     */
    precision?: number;

    /**
     * Whether the input is disabled
     * @default false
     */
    disabled?: boolean;

    /**
     * Whether to show the up and down buttons
     * @default true
     */
    controls?: boolean;

    /**
     * Callback when user click
     * @param e
     */
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;

    /**
     * Callback when user press a key
     * @param e
     */
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;

    /**
     * Callback when user input
     * @param value
     */
    onChange?: (value: number | null) => void;

    /**
     * Callback when user press enter
     * @param e
     */
    onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function InputNumber(props: IInputNumberProps) {
    const {
        value,
        max,
        min,
        step = 1,
        precision,
        disabled = false,
        controls = true,
        onClick,
        onKeyDown,
        onChange,
        onPressEnter,
    } = props;

    function handleChange(value: number | null) {
        if (value !== null) {
            onChange?.(value);
        }
    }

    return (
        <RcInputNumber
            prefixCls={styles.inputNumber}
            value={value}
            max={max}
            min={min}
            step={step}
            precision={precision}
            disabled={disabled}
            controls={controls}
            onClick={onClick}
            onKeyDown={onKeyDown}
            onChange={handleChange}
            onPressEnter={onPressEnter}
        />
    );
}
