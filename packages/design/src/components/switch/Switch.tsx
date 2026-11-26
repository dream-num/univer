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

import type { ChangeEvent, CSSProperties, InputHTMLAttributes, ReactNode } from 'react';
import { useContext, useState } from 'react';
import { clsx } from '../../helper/clsx';
import { ConfigContext } from '../config-provider/ConfigProvider';

export interface ISwitchProps extends Pick<InputHTMLAttributes<HTMLInputElement>, 'id' | 'name' | 'aria-label' | 'aria-labelledby' | 'aria-describedby'> {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    contentClassName?: string;
    onChange?: (checked: boolean) => void;
}

const Switch = (props: ISwitchProps) => {
    const {
        checked: controlledChecked,
        defaultChecked = false,
        disabled = false,
        children,
        className,
        style,
        contentClassName,
        onChange,
        ...inputProps
    } = props;
    const { direction } = useContext(ConfigContext);
    const [state, setState] = useState({ checked: defaultChecked, defaultChecked });
    if (controlledChecked === undefined && state.defaultChecked !== defaultChecked) {
        setState({ checked: defaultChecked, defaultChecked });
    }
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : state.checked;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (disabled) {
            return;
        }
        const nextChecked = event.target.checked;
        if (!isControlled) {
            setState({ checked: nextChecked, defaultChecked });
        }
        onChange?.(nextChecked);
    };

    const hasChildren = children !== undefined && children !== null && children !== false;

    return (
        <label
            data-u-comp="switch"
            dir={direction}
            className={clsx(
                'univer-group univer-inline-flex univer-items-center univer-gap-2 univer-text-sm univer-leading-5',
                disabled
                    ? `
                      univer-cursor-not-allowed univer-text-gray-400
                      dark:!univer-text-gray-500
                    `
                    : `
                      univer-cursor-pointer univer-text-gray-900
                      dark:!univer-text-gray-0
                    `,
                className
            )}
            style={style}
        >
            <span className="univer-relative univer-inline-block univer-h-5 univer-w-9 univer-shrink-0">
                <input
                    {...inputProps}
                    className="univer-peer univer-sr-only"
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={handleChange}
                />
                <span
                    className={clsx(
                        `
                          univer-absolute univer-inset-0 univer-rounded-full univer-transition-colors
                          univer-duration-200
                          peer-focus-visible:univer-outline peer-focus-visible:univer-outline-2
                          peer-focus-visible:univer-outline-offset-2 peer-focus-visible:univer-outline-primary-600
                          motion-reduce:univer-transition-none
                          dark:peer-focus-visible:!univer-outline-primary-300
                        `,
                        disabled ? 'univer-cursor-not-allowed univer-opacity-50' : 'univer-cursor-pointer',
                        checked
                            ? [
                                'univer-bg-primary-600',
                                !disabled && `
                                  group-hover:univer-bg-primary-500
                                  group-active:univer-bg-primary-700
                                `,
                            ]
                            : [
                                `
                                  univer-bg-gray-300
                                  dark:!univer-bg-gray-600
                                `,
                                !disabled && `
                                  group-hover:univer-bg-gray-400
                                  dark:group-hover:!univer-bg-gray-500
                                `,
                            ]
                    )}
                >
                    <span
                        aria-hidden="true"
                        className={clsx(
                            `
                              univer-absolute univer-left-0.5 univer-top-0.5 univer-size-4 univer-rounded-full
                              univer-bg-gray-0 univer-shadow-sm univer-transition-transform univer-duration-200
                              motion-reduce:univer-transition-none
                              rtl:univer-left-auto rtl:univer-right-0.5
                            `,
                            checked && `
                              univer-translate-x-4
                              rtl:-univer-translate-x-4
                            `
                        )}
                    />
                </span>
            </span>
            {hasChildren && <span className={clsx('univer-select-none', contentClassName)}>{children}</span>}
        </label>
    );
};

export { Switch };
