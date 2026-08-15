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

import type { MouseEventHandler, ReactNode, RefObject } from 'react';
import type { Observable } from 'rxjs';
import { IConfigService, LocaleService } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { defaultPluginConfig, UI_PLUGIN_CONFIG_KEY } from '../../../config/config';
import { useDependency, useObservable } from '../../../utils/di';
import { useEvent } from '../../hooks/event';

interface IAbsolutePosition {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

const RectPopupContext = createContext<RefObject<IAbsolutePosition | undefined>>({ current: undefined });
const RectPopupDirectionContext = createContext<RectPopupDirection>('vertical');

export type RectPopupDirection =
    | 'left'
    | 'left-center'
    | 'left-bottom'
    | 'left-top'
    | 'right'
    | 'right-center'
    | 'right-bottom'
    | 'right-top'
    | 'top'
    | 'top-center'
    | 'top-left'
    | 'top-right'
    | 'bottom'
    | 'bottom-center'
    | 'bottom-left'
    | 'bottom-right'
    | 'vertical'
    | 'vertical-left'
    | 'vertical-right'
    | 'vertical-center'
    | 'horizontal'
    | 'horizontal-top'
    | 'horizontal-bottom'
    | 'horizontal-center';

export interface IRectPopupProps {
    children?: ReactNode;

    /**
     * the anchor element bounding rect
     */
    anchorRect$: Observable<IAbsolutePosition>;
    excludeRects?: RefObject<IAbsolutePosition[] | null | undefined | void>;
    direction?: RectPopupDirection;
    hidden?: boolean;
    // #region closing behavior
    onClickOutside?: (e: MouseEvent) => void;
    excludeOutside?: HTMLElement[];
    onContextMenu?: () => void;

    onPointerEnter?: MouseEventHandler<HTMLElement>;
    onPointerLeave?: MouseEventHandler<HTMLElement>;
    onClick?: MouseEventHandler<HTMLElement>;
    // #endregion
    portal?: boolean;

    mask?: boolean;
    zIndex?: number;
    maskZIndex?: number;
    onMaskClick?: () => void;
    noPushMinimumGap?: boolean;

