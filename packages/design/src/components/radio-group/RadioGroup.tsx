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
import { Children, cloneElement, isValidElement, useId } from 'react';
import type { IRadioProps } from '../radio/Radio';
import { clsx } from '../../helper/clsx';

export interface IRadioGroupProps {
    children: ReactNode[];
    name?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;

    /**
     * The class name of the radio group
     */
    className?: string;

    /**
     * The style of the radio group
     */
    style?: CSSProperties;

    /**
     * Define which radio is selected
     */
    value: string;

    /**
     * Whether the radio group is disabled
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
    const {
        children,
        name,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledby,
        className,
        style,
        value,
        disabled = false,
        direction = 'horizontal',
        onChange,
    } = props;

    const groupId = useId();
    const groupName = name ?? groupId;

    const handleChange = (nextValue: string | number | boolean) => {
        onChange(nextValue);
    };

    return (
        <div
            data-u-comp="radio-group"
            role="radiogroup"
            aria-orientation={direction}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            className={clsx(
                'univer-flex',
                direction === 'vertical'
                    ? 'univer-flex-col univer-gap-2.5'
                    : 'univer-flex-wrap univer-items-center univer-gap-x-4 univer-gap-y-2',
                className
            )}
            style={style}
        >
            {Children.map(children, (child, index) => {
                if (isValidElement<IRadioProps>(child)) {
                    return cloneElement(child, {
                        key: child.key ?? index,
                        children: child.props.children,
                        name: child.props.name ?? groupName,
                        value: child.props.value,
                        checked: value === child.props.value,
                        disabled: Boolean(disabled || child.props.disabled),
                        onChange: handleChange,
                    });
                }
                return child;
            })}
        </div>
    );
}
