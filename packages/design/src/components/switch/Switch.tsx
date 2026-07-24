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

import { useEffect, useState } from 'react';
import { clsx } from '../../helper/clsx';

export interface ISwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
    onChange?: (checked: boolean) => void;
}

const Switch = (props: ISwitchProps) => {
    const {
        checked,
        defaultChecked = false,
        disabled = false,
        ariaLabel,
        onChange,
    } = props;
    const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
    const isControlled = checked !== undefined;
    const currentChecked = isControlled ? checked : uncontrolledChecked;

    const handleChange = () => {
        if (disabled) {
            return;
        }

        const nextChecked = !currentChecked;
        if (!isControlled) {
            setUncontrolledChecked(nextChecked);
        }
        onChange?.(nextChecked);
    };

    useEffect(() => {
        if (!isControlled) {
            setUncontrolledChecked(defaultChecked);
        }
    }, [defaultChecked, isControlled]);

    return (
        <div className="univer-h-4">
            <label className="univer-relative univer-inline-block univer-h-4 univer-w-7">
                <input
                    className="univer-size-0 univer-opacity-0"
                    type="checkbox"
                    aria-label={ariaLabel}
                    checked={currentChecked}
                    disabled={disabled}
                    onChange={handleChange}
                />
                <span
                    className={clsx(`
                      univer-absolute univer-inset-0 univer-cursor-pointer univer-rounded-2xl univer-transition-colors
                      univer-duration-200
                    `, {
                        'univer-bg-primary-600': currentChecked,
                        'univer-bg-gray-200 dark:!univer-bg-gray-600': !currentChecked,
                        'univer-cursor-not-allowed univer-opacity-60': disabled,
                    })}
                >
                    <span
                        className={clsx(`
                          univer-absolute univer-bottom-0.5 univer-left-0.5 univer-size-3 univer-rounded-full
                          univer-bg-white univer-transition-transform univer-duration-200
                        `, {
                            'univer-translate-x-3': currentChecked,
                        })}
                    />
                </span>
            </label>
        </div>
    );
};

export { Switch };
