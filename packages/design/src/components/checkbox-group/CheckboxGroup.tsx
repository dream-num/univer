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
import type { ICheckboxProps } from '../checkbox/Checkbox';
import { Children, cloneElement, isValidElement } from 'react';
import { clsx } from '../../helper/clsx';
import styles from './index.module.less';

export interface ICheckboxGroupProps {
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
     * Define which checkbox is selected
     */
    value: Array<string | number | boolean>;

    /**
     * Whether the checkbox is disabled
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
    onChange: (value: Array<string | number | boolean>) => void;
}

/**
 * CheckboxGroup Component
 */
export function CheckboxGroup(props: ICheckboxGroupProps) {
    const { children, className, style, value, disabled, direction = 'horizontal', onChange } = props;

    const handleChange = (item: string | number | boolean) => {
        if (value.includes(item)) {
            onChange(value.filter((i) => i !== item));
        } else {
            onChange([...value, item]);
        }
    };

    const _className = clsx(className, styles.checkboxGroup, {
        [styles.checkboxGroupDirectionVertical]: direction === 'vertical',
    });

    return (
        <div className={_className} style={style}>
            {Children.map(children, (child, index) => {
                if (isValidElement<ICheckboxProps>(child)) {
                    return cloneElement(child, {
                        key: index,
                        children: child.props.children,
                        checked: child.props.value ? value.includes(child.props.value) : false,
                        disabled: disabled ?? child.props.disabled,
                        onChange: handleChange,
                    });
                }
                return child;
            })}
        </div>
    );
}
