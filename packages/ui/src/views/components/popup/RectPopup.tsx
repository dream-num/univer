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

import type { Nullable } from '@univerjs/core';
import type { RefObject } from 'react';
import type { Observable } from 'rxjs';
import { useEvent } from 'rc-util';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './index.module.less';

interface IAbsolutePosition {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

const RectPopupContext = createContext<RefObject<IAbsolutePosition | undefined>>({ current: undefined });

export interface IRectPopupProps {
    children?: React.ReactNode;

    /**
     * the anchor element bounding rect
     */
    anchorRect$: Observable<IAbsolutePosition>;
    excludeRects?: RefObject<Nullable<IAbsolutePosition[]>>;
    direction?: 'vertical' | 'horizontal' | 'left' | 'top' | 'right' | 'left' | 'bottom' | 'bottom-center' | 'top-center';

    hidden?: boolean;
    // #region closing behavior
    onClickOutside?: (e: MouseEvent) => void;
    excludeOutside?: HTMLElement[];
    onContextMenu?: () => void;

    onPointerEnter?: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerLeave?: (e: React.PointerEvent<HTMLElement>) => void;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    // #endregion
    portal?: boolean;
}

export interface IPopupLayoutInfo extends Pick<IRectPopupProps, 'direction'> {
    position: IAbsolutePosition;
    width: number;
    height: number;
    containerWidth: number;
    containerHeight: number;
}

/** The popup should have a minimum edge to the boundary. */
const PUSHING_MINIMUM_GAP = 8;

function calcPopupPosition(layout: IPopupLayoutInfo): { top: number; left: number } {
    const { position, width, height, containerHeight, containerWidth, direction = 'vertical' } = layout;

    // In y-axis
    if (direction === 'vertical' || direction.includes('top') || direction.includes('bottom')) {
        const { left: startX, top: startY, right: endX, bottom: endY } = position;
        const verticalStyle = (direction === 'vertical' && endY > containerHeight - height - PUSHING_MINIMUM_GAP) || direction.indexOf('top') > -1
            // top
            ? { top: Math.max(startY - height, PUSHING_MINIMUM_GAP) }
            // bottom
            : { top: Math.min(endY, containerHeight - height - PUSHING_MINIMUM_GAP) };

        let horizontalStyle;
        if (direction.includes('center')) {
            const rectWidth = endX - startX;
            const offsetX = (rectWidth - width) / 2;
            horizontalStyle = {
                left: startX + offsetX,
            };
        } else {
            // If the popup element exceed the visible area. We should "push" it back.
            horizontalStyle = (startX + width) > containerWidth
                ? { left: Math.max(endX - width, PUSHING_MINIMUM_GAP) } // on left
                : { left: Math.min(startX, containerWidth - width - PUSHING_MINIMUM_GAP) }; // on right
        }

        return { ...verticalStyle, ...horizontalStyle };
    }

    // In x-axis
    const { left: startX, top: startY, right: endX, bottom: endY } = position;
    // const horizontalStyle = ((endX + width) > containerWidth || direction === 'left')
    const horizontalStyle = direction === 'left'
        ? { left: Math.max(startX - width, PUSHING_MINIMUM_GAP) } // on left
        : { left: Math.min(endX, containerWidth - width - PUSHING_MINIMUM_GAP) }; // on right

    // If the popup element exceed the visible area. We should "push" it back.
    const verticalStyle = ((startY + height) > containerHeight)
        ? { top: Math.max(endY - height, PUSHING_MINIMUM_GAP) } // on top
        : { top: Math.min(startY, containerHeight - height - PUSHING_MINIMUM_GAP) }; // on bottom

    return { ...verticalStyle, ...horizontalStyle };
};

function RectPopup(props: IRectPopupProps) {
    const { portal, children, anchorRect$, direction = 'vertical', onClickOutside, excludeOutside, excludeRects, onPointerEnter, onPointerLeave, onClick, hidden, onContextMenu } = props;
    const nodeRef = useRef<HTMLElement>(null);
    const clickOtherFn = useEvent(onClickOutside ?? (() => { /* empty */ }));
    const contextMenuFn = useEvent(onContextMenu ?? (() => { /* empty */ }));
    const positionRef = useRef<Partial<IAbsolutePosition>>({
        top: -9999,
        left: -9999,
    });
    const excludeRectsRef = excludeRects;
    const anchorRectRef = useRef<IAbsolutePosition>();

    useEffect(() => {
        const anchorRectSub = anchorRect$.subscribe((anchorRect) => {
            anchorRectRef.current = anchorRect;
            requestAnimationFrame(() => {
                if (!nodeRef.current) return;

                const { clientWidth, clientHeight } = nodeRef.current;
                const innerWidth = window.innerWidth;
                const innerHeight = window.innerHeight;

                positionRef.current = calcPopupPosition(
                    {
                        position: anchorRect,
                        width: clientWidth,
                        height: clientHeight,
                        containerWidth: innerWidth,
                        containerHeight: innerHeight,
                        direction,
                    }
                );
                nodeRef.current.style.top = `${positionRef.current.top}px`;
                nodeRef.current.style.left = `${positionRef.current.left}px`;
            });
        });

        return () => anchorRectSub.unsubscribe();
    },

    [anchorRect$, direction]
    );

    useEffect(() => {
        const handleClickOther = (e: MouseEvent) => {
            if (
                excludeOutside &&
                (
                    (excludeOutside.indexOf(e.target as any) > -1) ||
                    excludeOutside.some((item) => item.contains(e.target as any)
                    )
                )
            ) {
                return;
            }
            const x = e.clientX;
            const y = e.clientY;
            const rects = [...excludeRectsRef?.current ?? []];
            if (anchorRectRef.current) {
                rects.push(anchorRectRef.current);
            }
            for (const rect of rects) {
                if (x <= rect.right && x >= rect.left && y <= rect.bottom && y >= rect.top) {
                    return;
                }
            }
            clickOtherFn(e);
        };

        window.addEventListener('pointerdown', handleClickOther);
        return () => {
            window.removeEventListener('pointerdown', handleClickOther);
        };
    }, [clickOtherFn, excludeOutside, excludeRectsRef]);

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            if (e.ctrlKey && e.button === 0) {
                return;
            }
            contextMenuFn();
        };
        window.addEventListener('contextmenu', handleContextMenu);
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [contextMenuFn]);

    const ele = (
        <section
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            ref={nodeRef}
            style={{ ...positionRef.current, ...hidden ? { display: 'none' } : null }}
            className={styles.popupFixed}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onClick}
        >
            <RectPopupContext.Provider value={anchorRectRef}>
                {children}
            </RectPopupContext.Provider>
        </section>
    );

    return !portal ? ele : createPortal(ele, document.getElementById('univer-popup-portal')!);
}

RectPopup.calcPopupPosition = calcPopupPosition;

RectPopup.useContext = () => useContext(RectPopupContext);

export { RectPopup };
