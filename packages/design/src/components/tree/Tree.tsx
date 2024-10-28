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
import VirtualList from 'rc-virtual-list';
import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox } from '../checkbox';

import { Tooltip } from '../tooltip';
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

export interface IAttachTreeProps {
    level?: number;
    count?: number;
}

type TreeItemProps = ITreeNodeProps & IAttachTreeProps;

export interface ITreeProps {
    data?: TreeItemProps[];

    defaultExpandAll?: boolean;

    selectionMode?: TreeSelectionMode;

    valueGroup?: string[];

    onChange?: (node: ITreeNodeProps, allSelectedNode: ITreeNodeProps[]) => void;

    onExpend?: (value: string) => void;

    height?: number;

    itemHeight?: number;

    attachRender?: (node: TreeItemProps) => React.ReactNode;

    treeNodeClassName?: string;

    style?: React.CSSProperties;
}

function flattenTree(items: TreeItemProps[], expandedKeys: Set<string>, level = 1): TreeItemProps[] {
    const flatItems: TreeItemProps[] = [];

    items.forEach((item) => {
        flatItems.push({ ...item, level });

        if (item.children && expandedKeys.has(item.key)) {
            flatItems.push(...flattenTree(item.children, expandedKeys, level + 1));
        }
    });

    return flatItems;
}

/**
 * Tree Component
 */
export function Tree(props: ITreeProps) {
    const { data = [], style, defaultExpandAll = false, selectionMode = TreeSelectionMode.ALL, valueGroup = [], onChange, onExpend, height = 200, itemHeight = 32, attachRender } = props;
    const [update, forceUpdate] = useState({});
    const expandKeySet = useMemo(() => {
        return new Set<string>();
    }, []);

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

    const flatData = useMemo(() => flattenTree(data, expandKeySet), [data, update, expandKeySet]);

    function handleChange(treeItem: TreeItemProps) {
        const path: string[] = findNode.findNodePathFromTreeWithCache(treeItem.key);
        const result = mergeTreeSelected(data, [...selectedNodeKeySet], path);
        onChange?.(treeItem, filterLeafNode(data, result));
    }

    function handleExpendItem(treeItem: TreeItemProps) {
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

    function renderTreeItem(treeItem: TreeItemProps) {
        const { title, key, level = 0 } = treeItem;
        const treeNodeClassName = props.treeNodeClassName;
        const expended = expandKeySet.has(key);
        const selected = selectedNodeKeySet.has(key);
        const intermediated = isIntermediated(selectedNodeKeySet, treeItem);
        return (
            <div
                key={key}
                className={clsx(styles.treeListItem, treeNodeClassName)}
                style={{ paddingLeft: `${level * 20}px` }}
            >
                <div
                    className={clsx(styles.treeListItemContent, {
                        [styles.treeListItemContentSelected]: selected,
                    })}
                >
                    {treeItem.children && treeItem.children.length > 0 && (
                        <span
                            className={clsx(styles.treeIcon, {
                                [styles.treeIconExpand]: expended,
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
                        checked={selected && !intermediated}
                        indeterminate={selected && intermediated}
                        onChange={() => handleChange(treeItem)}
                    />
                    <Tooltip showIfEllipsis placement="top" title={title}>
                        <span
                            className={styles.treeListItemTitle}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleExpendItem(treeItem);
                            }}
                        >
                            {title}
                        </span>
                    </Tooltip>

                    {attachRender && attachRender(treeItem)}
                </div>
            </div>
        );
    }

    return (
        <section className={styles.tree}>
            <div className={styles.treeList} style={style}>
                <VirtualList
                    data={flatData}
                    itemKey={(item) => item.key}
                    height={height}
                    itemHeight={itemHeight}
                >
                    {(item: TreeItemProps) => renderTreeItem(item)}
                </VirtualList>
            </div>

        </section>
    );
}
