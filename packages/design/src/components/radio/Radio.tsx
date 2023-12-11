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
