/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { CSSProperties, ReactNode } from 'react';
import type { IRadioProps } from '../radio/Radio';
import { Children, cloneElement, isValidElement } from 'react';
import { clsx } from '../../helper/clsx';

export interface IRadioGroupProps {
    children: ReactNode[];

    /**
     * The class name of the checkbox group
     */
    className?: string;

    /**
     * The style of the checkbox group
     */
    style?: CSSProperties;

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

    return (
        <div
            className={clsx('univer-flex univer-gap-2', {
                'univer-flex-col': direction === 'vertical',
            }, className)}
            style={style}
        >
            {Children.map(children, (child, index) => {
                if (isValidElement<IRadioProps>(child)) {
                    return cloneElement(child, {
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
