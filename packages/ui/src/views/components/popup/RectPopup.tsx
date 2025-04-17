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

import type { Nullable } from '@univerjs/core';
import type { RefObject } from 'react';
import type { Observable } from 'rxjs';
import type { IUniverUIConfig } from '../../../controllers/config.schema';
import { IConfigService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useEvent } from '../../../components/hooks/event';
import { UI_PLUGIN_CONFIG_KEY } from '../../../controllers/config.schema';

interface IAbsolutePosition {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

const RectPopupContext = createContext<RefObject<IAbsolutePosition | undefined>>({ current: undefined });

export type RectPopupDirection = 'vertical' | 'horizontal' | 'top' | 'right' | 'left' | 'right-center' | 'right-bottom' | 'right-top' | 'left-center' | 'left-bottom' | 'left-top' | 'bottom' | 'bottom-center' | 'top-center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'vertical-left' | 'vertical-right' | 'horizontal-top' | 'horizontal-bottom';

export interface IRectPopupProps {
    children?: React.ReactNode;

    /**
     * the anchor element bounding rect
     */
    anchorRect$: Observable<IAbsolutePosition>;
    excludeRects?: RefObject<Nullable<IAbsolutePosition[]>>;
    direction?: RectPopupDirection;
    hidden?: boolean;
    // #region closing behavior
    onClickOutside?: (e: MouseEvent) => void;
    excludeOutside?: HTMLElement[];
    onContextMenu?: () => void;

    onPointerEnter?: (e: React.MouseEvent<HTMLElement>) => void;
    onPointerLeave?: (e: React.MouseEvent<HTMLElement>) => void;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    // #endregion
    portal?: boolean;

    mask?: boolean;
    zIndex?: number;
    maskZIndex?: number;
    onMaskClick?: () => void;
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
    if (direction === 'vertical' || direction.indexOf('top') === 0 || direction.indexOf('bottom') === 0) {
        const { left: startX, top: startY, right: endX, bottom: endY } = position;
        const verticalStyle = (direction === 'vertical' && endY > containerHeight - height - PUSHING_MINIMUM_GAP) || direction.indexOf('top') > -1
            // top
            ? { top: Math.max(startY - height, PUSHING_MINIMUM_GAP) }
            // bottom
            : { top: Math.min(endY, containerHeight - height - PUSHING_MINIMUM_GAP) };

        let horizontalStyle;

        const minLeft = PUSHING_MINIMUM_GAP;
        const maxLeft = containerWidth - width - PUSHING_MINIMUM_GAP;

        if (direction.includes('center')) {
            const rectWidth = endX - startX;
            const offsetX = (rectWidth - width) / 2;

            horizontalStyle = (Math.max(startX + offsetX, PUSHING_MINIMUM_GAP) + width) > containerWidth
                ? { left: Math.max(Math.min(maxLeft, endX - width - offsetX), minLeft) }
                : { left: Math.max(minLeft, Math.min(startX + offsetX, maxLeft)) };
        } else if (direction.includes('left')) {
            horizontalStyle = { left: Math.max(endX - width, minLeft) };
        } else if (direction.includes('right')) {
            horizontalStyle = { left: Math.min(startX, maxLeft) };
        } else {
            // If the popup element exceed the visible area. We should "push" it back.
            horizontalStyle = (startX + width) > containerWidth
                ? { left: Math.max(endX - width, minLeft) } // on left
                : { left: Math.min(startX, maxLeft) }; // on right
        }

        return { ...verticalStyle, ...horizontalStyle };
    }

    // In x-axis
    const { left: startX, top: startY, right: endX, bottom: endY } = position;
    // const horizontalStyle = ((endX + width) > containerWidth || direction === 'left')
    const horizontalStyle = direction.includes('left')
        ? { left: Math.max(startX - width, PUSHING_MINIMUM_GAP) } // on left
        : { left: Math.min(endX, containerWidth - width - PUSHING_MINIMUM_GAP) }; // on right

    let verticalStyle;
    const minTop = PUSHING_MINIMUM_GAP;
    const maxTop = containerHeight - height - PUSHING_MINIMUM_GAP;

