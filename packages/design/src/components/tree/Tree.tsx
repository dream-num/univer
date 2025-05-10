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
import { DropdownSingle } from '@univerjs/icons';
import VirtualList from 'rc-virtual-list';
import { useEffect, useMemo, useState } from 'react';
import { clsx } from '../../helper/clsx';
import { Checkbox } from '../checkbox/Checkbox';
import { Tooltip } from '../tooltip/Tooltip';
import { createCacheWithFindNodePathFromTree, isIntermediated } from './util';
import './index.css';

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

type ITreeItemProps = ITreeNodeProps & IAttachTreeProps;

export interface ITreeProps {
    data?: ITreeItemProps[];

    defaultExpandAll?: boolean;

    selectionMode?: TreeSelectionMode;

    valueGroup?: string[];

    onChange?: (node: ITreeNodeProps) => void;

    onExpend?: (value: string) => void;

    height?: number;

    itemHeight?: number;

    attachRender?: (node: ITreeItemProps) => ReactNode;

    treeNodeClassName?: string;

    style?: CSSProperties;

    defaultCache?: Map<string, string[]>;
}

function flattenTree(items: ITreeItemProps[], expandedKeys: Set<string>, level = 1): ITreeItemProps[] {
    const flatItems: ITreeItemProps[] = [];

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
    const { data = [], defaultCache, style, defaultExpandAll = false, selectionMode = TreeSelectionMode.ALL, valueGroup = [], onChange, onExpend, height = 200, itemHeight = 32, attachRender } = props;
    const [update, forceUpdate] = useState({});
    const expandKeySet = useMemo(() => {
        return new Set<string>();
    }, []);

    const findNode = useMemo(() => createCacheWithFindNodePathFromTree(data, defaultCache), [data, defaultCache]);

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

    function handleExpendItem(treeItem: ITreeItemProps) {
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

    function renderTreeItem(treeItem: ITreeItemProps) {
        const { title, key, level = 0 } = treeItem;
        const treeNodeClassName = props.treeNodeClassName;
        const expended = expandKeySet.has(key);
        const selected = selectedNodeKeySet.has(key);
        const intermediated = isIntermediated(selectedNodeKeySet, treeItem);
        return (
            <div
                key={key}
                className={clsx('univer-tree-list-item', treeNodeClassName)}
                style={{ paddingLeft: `${level * 20}px` }}
            >
                <div
                    className={clsx('univer-tree-list-item-content', {
                        'univer-tree-list-item-content-selected': selected,
                    })}
                >
                    {treeItem.children && treeItem.children.length > 0 && (
                        <span
                            className={clsx('univer-tree-icon', {
                                'univer-tree-icon-expand': expended,
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
                        onChange={() => {
                            onChange?.(treeItem);
                        }}
                    />
                    <div
                        className="univer-tree-list-item-title"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleExpendItem(treeItem);
                        }}
                    >
                        <Tooltip className="univer-w-full univer-truncate" showIfEllipsis placement="top" title={title}>
                            <span>{title}</span>
                        </Tooltip>
                    </div>

                    {attachRender && attachRender(treeItem)}
                </div>
            </div>
        );
    }

    return (
        <section className="univer-tree">
            <div className="univer-tree-list" style={style}>
                <VirtualList
                    data={flatData}
                    itemKey={(item) => item.key}
                    height={height}
                    itemHeight={itemHeight}
                >
                    {(item: ITreeItemProps) => renderTreeItem(item)}
                </VirtualList>
            </div>
        </section>
    );
}
