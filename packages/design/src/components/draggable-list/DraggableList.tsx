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

import type { CSSProperties, HTMLAttributes, PointerEvent, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from '../../helper/clsx';

interface IDragPosition {
    y: number;
}

interface IDraggableListDragCallbacks {
    onDragStart?: (layout: unknown, from: IDragPosition) => void;
    onDragStop?: (layout: unknown, from: IDragPosition, to: IDragPosition) => void;
}

export interface IDraggableListProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'onDragStart'>, IDraggableListDragCallbacks {
    list: T[];
    onListChange: (list: T[]) => void;
    idKey: keyof T;
    itemRender: (item: T, index: number) => ReactNode;
    draggableHandle?: string;
    rowHeight?: number;
    margin?: [number, number];
}

function moveItemByIndex<T>(list: T[], fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) {
        return list;
    }
    const next = [...list];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
}

export function DraggableList<T = any>(props: IDraggableListProps<T>) {
    const {
        list,
        onListChange,
        idKey,
        itemRender,
        className,
        style,
        draggableHandle,
        rowHeight,
        margin = [0, 0],
        onDragStart,
        onDragStop,
        ...restProps
    } = props;

    const [displayList, setDisplayList] = useState(list);
    const displayListRef = useRef(list);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [ghostMarkup, setGhostMarkup] = useState<string | null>(null);
    const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number } | null>(null);
    const [canUsePortal, setCanUsePortal] = useState(false);
    const pointerIdRef = useRef<number | null>(null);
    const dragPointerOffsetRef = useRef({ x: 0, y: 0 });
    const dragItemSizeRef = useRef({ width: 0, height: 0 });

    const pressedHandleIdRef = useRef<string | null>(null);
    const dragSourceIdRef = useRef<string | null>(null);
    const dragStartIndexRef = useRef(-1);

    useEffect(() => {
        if (!draggingId) {
            setDisplayList(list);
            displayListRef.current = list;
        }
    }, [draggingId, list]);

    useEffect(() => {
        setCanUsePortal(typeof document !== 'undefined');
    }, []);

    useEffect(() => {
        if (!draggingId) {
            return;
        }

        const handlePointerMove = (evt: PointerEvent | globalThis.PointerEvent) => {
            const sourceId = dragSourceIdRef.current;
            if (!sourceId || pointerIdRef.current !== evt.pointerId) {
                return;
            }
            setGhostPosition({
                x: evt.clientX - dragPointerOffsetRef.current.x,
                y: evt.clientY - dragPointerOffsetRef.current.y,
            });

            const element = document.elementFromPoint(evt.clientX, evt.clientY);
            const itemElement = element?.closest('[data-draggable-list-item-id]') as HTMLElement | null;
            const targetId = itemElement?.dataset.draggableListItemId;
            if (!targetId || targetId === sourceId) {
                return;
            }
            setDragOverId(targetId);

            setDisplayList((prev) => {
                const fromIndex = prev.findIndex((it) => getItemId(it) === sourceId);
                const toIndex = prev.findIndex((it) => getItemId(it) === targetId);
                if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
                    return prev;
                }
                const next = moveItemByIndex(prev, fromIndex, toIndex);
                displayListRef.current = next;
                return next;
            });
        };

        const handlePointerUp = (evt: globalThis.PointerEvent) => {
            if (pointerIdRef.current !== evt.pointerId) {
                return;
            }
            const sourceId = dragSourceIdRef.current;
            const startIndex = dragStartIndexRef.current;
            const currentList = displayListRef.current;
            if (sourceId) {
                const finalIndex = currentList.findIndex((it) => getItemId(it) === sourceId);
                onDragStop?.(undefined, { y: startIndex }, { y: finalIndex });
                if (startIndex >= 0) {
                    onListChange([...currentList]);
                }
            }

            pointerIdRef.current = null;
            pressedHandleIdRef.current = null;
            dragSourceIdRef.current = null;
            dragStartIndexRef.current = -1;
            setDragOverId(null);
            setGhostMarkup(null);
            setGhostPosition(null);
            setDraggingId(null);
        };

        window.addEventListener('pointermove', handlePointerMove as any);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove as any);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
        };
    }, [draggingId, onDragStop, onListChange]);

    const gapStyle: CSSProperties = useMemo(() => {
        const [horizontal, vertical] = margin;
        return {
            rowGap: `${vertical}px`,
            paddingLeft: horizontal ? `${horizontal}px` : undefined,
            paddingRight: horizontal ? `${horizontal}px` : undefined,
            ...style,
        };
    }, [margin, style]);

    const getItemId = (item: T) => String(item[idKey]);
    const draggingItem = draggingId ? displayList.find((item) => getItemId(item) === draggingId) : null;

    return (
        <>
            <div
                {...restProps}
                className={clsx('univer-flex univer-flex-col', draggingId && 'univer-cursor-grabbing univer-select-none', className)}
                style={gapStyle}
            >
                {displayList.map((item, index) => {
                    const itemId = getItemId(item);
                    const isDraggingItem = draggingId === itemId;
                    const isDragOverItem = dragOverId === itemId && !isDraggingItem;

                    return (
                        <div
                            key={itemId}
                            data-draggable-list-item-id={itemId}
                            className={clsx(
                                'univer-relative univer-transition-all univer-duration-150',
                                isDraggingItem && 'univer-opacity-0',
                                isDragOverItem && `
                                  univer-bg-primary-50/60
                                  dark:!univer-bg-primary-900/20
                                  univer-rounded univer-border univer-border-primary-200
                                  dark:!univer-border-primary-700
                                `
                            )}
                            onPointerDownCapture={(e: PointerEvent<HTMLDivElement>) => {
                                if (pointerIdRef.current !== null) {
                                    return;
                                }
                                if (!draggableHandle) {
                                    pressedHandleIdRef.current = itemId;
                                } else {
                                    const target = e.target as HTMLElement;
                                    const isMatched = !!target.closest(draggableHandle);
                                    pressedHandleIdRef.current = isMatched ? itemId : null;
                                }
                                if (pressedHandleIdRef.current !== itemId) {
                                    return;
                                }

                                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                                dragPointerOffsetRef.current = {
                                    x: e.clientX - rect.left,
                                    y: e.clientY - rect.top,
                                };
                                dragItemSizeRef.current = {
                                    width: rect.width,
                                    height: rect.height,
                                };
                                setGhostPosition({ x: rect.left, y: rect.top });
                                setGhostMarkup((e.currentTarget as HTMLDivElement).innerHTML);

                                pointerIdRef.current = e.pointerId;
                                dragSourceIdRef.current = itemId;
                                dragStartIndexRef.current = index;
                                setDraggingId(itemId);
                                displayListRef.current = displayList;
                                onDragStart?.(undefined, { y: index });
                                e.preventDefault();
                                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                            }}
                            style={{
                                ...(rowHeight ? { minHeight: `${rowHeight}px` } : undefined),
                                cursor: draggingId ? 'grabbing' : undefined,
                            }}
                        >
                            {isDraggingItem && (
                                <div
                                    className="
                                      univer-bg-primary-50/50 univer-absolute univer-inset-0 univer-rounded
                                      univer-border univer-border-dashed univer-border-primary-300
                                    "
                                />
                            )}
                            {itemRender(item, index)}
                        </div>
                    );
                })}
            </div>
            {canUsePortal && draggingItem && ghostPosition && createPortal((
                <div
                    className={clsx(`
                      univer-pointer-events-none univer-fixed univer-rounded-md univer-border univer-border-gray-200
                      univer-bg-white univer-shadow-lg
                      dark:!univer-border-gray-700 dark:!univer-bg-gray-800
                    `)}
                    style={{
                        zIndex: 2147483647,
                        left: `${ghostPosition.x}px`,
                        top: `${ghostPosition.y}px`,
                        width: `${dragItemSizeRef.current.width}px`,
                        height: `${dragItemSizeRef.current.height}px`,
                        opacity: 0.95,
                    }}
                >
                    {ghostMarkup
                        ? <div dangerouslySetInnerHTML={{ __html: ghostMarkup }} />
                        : itemRender(draggingItem, displayList.findIndex((item) => getItemId(item) === getItemId(draggingItem)))}
                </div>
            ), document.body
            )}
        </>
    );
}
