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

import React from 'react';

import clsx from 'clsx';
import type { IRadioProps } from '../radio/Radio';
import styles from './index.module.less';

export interface IRadioGroupProps {
    children: React.ReactNode[];

    /**
     * The class name of the checkbox group
     */
    className?: string;

    /**
     * The style of the checkbox group
     */
    style?: React.CSSProperties;

    /**
     * Define which radio is selected
     */
    value: string;

    /**
     * Whether the radio is disabled
     * @default false
     */
    disabled?: boolean;

    /**
     * Direction of the radio group
     * @default 'horizontal'
     */
    direction?: 'horizontal' | 'vertical';

    /**
     * The callback function triggered when switching options
     */
    onChange: (value: string | number | boolean) => void;
}

/**
 * RadioGroup Component
 */
export function RadioGroup(props: IRadioGroupProps) {
    const { children, className, style, value, disabled = false, direction = 'horizontal', onChange } = props;

    const handleChange = (value: string | number | boolean) => {
        onChange(value);
    };

    const _className = clsx(className, styles.radioGroup, {
        [styles.radioGroupDirectionVertical]: direction === 'vertical',
    });

    return (
        <div className={clsx(styles.radioGroup, _className)} style={style}>
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement<IRadioProps>(child)) {
                    return React.cloneElement(child, {
                        key: index,
                        children: child.props.children,
                        value: child.props.value,
                        checked: value === child.props.value,
                        disabled: disabled ?? child.props.disabled,
                        onChange: handleChange,
                    });
                }
                return child;
            })}
        </div>
    );
}