    if (direction.includes('center')) {
        const rectHeight = endY - startY;
        const offsetY = (rectHeight - height) / 2;

        verticalStyle = (Math.max(startY + offsetY, PUSHING_MINIMUM_GAP) + height) > containerHeight
            ? { top: Math.max(Math.min(maxTop, endY - height - offsetY), minTop) }
            : { top: Math.max(minTop, Math.min(startY + offsetY, maxTop)) };
    } else if (direction.includes('top')) {
        verticalStyle = {
            top: Math.min(startY, containerHeight - height - PUSHING_MINIMUM_GAP),
        };
    } else if (direction.includes('bottom')) {
        verticalStyle = {
            top: Math.max(endY - height, PUSHING_MINIMUM_GAP),
        };
    } else {
        // If the popup element exceed the visible area. We should "push" it back.
        verticalStyle = ((startY + height) > containerHeight)
            ? { top: Math.max(endY - height, PUSHING_MINIMUM_GAP) } // on top
            : { top: Math.min(startY, containerHeight - height - PUSHING_MINIMUM_GAP) }; // on bottom
    }

    return { ...verticalStyle, ...horizontalStyle };
};

function RectPopup(props: IRectPopupProps) {
    const {
        mask,
        portal,
        children,
        anchorRect$,
        direction = 'vertical',
        onClickOutside,
        excludeOutside,
        excludeRects,
        onPointerEnter,
        onPointerLeave,
        onClick,
        hidden,
        onContextMenu,
        zIndex = 1020,
        maskZIndex = 100,
        onMaskClick,
    } = props;
    const nodeRef = useRef<HTMLElement>(null);
    const clickOtherFn = useEvent(onClickOutside ?? (() => { /* empty */ }));
    const contextMenuFn = useEvent(onContextMenu ?? (() => { /* empty */ }));
    const positionRef = useRef<Partial<IAbsolutePosition>>({
        top: -9999,
        left: -9999,
    });
    const excludeRectsRef = excludeRects;
    const configService = useDependency(IConfigService);
    const anchorRectRef = useRef<IAbsolutePosition | undefined>(undefined);
    const uiConfig = configService.getConfig(UI_PLUGIN_CONFIG_KEY) as IUniverUIConfig;
    const popupRootId = uiConfig?.popupRootId ?? 'univer-popup-portal';

    function updatePosition(position: IAbsolutePosition) {
        requestAnimationFrame(() => {
            if (!nodeRef.current) return;

            const { clientWidth, clientHeight } = nodeRef.current;
            const innerWidth = window.innerWidth;
            const innerHeight = window.innerHeight;

            positionRef.current = calcPopupPosition(
                {
                    position,
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
    }

    useEffect(() => {
        let observer: ResizeObserver | null;
        if (nodeRef.current) {
            observer = new ResizeObserver(() => {
                if (!anchorRectRef.current) return;
                updatePosition(anchorRectRef.current);
            });

            observer.observe(nodeRef.current);
        }

        return () => {
            observer?.disconnect();
        };
    }, [nodeRef.current]);

    useEffect(() => {
        const anchorRectSub = anchorRect$.subscribe((anchorRect) => {
            anchorRectRef.current = anchorRect;
            updatePosition(anchorRect);
        });

        return () => anchorRectSub.unsubscribe();
    }, [anchorRect$, direction]);

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
        <>
            {mask && (
                <div
                    className="univer-fixed univer-bottom-0 univer-left-0 univer-right-0 univer-top-0 univer-z-[100]"
                    style={{ zIndex: maskZIndex }}
                    onClick={onMaskClick}
                />
            )}
            <section
                ref={nodeRef}
                className={`
                  univer-pointer-events-auto univer-fixed univer-left-[-9999px] univer-top-[-9999px] univer-z-[1020]
                `}
                style={{ ...positionRef.current, ...hidden ? { display: 'none' } : null, zIndex }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onClick}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
            >
                <RectPopupContext.Provider value={anchorRectRef}>
                    {children}
                </RectPopupContext.Provider>
            </section>
        </>
    );

    return !portal ? ele : document.getElementById(popupRootId) ? createPortal(ele, document.getElementById(popupRootId)!) : null;
}

RectPopup.calcPopupPosition = calcPopupPosition;

RectPopup.useContext = () => useContext(RectPopupContext);

export { RectPopup };
