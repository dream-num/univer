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

import React, { useMemo } from 'react';

import styles from './index.module.less';

export interface IPagerProps {
    value: number;
    total: number;
    loop?: boolean;

    onChange?(value: number): void;
}

export function Pager(props: IPagerProps) {
    const { value: current = 0, total: count = 0, loop } = props;
    const text = useMemo(() => `${current}/${count}`, [current, count]);

    const onClickLeftArrow = () => {
        if (current === 1) {
            if (loop) {
                props.onChange?.(count);
            }
        } else {
            props.onChange?.(current - 1);
        }
    };

    const onClickRightArrow = () => {
        if (current === count) {
            if (loop) {
                props.onChange?.(1);
            }
        } else {
            props.onChange?.(current + 1);
        }
    };

    return (
        <div className={styles.pager}>
            <div role="button" className={styles.pagerLeftArrow} onClick={onClickLeftArrow}>
                ⬅️
            </div>
            <div className={styles.pagerNumber}>{text}</div>
            <div role="button" className={styles.pagerRightArrow} onClick={onClickRightArrow}>
                ➡️
            </div>
        </div>
    );
}
