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

import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { DownIcon } from '@univerjs/icons';
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { focusClassName, resetButtonClassName, scrollbarClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { Checkbox } from '../checkbox/Checkbox';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { Tooltip } from '../tooltip/Tooltip';
import { VirtualList } from '../virtual-list';
import { createCacheWithFindNodePathFromTree, isIntermediated } from './util';

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

function flattenTree(items: ITreeItemProps[], isExpanded: (key: string) => boolean, level = 1): ITreeItemProps[] {
    const flatItems: ITreeItemProps[] = [];

    items.forEach((item) => {
        flatItems.push({ ...item, level });

        if (item.children && isExpanded(item.key)) {
            flatItems.push(...flattenTree(item.children, isExpanded, level + 1));
        }
    });

    return flatItems;
}

const EMPTY_TREE_DATA: ITreeItemProps[] = [];
const EMPTY_VALUE_GROUP: string[] = [];

/**
 * Tree Component
 */
export function Tree(props: ITreeProps) {
    const {
        data = EMPTY_TREE_DATA,
        defaultCache,
        style,
        defaultExpandAll = false,
        selectionMode = TreeSelectionMode.ALL,
        valueGroup = EMPTY_VALUE_GROUP,
        onChange,
        onExpend,
        height = 200,
        itemHeight = 32,
        attachRender,
    } = props;
    const { direction } = useContext(ConfigContext);
    const treeRef = useRef<HTMLDivElement>(null);
    const [toggledKeySet, setToggledKeySet] = useState<Set<string>>(() => new Set());
    const [focusedKey, setFocusedKey] = useState<string | null>(null);

    const isExpanded = useCallback(
        (key: string) => (defaultExpandAll ? !toggledKeySet.has(key) : toggledKeySet.has(key)),
        [defaultExpandAll, toggledKeySet]
    );

    const findNode = useMemo(() => createCacheWithFindNodePathFromTree(data, defaultCache), [data, defaultCache]);

    const selectedNodeKeySet = useMemo(() => {
        const set = new Set<string>();
        valueGroup.forEach((key) => {
            const path = findNode.findNodePathFromTreeWithCache(key);
            path.forEach((k) => set.add(k));
        });
        return set;
    }, [valueGroup, findNode]);

    const flatData = useMemo(() => flattenTree(data, isExpanded), [data, isExpanded]);

    const activeFocusedKey = useMemo(() => {
        if (focusedKey && flatData.some((item) => item.key === focusedKey)) {
            return focusedKey;
        }
        return flatData[0]?.key ?? null;
    }, [flatData, focusedKey]);

    function focusTreeItemByKey(key: string) {
        setFocusedKey(key);
        const items = Array.from(treeRef.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? []);
        const target = items.find((el) => el.dataset.treeKey === key);
        target?.focus();
    }

    function handleExpendItem(treeItem: ITreeItemProps) {
        if (treeItem.children?.length) {
            setToggledKeySet((prev) => {
                const next = new Set(prev);
                if (next.has(treeItem.key)) {
                    next.delete(treeItem.key);
                } else {
                    next.add(treeItem.key);
                }
                return next;
            });
        }
        if (selectionMode === TreeSelectionMode.ONLY_LEAF_NODE) {
            if (treeItem.children) {
                return;
            }
        }

        onExpend?.(treeItem.key);
    }

    function handleItemKeyDown(e: KeyboardEvent<HTMLDivElement>, treeItem: ITreeItemProps, index: number) {
        const isRtl = direction === 'rtl';
        const hasChildren = Boolean(treeItem.children && treeItem.children.length > 0);
        const expanded = isExpanded(treeItem.key);
        const expandKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
        const collapseKey = isRtl ? 'ArrowRight' : 'ArrowLeft';

        if (e.key === 'ArrowDown') {
            const nextItem = flatData[index + 1];
            if (nextItem) {
                e.preventDefault();
                focusTreeItemByKey(nextItem.key);
            }
        } else if (e.key === 'ArrowUp') {
            const prevItem = flatData[index - 1];
            if (prevItem) {
                e.preventDefault();
                focusTreeItemByKey(prevItem.key);
            }
        } else if (e.key === expandKey && hasChildren) {
            e.preventDefault();
            if (!expanded) {
                handleExpendItem(treeItem);
            } else if (flatData[index + 1]) {
                focusTreeItemByKey(flatData[index + 1].key);
            }
        } else if (e.key === collapseKey && hasChildren && expanded) {
            e.preventDefault();
            handleExpendItem(treeItem);
        } else if (e.target === e.currentTarget && e.key === 'Enter') {
            e.preventDefault();
            handleExpendItem(treeItem);
        } else if (e.target === e.currentTarget && e.key === ' ') {
            e.preventDefault();
            onChange?.(treeItem);
        }
    }

    function renderTreeItem(treeItem: ITreeItemProps, index: number) {
        const { title, key, level = 1 } = treeItem;
        const treeNodeClassName = props.treeNodeClassName;
        const hasChildren = Boolean(treeItem.children && treeItem.children.length > 0);
        const expended = isExpanded(key);
        const selected = selectedNodeKeySet.has(key);
        const intermediated = isIntermediated(selectedNodeKeySet, treeItem);
        const indent = Math.max(0, level - 1) * 20;

        return (
            <div
                key={key}
                role="treeitem"
                aria-level={level}
                aria-expanded={hasChildren ? expended : undefined}
                aria-selected={selected}
                data-tree-key={key}
                tabIndex={key === activeFocusedKey ? 0 : -1}
                className={clsx(`
                  univer-relative univer-box-border univer-flex univer-items-center univer-rounded univer-pe-1
                  univer-text-sm univer-transition-colors univer-duration-200
                  hover:univer-bg-gray-100
                  motion-reduce:univer-transition-none
                  dark:hover:!univer-bg-gray-600
                `, focusClassName, treeNodeClassName)}
                style={{ paddingInlineStart: `${indent}px` }}
                onFocus={() => setFocusedKey(key)}
                onKeyDown={(e) => handleItemKeyDown(e, treeItem, index)}
            >
                <div
                    className="
                      univer-relative univer-flex univer-h-full univer-w-full univer-items-center univer-gap-1
                      univer-py-0.5
                    "
                >
                    {hasChildren
                        ? (
                            <button
                                type="button"
                                tabIndex={-1}
                                aria-label={title}
                                aria-expanded={expended}
                                className={clsx(
                                    resetButtonClassName,
                                    focusClassName,
                                    `
                                      univer-size-5 univer-shrink-0 univer-rounded univer-text-gray-500
                                      univer-transition-colors univer-duration-200
                                      hover:univer-bg-gray-200 hover:univer-text-gray-700
                                      motion-reduce:univer-transition-none
                                      dark:!univer-text-gray-300
                                      dark:hover:!univer-bg-gray-500 dark:hover:!univer-text-gray-0
                                    `
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleExpendItem(treeItem);
                                }}
                            >
                                <DownIcon
                                    aria-hidden="true"
                                    className={clsx(
                                        `
                                          univer-size-2.5 univer-transition-transform univer-duration-200
                                          motion-reduce:univer-transition-none
                                        `,
                                        {
                                            '-univer-rotate-90 rtl:univer-rotate-90': !expended,
                                        }
                                    )}
                                />
                            </button>
                        )
                        : (
                            <span aria-hidden="true" className="univer-inline-block univer-size-5 univer-shrink-0" />
                        )}
                    <Checkbox
                        checked={selected && !intermediated}
                        indeterminate={selected && intermediated}
                        onChange={() => {
                            onChange?.(treeItem);
                        }}
                    />
                    <div
                        className="
                          univer-flex univer-h-full univer-min-w-0 univer-shrink univer-cursor-pointer
                          univer-items-center univer-overflow-hidden univer-text-ellipsis univer-whitespace-nowrap
                        "
                        onClick={(e) => {
                            e.stopPropagation();
                            handleExpendItem(treeItem);
                        }}
                    >
                        <Tooltip className="univer-block" showIfEllipsis placement="top" title={title}>
                            <span className="univer-block">
                                {title}
                            </span>
                        </Tooltip>
                    </div>

                    {attachRender && attachRender(treeItem)}
                </div>
            </div>
        );
    }

    return (
        <section
            data-u-comp="tree"
            dir={direction}
            className="
              univer-relative univer-select-none univer-text-gray-900
              dark:!univer-text-gray-0
            "
        >
            <div ref={treeRef} role="tree" className="univer-m-0 univer-h-full univer-list-none univer-p-0" style={style}>
                <VirtualList
                    data={flatData}
                    itemKey={(item) => item.key}
                    height={height}
                    itemHeight={itemHeight}
                    className={scrollbarClassName}
                >
                    {(item: ITreeItemProps, index: number) => renderTreeItem(item, index)}
                </VirtualList>
            </div>
        </section>
    );
}
