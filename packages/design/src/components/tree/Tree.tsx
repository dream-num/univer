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

import { DropdownSingle } from '@univerjs/icons';
import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox } from '../checkbox';

import styles from './index.module.less';
import { createCacheWithFindNodePathFromTree, filterLeafNode, isIntermediated, mergeTreeSelected } from './util';

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
     * Used for setting the currently selected value,leaf node.
     */
    valueGroup?: string[];

    /**
     * Set the handler to handle `click` event
     */
    onChange?: (node: ITreeNodeProps, allSelectedNode: ITreeNodeProps[]) => void;

    onExpend?: (value: string) => void;
}

type TreeItemProps = ITreeNodeProps & {
    _selected?: boolean;
    _expand?: boolean;
    _intermediated?: boolean;
};

/**
 * Tree Component
 */
export function Tree(props: ITreeProps) {
    const { data = [], defaultExpandAll = false, selectionMode = TreeSelectionMode.ALL, valueGroup = [], onChange, onExpend } = props;
    const [update, forceUpdate] = useState({});
    const expandKeySet = useMemo(() => {
        return new Set<string>();
    }, [data]);

    const findNode = useMemo(() => createCacheWithFindNodePathFromTree(data), [data]);

    const selectedNodeKeySet = useMemo(() => {
        const set = new Set<string>();
        valueGroup.forEach((key) => {
            const path = findNode.findNodePathFromTreeWithCache(key);
            path.forEach((k) => set.add(k));
        });
        return set;
    }, [valueGroup, findNode]);

    useEffect(() => {
        function walkData(item: ITreeNodeProps) {
            expandKeySet.add(item.key);
            item.children?.forEach(walkData);
        }
        if (defaultExpandAll) {
            data.forEach(walkData);
        }
        forceUpdate({});
    }, [defaultExpandAll, data]);

    const computedData = useMemo(() => {
        return data.map((item) => {
            function walkData(item: ITreeNodeProps): TreeItemProps {
                const { title, key, children } = item;
                const isExpand = expandKeySet.has(key);
                const isSelected = selectedNodeKeySet.has(key);
                const intermediated = isIntermediated(selectedNodeKeySet, item);

                return {
                    title,
                    key,
                    children: children && children.map((item) => walkData(item)),
                    _selected: isSelected,
                    _expand: isExpand,
                    _intermediated: intermediated,
                };
            }
            return walkData(item);
        });
    }, [selectedNodeKeySet, expandKeySet, update]);

    function handleChange(treeItem: TreeItemProps) {
        const path: string[] = findNode.findNodePathFromTreeWithCache(treeItem.key);
        const result = mergeTreeSelected(data, [...selectedNodeKeySet], path);
        onChange?.(treeItem, filterLeafNode(data, result));
    }

    function handleExpendItem(treeItem: ITreeNodeProps) {
        if (treeItem.children?.length) {
            if (expandKeySet.has(treeItem.key)) {
                expandKeySet.delete(treeItem.key);
            } else {
                expandKeySet.add(treeItem.key);
            }
            forceUpdate({});
        }
        if (selectionMode === TreeSelectionMode.ONLY_LEAF_NODE) {
            if (treeItem.children) {
                return;
            }
        }

        onExpend?.(treeItem.key);
    }

    function walkTree(treeItem: TreeItemProps) {
        const { title, key, children, _selected, _expand, _intermediated } = treeItem;
        return (
            <li
                key={key}
                className={styles.treeListItem}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                handleExpendItem(treeItem);
                            }}
                        >
                            <DropdownSingle />
                        </span>
                    )}
                    <Checkbox
                        checked={_selected && !_intermediated}
                        indeterminate={_selected && _intermediated}
                        onChange={() => {
                            handleChange(treeItem);
                        }}
                    />
                    <span onClick={(e) => {
                        e.stopPropagation();
                        handleExpendItem(treeItem);
                    }}
                    >
                        {title}
                    </span>
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
