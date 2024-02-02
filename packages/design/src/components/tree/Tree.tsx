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

import { CheckMarkSingle, DropdownSingle } from '@univerjs/icons';
import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';

import styles from './index.module.less';

export enum TreeSelectionMode {
    ONLY_LEAF_NODE,

    ALL,
}

export interface ITreeNodeProps {
    title: string;
    key: string;
    children?: ITreeNodeProps[];
}

export interface ITreeProps {
    data?: ITreeNodeProps[];

    /**
     * Set whether to expand all nodes by default
     * @default false
     */
    defaultExpandAll?: boolean;

    /**
     * Set the selection mode
     * @default TreeSelectionMode.ALL
     * @description
     * - `TreeSelectionMode.ONLY_LEAF_NODE` only select leaf node
     * - `TreeSelectionMode.ALL` select all node
     */
    selectionMode?: TreeSelectionMode;

    /**
     * Used for setting the currently selected value
     */
    value?: string | number | boolean;

    /**
     * Set the handler to handle `click` event
     */
    onChange?: (value: string | number | boolean) => void;
}

type TreeItemProps = ITreeNodeProps & {
    _selected?: boolean;
    _expand?: boolean;
};

/**
 * Tree Component
 */
export function Tree(props: ITreeProps) {
    const { data = [], defaultExpandAll = false, selectionMode = TreeSelectionMode.ALL, value, onChange } = props;

    const [expandKeys, setExpandKeys] = useState<Array<string | number | boolean>>([]);

    useEffect(() => {
        function walkData(item: ITreeNodeProps) {
            setExpandKeys((prev) => [...prev, item.key]);

            item.children?.forEach(walkData);
        }
        if (defaultExpandAll) {
            data.forEach(walkData);
        }
    }, [defaultExpandAll, data]);

    const computedData = useMemo(() => {
        return data.map(function walkData(item): TreeItemProps {
            const { title, key, children } = item;

            return {
                title,
                key,
                children: children && children.map(walkData),
                _selected: key === value,
                _expand: expandKeys.includes(key),
            };
        });
    }, [value, expandKeys]);

    function handleSelectItem(treeItem: ITreeNodeProps) {
        if (treeItem.children) {
            setExpandKeys((prev) => {
                const index = prev.findIndex((key) => key === treeItem.key);

                if (index === -1) {
                    return [...prev, treeItem.key];
                }

                return [...prev.slice(0, index), ...prev.slice(index + 1)];
            });
        }

        if (selectionMode === TreeSelectionMode.ONLY_LEAF_NODE) {
            if (treeItem.children) {
                return;
            }
        }

        onChange?.(treeItem.key);
    }

    function walkTree(treeItem: TreeItemProps) {
        const { title, key, children, _selected, _expand } = treeItem;

        return (
            <li
                key={key}
                className={styles.treeListItem}
                onClick={(e) => {
                    e.stopPropagation();
                    handleSelectItem(treeItem);
                }}
            >
                <a
                    className={clsx(styles.treeListItemContent, {
                        [styles.treeListItemContentSelected]: _selected,
                    })}
                >
                    {children && children.length > 0 && (
                        <span
                            className={clsx(styles.treeIcon, {
                                [styles.treeIconExpand]: _expand,
                            })}
                        >
                            <DropdownSingle />
                        </span>
                    )}
                    {_selected && (
                        <span className={styles.treeListItemContentSelectedIcon}>
                            <CheckMarkSingle />
                        </span>
                    )}
                    <span>{title}</span>
                </a>
                {children && (
                    <ul
                        className={clsx(styles.treeList, {
                            [styles.treeListExpand]: _expand,
                        })}
                    >
                        {children.map((item) => walkTree(item))}
                    </ul>
                )}
            </li>
        );
    }

    return (
        <section className={styles.tree}>
            <ul className={styles.treeList}>{computedData.map((item) => walkTree(item))}</ul>
        </section>
    );
}
