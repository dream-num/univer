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
import React, { useRef } from 'react';

import styles from './index.module.less';

export interface ICheckboxProps {
    children?: React.ReactNode;

    /**
     * The class name of the checkbox group
     */
    className?: string;

    /**
     * The style of the checkbox group
     */
    style?: React.CSSProperties;

    /**
     * Used for setting the currently selected value
     * @default false
     */
    checked?: boolean;

    /**
     * Used for setting the checkbox to indeterminate
     * @default false
     */
    indeterminate?: boolean;

    /**
     * Used for setting the currently selected value
     * Only used when the checkbox is in a group
     */
    value?: string | number | boolean;

    /**
     * Specifies whether the checkbox is disabled
     * @default false
     */
    disabled?: boolean;

    /**
     * Set the handler to handle `click` event
     */
    onChange?: (value: string | number | boolean) => void;

    contentClassName?: string;
}

/**
 * Checkbox Component
 */
export function Checkbox(props: ICheckboxProps) {
    const { children, className, style, checked = false, indeterminate = false, value, disabled = false, onChange, contentClassName } = props;

    const inputRef = useRef<HTMLInputElement>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.stopPropagation();

        if (!onChange || disabled) return;

        if (typeof value !== 'undefined') {
            onChange?.(value);
        } else {
            const checked = inputRef?.current?.checked ?? false;
            onChange?.(checked);
        }
    }

    const _className = clsx(className, styles.checkbox, {
        [styles.checkboxDisabled]: disabled,
        [styles.checkboxIndeterminate]: indeterminate && !checked,
    });

    return (
        <label className={_className} style={style}>
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

            <span className={contentClassName}>{children}</span>
        </label>
    );
}
