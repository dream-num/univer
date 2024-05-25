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

import { type IRange, Tools } from '@univerjs/core';
import React, { useCallback, useEffect, useState } from 'react';
import { type IOrderRule, SortType } from '@univerjs/sheets-sort';
import { serializeRange } from '@univerjs/engine-formula';
import { Radio, RadioGroup } from '@univerjs/design';
import styles from './index.module.less';

export interface ICustomSortPanelProps {
    range: IRange;
    onListChange: (value: IOrderRule[]) => void;
}

export function CustomSortPanel(props: ICustomSortPanelProps) {
    const { range, onListChange } = props;
    const [list, setList] = useState<IOrderRule[]>([]);
    const onItemChange = useCallback((index: number, value: IOrderRule) => {
        const newList = [...list];
        newList[index] = value;
        setList(newList);
    }, [list]);
    const newItem = useCallback(() => {
        const newList = [...list];
        const nextColIndex = findNextColIndex(range, list);
        if (nextColIndex !== null) {
            newList.push({ type: SortType.ASC, colIndex: nextColIndex });
            setList(newList);
        }
    }, [list, range]);
    useEffect(() => {
        onListChange(list);
    }, [list, onListChange]);

    return (
        <div className={styles.customSortPanelContainer}>
            <div className={styles.customSortPanelTitle}>
                <span>排序范围</span>
                <span>{serializeRange(range)}</span>
            </div>
            <div className={styles.customSortPanelContent}>
                {list.map((item, index) => (
                    <SortOptionItem
                        key={index} // Use a unique identifier for each item as the key
                        item={item}
                        onChange={(value: IOrderRule) => {
                            onItemChange(index, value);
                        }}
                    />
                ))}
                <button onClick={newItem} onKeyDown={newItem}>新建排序条件</button>
            </div>
        </div>
    );
}

export function SortOptionItem(props: { item: IOrderRule; onChange: (value: IOrderRule) => void }) {
    return (
        <div className={styles.customSortPanelItem}>
            <div className={styles.customSortPanelItemHandler}>X</div>
            <div className={styles.customSortPanelItemColumn}>{Tools.chatAtABC(props.item.colIndex)}</div>
            <div className={styles.customSortPanelItemOrder}>
                <RadioGroup
                    value={props.item.type}
                    onChange={(value) => {
                        props.onChange({ ...props.item, type: value as SortType });
                    }}
                >
                    <Radio value={SortType.ASC}>A-Z</Radio>
                    <Radio value={SortType.DESC}>Z-A</Radio>
                </RadioGroup>
            </div>
        </div>
    );
}

function findNextColIndex(range: IRange, list: IOrderRule[]): number | null {
    const { startColumn, endColumn } = range;
    const used = new Set(list.map((item) => item.colIndex));
    for (let i = startColumn; i <= endColumn; i++) {
        if (!used.has(i)) {
            return i;
        }
    }
    return null;
}

