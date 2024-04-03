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

import clsx from 'clsx';
import type { TextAreaProps } from 'rc-textarea';
import RcTextarea from 'rc-textarea';
import React from 'react';

import styles from './index.module.less';

export interface ITextareaProps extends Pick<TextAreaProps, 'onFocus' | 'onBlur'> {
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
    style?: React.CSSProperties;

    /**
     * The input affix wrapper style
     */
    autoSize?: boolean | { minRows?: number; maxRows?: number };

    /**
     * The input placeholder
     */
    placeholder?: string;

    /**
     * The input content value
     */
    value?: string;

    /**
     * Whether the input is disabled
     * @default false
     */
    disabled?: boolean;

    /**
     * Callback when user press a key
     * @param e
     */
    onKeyDown?: React.KeyboardEventHandler;

    /**
     * Callback when user input
     * @param value
     */
    onChange?: (value: string) => void;

}

export function Textarea(props: ITextareaProps) {
    const {
        autoFocus = false,
        autoSize = false,
        className,
        placeholder,
        value,
        disabled = false,
        onKeyDown,
        onChange,
        ...rest
    } = props;

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const { value } = e.target;
        onChange?.(value);
    }

    const _className = clsx(className, {
    }, className);

    return (
        <RcTextarea
            prefixCls={styles.textarea}
            classNames={{ affixWrapper: _className }}
            autoFocus={autoFocus}
            autoSize={autoSize}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            onKeyDown={onKeyDown}
            onChange={handleChange}
            {...rest}
        />
    );
}
