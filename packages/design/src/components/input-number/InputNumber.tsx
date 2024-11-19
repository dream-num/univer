/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { InputNumberProps } from 'rc-input-number';
import RcInputNumber from 'rc-input-number';
import React, { forwardRef } from 'react';

import styles from './index.module.less';

export interface IInputNumberProps {
    /**
     * The className of the input
     */
    className?: string;

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
     * Callback when user focus
     * @param e
     */
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;

    /**
     * Callback when user blur
     * @param e
     */
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;

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
    onPressEnter?: InputNumberProps['onPressEnter'];
}

export const InputNumber = forwardRef<HTMLInputElement, IInputNumberProps>((props, ref) => {
    const {
        className,
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
        onBlur,
        onFocus,
    } = props;

    function handleChange(value: number | null) {
        if (value !== null) {
            onChange?.(value);
        }
    }

    return (
        <RcInputNumber
            ref={ref}
            prefixCls={styles.inputNumber}
            className={className}
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
            onFocus={onFocus}
            onBlur={onBlur}
        />
    );
});
