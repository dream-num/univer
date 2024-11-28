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

import type { InputProps } from 'rc-input';
import { CloseSingle } from '@univerjs/icons';
import clsx from 'clsx';
import RcInput from 'rc-input';
import React from 'react';

import styles from './index.module.less';

export interface IInputProps extends Pick<InputProps, 'onFocus' | 'onBlur'> {
    /**
     * Whether the input is autoFocus
     * @default false
     */
    autoFocus?: boolean;

    /**
     * The input class name
     */
    className?: string;

    /**
     * The input affix wrapper style
     */
    affixWrapperStyle?: React.CSSProperties;

    /**
     * The input type
     * @default text
     */
    type?: 'text' | 'password';

    /**
     * The input placeholder
     */
    placeholder?: string;

    /**
     * The input content value
     */
    value?: string;

    /**
     * The input size
     * @default middle
     */
    size?: 'small' | 'middle' | 'large';

    /**
     * Whether the input is clearable
     * @default false
     */
    allowClear?: boolean;

    /**
     * Whether the input is disabled
     * @default false
     */
    disabled?: boolean;

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
    onChange?: (value: string) => void;

}

export function Input(props: IInputProps) {
    const {
        affixWrapperStyle,
        autoFocus = false,
        type = 'text',
        className,
        placeholder,
        value,
        size = 'middle',
        allowClear,
        disabled = false,
        onClick,
        onKeyDown,
        onChange,
        ...rest
    } = props;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { value } = e.target;
        onChange?.(value);
    }

    const _className = clsx(className, {
        [styles.inputAffixWrapperSmall]: size === 'small',
        [styles.inputAffixWrapperMiddle]: size === 'middle',
        [styles.inputAffixWrapperLarge]: size === 'large',
        [styles.inputNotAllowClear]: !allowClear,
    }, className);

    return (
        <RcInput
            prefixCls={styles.input}
            classNames={{ affixWrapper: _className }}
            styles={{ affixWrapper: affixWrapperStyle }}
            autoFocus={autoFocus}
            type={type}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            onClick={onClick}
            onKeyDown={onKeyDown}
            onChange={handleChange}
            allowClear={{ clearIcon: allowClear ? <CloseSingle /> : <></> }}
            {...rest}
        />
    );
}
