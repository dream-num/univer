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

import type { HTMLAttributes, KeyboardEvent, PointerEvent } from 'react';
import { useEffect, useRef } from 'react';
import { clsx } from '../../helper/clsx';

export interface IResizeHandleProps extends Pick<HTMLAttributes<HTMLDivElement>, 'className' | 'style' | 'title' | 'onDoubleClick' | 'onMouseEnter' | 'onMouseLeave'> {
    controls?: string;
    currentWidth: number;
    getCurrentWidth?: () => number;
    label: string;
    minimumWidth: number;
    maximumWidth: number;
    side: 'left' | 'right';
    step?: number;
    onResize: (width: number) => void;
    onResizeStart?: () => void;
    onResizeEnd: (width: number) => void;
}

interface IResizeDragState {
    currentWidth: number;
    pointerId: number;
    startWidth: number;
    startX: number;
}

export function ResizeHandle({
    controls,
    minimumWidth,
    side,
    step = 16,
    getCurrentWidth,
    onResizeStart,
    className,
    currentWidth,
    label,
    maximumWidth,
    onResize,
    onResizeEnd,
    ...attributes
}: IResizeHandleProps) {
    const clampWidth = (width: number) => Math.max(minimumWidth, Math.min(maximumWidth, Math.round(Number.isFinite(width) ? width : minimumWidth)));
    const readWidth = () => getCurrentWidth?.() ?? currentWidth;
    const dragRef = useRef<IResizeDragState | null>(null);
    const restoreBodyStylesRef = useRef<(() => void) | null>(null);

    useEffect(() => () => {
        restoreBodyStylesRef.current?.();
    }, []);

    const updateResize = (event: PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) {
            return;
        }
        const nextWidth = clampWidth(drag.startWidth + (event.clientX - drag.startX) * (side === 'left' ? -1 : 1));
        if (nextWidth === drag.currentWidth) {
            return;
        }
        drag.currentWidth = nextWidth;
        event.currentTarget.setAttribute('aria-valuenow', String(nextWidth));
        onResize(nextWidth);
    };

    const finishResize = (event: PointerEvent<HTMLDivElement>, commit: boolean) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) {
            return;
        }

        dragRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        restoreBodyStylesRef.current?.();
        restoreBodyStylesRef.current = null;

        if (commit) {
            onResizeEnd(drag.currentWidth);
        } else {
            event.currentTarget.setAttribute('aria-valuenow', String(drag.startWidth));
            onResize(drag.startWidth);
            onResizeEnd(drag.startWidth);
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        let nextWidth: number | null = null;
        const increment = (event.shiftKey ? step * 4 : step) * (side === 'left' ? -1 : 1);
        const width = readWidth();
        if (event.key === 'ArrowLeft') {
            nextWidth = width - increment;
        } else if (event.key === 'ArrowRight') {
            nextWidth = width + increment;
        } else if (event.key === 'Home') {
            nextWidth = minimumWidth;
        } else if (event.key === 'End') {
            nextWidth = maximumWidth;
        }

        if (nextWidth != null) {
            event.preventDefault();
            const width = clampWidth(nextWidth);
            event.currentTarget.setAttribute('aria-valuenow', String(width));
            onResize(width);
            onResizeEnd(width);
        }
    };

    return (
        <div
            {...attributes}
            role="separator"
            aria-label={label}
            aria-controls={controls}
            aria-orientation="vertical"
            aria-valuemin={minimumWidth}
            aria-valuemax={maximumWidth}
            aria-valuenow={currentWidth}
            tabIndex={0}
            className={clsx(`
              univer-group univer-absolute univer-inset-y-0 univer-z-20 univer-w-1 univer-cursor-col-resize
              univer-touch-none univer-outline-none
            `, side === 'left'
                ? 'univer-left-0'
                : 'univer-right-0', className)}
            onKeyDown={handleKeyDown}
            onPointerDown={(event) => {
                if (!event.isPrimary || event.button !== 0 || dragRef.current) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.focus({ preventScroll: true });
                event.currentTarget.setPointerCapture(event.pointerId);
                const width = readWidth();
                dragRef.current = {
                    currentWidth: width,
                    pointerId: event.pointerId,
                    startX: event.clientX,
                    startWidth: width,
                };
                onResizeStart?.();
                const body = event.currentTarget.ownerDocument.body;
                const previousCursor = body.style.cursor;
                const previousUserSelect = body.style.userSelect;
                body.style.cursor = 'col-resize';
                body.style.userSelect = 'none';
                restoreBodyStylesRef.current = () => {
                    body.style.cursor = previousCursor;
                    body.style.userSelect = previousUserSelect;
                };
            }}
            onPointerMove={(event) => {
                const drag = dragRef.current;
                if (!drag || drag.pointerId !== event.pointerId) {
                    return;
                }
                if ((event.buttons & 1) === 0) {
                    updateResize(event);
                    finishResize(event, true);
                    return;
                }
                updateResize(event);
            }}
            onPointerUp={(event) => {
                updateResize(event);
                finishResize(event, true);
            }}
            onPointerCancel={(event) => finishResize(event, false)}
            onLostPointerCapture={(event) => finishResize(event, true)}
        >
            <span
                className={clsx(`
                  univer-absolute univer-inset-y-0 univer-w-px
                  group-hover:univer-bg-primary-500
                  group-focus:univer-bg-primary-500
                `, side === 'left'
                    ? 'univer-left-0'
                    : 'univer-right-0')}
            />
        </div>
    );
}
