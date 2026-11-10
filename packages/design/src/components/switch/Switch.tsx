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

import type { ChangeEvent, InputHTMLAttributes } from 'react';
import { useState } from 'react';
import { clsx } from '../../helper/clsx';

export interface ISwitchProps extends Pick<InputHTMLAttributes<HTMLInputElement>, 'id' | 'aria-label' | 'aria-labelledby' | 'aria-describedby'> {
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
}

const Switch = (props: ISwitchProps) => {
    const { defaultChecked = false, onChange, ...inputProps } = props;
    const [state, setState] = useState({ checked: defaultChecked, defaultChecked });
    if (state.defaultChecked !== defaultChecked) {
        setState({ checked: defaultChecked, defaultChecked });
    }
    const { checked } = state;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextChecked = event.target.checked;
        setState({ checked: nextChecked, defaultChecked });
        onChange?.(nextChecked);
    };

    return (
        <div className="univer-h-4">
            <label className="univer-relative univer-inline-block univer-h-4 univer-w-7">
                <input
                    {...inputProps}
                    className="univer-peer univer-sr-only"
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                />
                <span
                    className={clsx(`
                      univer-absolute univer-inset-0 univer-cursor-pointer univer-rounded-2xl univer-transition-colors
                      univer-duration-200
                      peer-focus:univer-ring-2 peer-focus:univer-ring-primary-600 peer-focus:univer-ring-offset-2
                    `, {
                        'univer-bg-primary-600': checked,
                        'univer-bg-gray-200 dark:!univer-bg-gray-600': !checked,
                    })}
                >
                    <span
                        className={clsx(`
                          univer-absolute univer-bottom-0.5 univer-left-0.5 univer-size-3 univer-rounded-full
                          univer-bg-gray-0 univer-transition-transform univer-duration-200
                        `, {
                            'univer-translate-x-3': checked,
                        })}
                    />
                </span>
            </label>
        </div>
    );
};

export { Switch };
