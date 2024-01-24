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

import { CheckMarkSingle } from '@univerjs/icons';
import clsx from 'clsx';
import React, { useMemo } from 'react';

import styles from './index.module.less';

interface IOption {
    label: string;
    value: string;
    color?: string;
    children?: IOption[];
}

export interface ICascaderListProps {
    /**
     * The value of select
     */
    value: string[];

    /**
     * The options of select
     * @default []
     */
    options?: IOption[];

    /**
     * The callback function that is triggered when the value is changed
     */
    onChange: (value: string[]) => void;
}

export function CascaderList(props: ICascaderListProps) {
    const { value, options = [], onChange } = props;

    const activeOptions = useMemo(() => {
        const activeOptions = [options];
        value.forEach((item, index) => {
            const option = activeOptions[index].find((option) => option.value === item);

            if (option?.children) {
                activeOptions.push(option.children);
            }
        });

        return activeOptions;
    }, [value]);

    function handleChange(index: number, v: string) {
        if (v === props.value[index]) {
            return;
        }

        if (props.value[index + 1]) {
            const newValue = props.value.slice(0, index + 1);
            newValue[index] = v;

            onChange(newValue);
            return;
        }

        const newValue = [...props.value];
        newValue[index] = v;

        onChange(newValue);
    }

    return (
        <section className={styles.cascaderList}>
            {activeOptions.map((options, index) =>
                options.length
                    ? (
                        <ul key={index} className={styles.cascaderListBoard}>
                            {options.map((option) => (
                                <li
                                    key={option.value}
                                    className={clsx(styles.cascaderListItem, {
                                        [styles.cascaderListItemActive]: option.value === value[index],
                                    })}
                                >
                                    <a
                                        className={styles.cascaderListOption}
                                        onClick={() => handleChange(index, option.value)}
                                    >
                                        <span className={styles.cascaderListCheckMark}>
                                            {option.value === value[index] && <CheckMarkSingle />}
                                        </span>
                                        <span>{option.label}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )
                    : (
                        <section key={index} className={styles.cascaderListEmpty}>
                            无
                        </section>
                    )
            )}
            {value.length <= 0 && <section className={styles.cascaderListEmpty}>无</section>}
        </section>
    );
}