    autoRelayout?: boolean;
    boundaryElement?: Element;
    boundaryInsets?: { left?: number; top?: number };
}

export interface IPopupLayoutInfo extends Pick<IRectPopupProps, 'boundaryInsets' | 'direction'> {
    position: IAbsolutePosition;
    width: number;
    height: number;
    containerLeft?: number;
    containerTop?: number;
    containerWidth: number;
    containerHeight: number;
    noPushMinimumGap?: boolean;
}

/** The popup should have a minimum edge to the boundary. */
const PUSHING_MINIMUM_GAP = 8;

function resolvePopupDirection(layout: IPopupLayoutInfo): RectPopupDirection {
    const direction = layout.direction ?? 'vertical';
    const containerTop = (layout.containerTop ?? 0) + (layout.boundaryInsets?.top ?? 0);
    const availableTop = layout.position.top - containerTop;
    const availableBottom = (layout.containerTop ?? 0) + layout.containerHeight - layout.position.bottom;
    const placeAbove = availableTop >= availableBottom;

    switch (direction) {
        case 'vertical-center':
            return placeAbove ? 'top-center' : 'bottom-center';
        case 'vertical-left':
            return placeAbove ? 'top-left' : 'bottom-left';
        case 'vertical-right':
            return placeAbove ? 'top-right' : 'bottom-right';
        default:
            return direction;
    }
}

function calcPopupPosition(layout: IPopupLayoutInfo): { top: number; left: number } {
    const { position, width, height, containerHeight, containerWidth, noPushMinimumGap = false } = layout;
    const direction = resolvePopupDirection(layout);

    const boundaryLeft = layout.containerLeft ?? 0;
    const boundaryTop = layout.containerTop ?? 0;
    const containerLeft = boundaryLeft + (layout.boundaryInsets?.left ?? 0);
    const containerTop = boundaryTop + (layout.boundaryInsets?.top ?? 0);
    const containerRight = boundaryLeft + containerWidth;
    const containerBottom = boundaryTop + containerHeight;
    const minTop = noPushMinimumGap ? -Infinity : containerTop + PUSHING_MINIMUM_GAP;
    const maxTop = noPushMinimumGap ? Infinity : containerBottom - height - PUSHING_MINIMUM_GAP;
    const minLeft = noPushMinimumGap ? -Infinity : containerLeft + PUSHING_MINIMUM_GAP;
    const maxLeft = noPushMinimumGap ? Infinity : containerRight - width - PUSHING_MINIMUM_GAP;

    // In y-axis
    if (direction === 'vertical' || direction.indexOf('top') === 0 || direction.indexOf('bottom') === 0) {
        const { left: startX, top: startY, right: endX, bottom: endY } = position;
        const verticalStyle = (direction === 'vertical' && endY > maxTop) || direction.indexOf('top') > -1
            // top
            ? { top: Math.max(Math.min(startY - height, maxTop), minTop) }
            // bottom
            : { top: Math.max(Math.min(endY, maxTop), minTop) };

        let horizontalStyle;

        if (direction.includes('center')) {
            const rectWidth = endX - startX;
            const offsetX = (rectWidth - width) / 2;

            horizontalStyle = (Math.max(startX + offsetX, minLeft) + width) > containerRight
                ? { left: Math.max(Math.min(maxLeft, endX - width - offsetX), minLeft) }
                : { left: Math.max(minLeft, Math.min(startX + offsetX, maxLeft)) };
        } else if (direction.includes('right')) {
            horizontalStyle = { left: Math.max(Math.min(endX - width, maxLeft), minLeft) };
        } else if (direction.includes('left')) {
            horizontalStyle = { left: Math.max(Math.min(startX, maxLeft), minLeft) };
        } else {
            // If the popup element exceed the visible area. We should "push" it back.
            horizontalStyle = (startX + width) > containerRight
                ? Math.max(endX - width, minLeft) < PUSHING_MINIMUM_GAP
                    ? { left: Math.max(Math.min(startX, maxLeft), minLeft) }
                    : { left: Math.max(Math.min(endX - width, maxLeft), minLeft) } // on left
                : { left: Math.max(Math.min(startX, maxLeft), minLeft) }; // on right
        }

        return { ...verticalStyle, ...horizontalStyle };
    }

    // In x-axis
    const { left: startX, top: startY, right: endX, bottom: endY } = position;
    // const horizontalStyle = ((endX + width) > containerWidth || direction === 'left')
    const horizontalStyle = direction.includes('left')
        ? { left: Math.max(Math.min(startX - width, maxLeft), minLeft) } // on left
        : { left: Math.max(Math.min(endX, maxLeft), minLeft) }; // on right

    let verticalStyle;

    if (direction.includes('center')) {
        const rectHeight = endY - startY;
        const offsetY = (rectHeight - height) / 2;

        verticalStyle = (Math.max(startY + offsetY, minTop) + height) > containerBottom
            ? { top: Math.max(Math.min(maxTop, endY - height - offsetY), minTop) }
            : { top: Math.max(minTop, Math.min(startY + offsetY, maxTop)) };
    } else if (direction.includes('top')) {
        verticalStyle = {
            top: Math.max(Math.min(startY, maxTop), minTop),
        };
    } else if (direction.includes('bottom')) {
        verticalStyle = {
            top: Math.max(Math.min(endY - height, maxTop), minTop),
        };
    } else {
        // If the popup element exceed the visible area. We should "push" it back.
        verticalStyle = ((startY + height) > containerBottom)
            ? Math.max(endY - height, minTop) < PUSHING_MINIMUM_GAP
                ? { top: Math.max(Math.min(startY, maxTop), minTop) }
                : { top: Math.max(Math.min(endY - height, maxTop), minTop) } // on top
            : { top: Math.max(Math.min(startY, maxTop), minTop) }; // on bottom
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
        noPushMinimumGap,
        autoRelayout = true,
        boundaryElement,
        boundaryInsets,
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
    const [resolvedDirection, setResolvedDirection] = useState<RectPopupDirection>(direction);
    const uiConfig = configService.getConfig<typeof defaultPluginConfig>(UI_PLUGIN_CONFIG_KEY) ?? defaultPluginConfig;
    const popupRootId = uiConfig?.popupRootId ?? 'univer-popup-portal';

    const updatePosition = useEvent((position: IAbsolutePosition) => {
        requestAnimationFrame(() => {
            if (!nodeRef.current) return;

            const { clientWidth, clientHeight } = nodeRef.current;
            const boundaryRect = boundaryElement?.getBoundingClientRect();
            const containerLeft = Math.max(boundaryRect?.left ?? 0, 0);
            const containerTop = Math.max(boundaryRect?.top ?? 0, 0);
            const containerRight = Math.min(boundaryRect?.right ?? window.innerWidth, window.innerWidth);
            const containerBottom = Math.min(boundaryRect?.bottom ?? window.innerHeight, window.innerHeight);
            const containerWidth = Math.max(containerRight - containerLeft, 0);
            const containerHeight = Math.max(containerBottom - containerTop, 0);
            const minimumGap = noPushMinimumGap ? 0 : PUSHING_MINIMUM_GAP * 2;
            const cannotFitBoundary = boundaryElement != null && (
                containerWidth <= 0 ||
                containerHeight <= 0 ||
                containerWidth < clientWidth + minimumGap ||
                containerHeight < clientHeight + minimumGap
            );

            nodeRef.current.style.visibility = cannotFitBoundary ? 'hidden' : '';
            if (cannotFitBoundary) return;

            const layout = {
                position,
                width: clientWidth,
                height: clientHeight,
                containerLeft,
                containerTop,
                containerWidth,
                containerHeight,
                boundaryInsets,
                direction,
                noPushMinimumGap,
            };
            const nextDirection = resolvePopupDirection(layout);

            setResolvedDirection((currentDirection) => currentDirection === nextDirection ? currentDirection : nextDirection);
            positionRef.current = calcPopupPosition({ ...layout, direction: nextDirection });

            nodeRef.current.style.top = `${positionRef.current.top}px`;
            nodeRef.current.style.left = `${positionRef.current.left}px`;
        });
    });

    useEffect(() => {
        let observer: ResizeObserver | null;
        if (nodeRef.current) {
            observer = new ResizeObserver(() => {
                if (!autoRelayout) return;
                if (!anchorRectRef.current) return;
                updatePosition(anchorRectRef.current);
            });

            observer.observe(nodeRef.current);
        }

        return () => {
            observer?.disconnect();
        };
    }, [nodeRef.current, autoRelayout]);

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

    const localeService = useDependency(LocaleService);
    const dir = useObservable(localeService.direction$);

    const ele = (
        <>
            {mask && (
                <div
                    data-u-comp="rect-popup-mask"
                    className="univer-fixed univer-inset-0 univer-z-[100]"
                    style={{ zIndex: maskZIndex }}
                    onClick={onMaskClick}
                />
            )}
            <section
                data-u-comp="rect-popup"
                ref={nodeRef}
                dir={dir}
                className={clsx(`
                  univer-pointer-events-auto univer-fixed univer-left-[-9999px] univer-top-[-9999px] univer-z-[1020]
                `, {
                    'univer-hidden': hidden,
                    'univer-animate-in univer-fade-in-70': !hidden,
                })}
                style={{ ...positionRef.current, zIndex }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onClick}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
            >
                <RectPopupDirectionContext.Provider value={resolvedDirection}>
                    <RectPopupContext.Provider value={anchorRectRef}>
                        {children}
                    </RectPopupContext.Provider>
                </RectPopupDirectionContext.Provider>
            </section>
        </>
    );

    return !portal ? ele : document.getElementById(popupRootId) ? createPortal(ele, document.getElementById(popupRootId)!) : null;
}

RectPopup.calcPopupPosition = calcPopupPosition;

RectPopup.useContext = () => useContext(RectPopupContext);
RectPopup.useDirection = () => useContext(RectPopupDirectionContext);

export { RectPopup };
