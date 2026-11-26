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

import type { ReactElement, ReactNode } from 'react';
import { useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { focusClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { ConfigContext } from '../config-provider/ConfigProvider';

export interface ITooltipProps {
    /**
     * The trigger element
     */
    children: ReactNode;
    /**
     * The class name of the tooltip
     */
    className?: string;
    /**
     * Whether the tooltip is a child of the trigger element
     * @default true
     */
    asChild?: boolean;
    /**
     * The content of the tooltip
     * @description If not set, the tooltip will not be displayed. Although it can be set to ReactNode, it is recommended to use string.
     */
    title?: ReactNode;
    /**
     * The placement of the tooltip
     * @default 'bottom'
     */
    placement?: 'top' | 'right' | 'bottom' | 'left';
    /**
     * Whether the tooltip is displayed when the content is ellipsis
     * @default false
     */
    showIfEllipsis?: boolean;
    /**
     * Whether the tooltip is visible
     * @description If not set, the tooltip will be controlled by the component itself
     */
    visible?: boolean;
    /**
     * Callback when the visibility of the tooltip changes
     */
    onVisibleChange?: (visible: boolean) => void;
    /**
     * Delay in milliseconds before showing the tooltip
     * @default 0
     */
    openDelay?: number;
    /**
     * Delay in milliseconds before hiding the tooltip
     * @default 0
     */
    closeDelay?: number;
}

interface ITooltipPosition {
    top: number;
    left: number;
    arrowOffset: number;
    placement: NonNullable<ITooltipProps['placement']>;
}

export function Tooltip(props: ITooltipProps) {
    const {
        children,
        className,
        asChild = true,
        title,
        placement = 'bottom',
        showIfEllipsis = false,
        visible: controlledVisible,
        onVisibleChange,
        openDelay = 0,
        closeDelay = 0,
    } = props;

    const { direction } = useContext(ConfigContext);
    const tooltipId = useId();

    // Internal state for uncontrolled mode
    const [uncontrolledVisible, setUncontrolledVisible] = useState(false);

    // Determine whether the tooltip is controlled or uncontrolled
    const isControlled = controlledVisible !== undefined;
    const visible = isControlled ? controlledVisible : uncontrolledVisible;

    const triggerRef = useRef<HTMLElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const arrowRef = useRef<HTMLDivElement | null>(null);
    const openTimerRef = useRef<number | null>(null);
    const closeTimerRef = useRef<number | null>(null);

    const [position, setPosition] = useState<ITooltipPosition | null>(null);

    const clearTimers = useCallback(() => {
        if (openTimerRef.current !== null) {
            window.clearTimeout(openTimerRef.current);
            openTimerRef.current = null;
        }
        if (closeTimerRef.current !== null) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    }, []);

    useEffect(() => clearTimers, [clearTimers]);

    function isContentOverflowing(element: HTMLElement): boolean {
        return Math.abs(element.scrollWidth - element.clientWidth) > 1;
    }

    function canShowTooltip(): boolean {
        if (showIfEllipsis && triggerRef.current) {
            return isContentOverflowing(triggerRef.current);
        }
        return true;
    }

    const setTooltipVisible = useCallback((nextVisible: boolean) => {
        if (isControlled) {
            onVisibleChange?.(nextVisible);
        } else {
            setUncontrolledVisible(nextVisible);
        }
    }, [isControlled, onVisibleChange]);

    const showTooltip = useCallback((immediate = false) => {
        clearTimers();
        if (immediate || openDelay <= 0) {
            setTooltipVisible(true);
        } else {
            openTimerRef.current = window.setTimeout(() => {
                openTimerRef.current = null;
                setTooltipVisible(true);
            }, openDelay);
        }
    }, [clearTimers, openDelay, setTooltipVisible]);

    const hideTooltip = useCallback((immediate = false) => {
        clearTimers();
        if (immediate || closeDelay <= 0) {
            setTooltipVisible(false);
        } else {
            closeTimerRef.current = window.setTimeout(() => {
                closeTimerRef.current = null;
                setTooltipVisible(false);
            }, closeDelay);
        }
    }, [clearTimers, closeDelay, setTooltipVisible]);

    const updatePosition = useCallback(() => {
        const trigger = triggerRef.current;
        const tip = tooltipRef.current;
        if (!trigger || !tip) return;

        const triggerRect = trigger.getBoundingClientRect();
        const tipRect = tip.getBoundingClientRect();
        const offset = 8; // gap between trigger and tooltip

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const placements = [placement, 'bottom', 'top', 'right', 'left'] as const;

        let chosen: NonNullable<ITooltipProps['placement']> = placement;
        let top = 0;
        let left = 0;
        let found = false;

        const computeFor = (p: NonNullable<ITooltipProps['placement']>) => {
            if (p === 'bottom') {
                return {
                    t: triggerRect.bottom + offset,
                    l: triggerRect.left + triggerRect.width / 2 - tipRect.width / 2,
                };
            }
            if (p === 'top') {
                return {
                    t: triggerRect.top - tipRect.height - offset,
                    l: triggerRect.left + triggerRect.width / 2 - tipRect.width / 2,
                };
            }
            if (p === 'left') {
                return {
                    t: triggerRect.top + triggerRect.height / 2 - tipRect.height / 2,
                    l: triggerRect.left - tipRect.width - offset,
                };
            }
            return {
                t: triggerRect.top + triggerRect.height / 2 - tipRect.height / 2,
                l: triggerRect.right + offset,
            };
        };

        for (const p of placements) {
            const { t, l } = computeFor(p);
            const fitsHorizontally = l >= 0 && l + tipRect.width <= viewportWidth;
            const fitsVertically = t >= 0 && t + tipRect.height <= viewportHeight;
            if (fitsHorizontally && fitsVertically) {
                chosen = p;
                top = t;
                left = l;
                found = true;
                break;
            }
        }

        // fallback to preferred placement computation clamped within viewport if none fully fits
        if (!found) {
            const c = computeFor(placement);
            top = Math.min(Math.max(0, c.t), Math.max(0, viewportHeight - tipRect.height));
            left = Math.min(Math.max(0, c.l), Math.max(0, viewportWidth - tipRect.width));
        }

        let arrowOffset: number;
        if (chosen === 'top' || chosen === 'bottom') {
            const triggerCenterX = triggerRect.left + triggerRect.width / 2;
            const rawOffset = triggerCenterX - left;
            const minEdge = Math.min(10, tipRect.width / 2);
            arrowOffset = Math.round(Math.min(Math.max(rawOffset, minEdge), Math.max(minEdge, tipRect.width - minEdge)));
        } else {
            const triggerCenterY = triggerRect.top + triggerRect.height / 2;
            const rawOffset = triggerCenterY - top;
            const minEdge = Math.min(10, tipRect.height / 2);
            arrowOffset = Math.round(Math.min(Math.max(rawOffset, minEdge), Math.max(minEdge, tipRect.height - minEdge)));
        }

        setPosition({
            top: Math.round(top + window.scrollY),
            left: Math.round(left + window.scrollX),
            arrowOffset,
            placement: chosen,
        });
    }, [placement]);

    // compute position when visible changes
    useLayoutEffect(() => {
        if (!visible) return;
        updatePosition();
    }, [visible, updatePosition]);

    // update position on scroll/resize and dismiss on Escape while visible
    useEffect(() => {
        if (!visible) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !event.isComposing) {
                hideTooltip(true);
            }
        };

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [visible, updatePosition, hideTooltip]);

    // build trigger element: wrap children in an element that holds ref and handlers.
    // Note: we always wrap rather than attempting to forward refs into arbitrary child components.
    const commonProps = {
        ref: (node: HTMLElement | null) => {
            triggerRef.current = node;
        },
        'aria-describedby': visible && title ? tooltipId : undefined,
        onMouseEnter: () => {
            if (!canShowTooltip()) return;
            showTooltip();
        },
        onMouseLeave: () => hideTooltip(),
        onFocus: () => {
            if (!canShowTooltip()) return;
            showTooltip();
        },
        onBlur: () => hideTooltip(),
    } as React.HTMLAttributes<HTMLElement> & { ref?: (node: HTMLElement | null) => void };

    const triggerElement = asChild
        ? (
            <span {...commonProps} className="univer-inline-flex univer-max-w-full univer-items-center univer-truncate">
                {children}
            </span>
        )
        : (
            <button type="button" className={focusClassName} {...commonProps}>
                {children}
            </button>
        );

    const activePlacement = position?.placement ?? placement;
    const arrowOffset = position?.arrowOffset;

    // tooltip node
    let tooltipNode: ReactElement | null = null;
    if (typeof document !== 'undefined' && visible && title && document.body) {
        tooltipNode = createPortal(
            <div
                ref={tooltipRef}
                id={tooltipId}
                dir={direction}
                role="tooltip"
                className={clsx(`
                  univer-animate-in univer-fade-in-0 univer-zoom-in-95 univer-pointer-events-auto univer-absolute
                  univer-z-[1081] univer-box-border univer-w-fit univer-max-w-sm univer-text-balance univer-rounded-md
                  univer-bg-gray-800 univer-px-2.5 univer-py-1.5 univer-text-xs univer-font-medium univer-text-gray-0
                  univer-shadow-md
                  motion-reduce:univer-animate-none
                  dark:!univer-bg-gray-100 dark:!univer-text-gray-900
                `, className)}
                style={{
                    top: position?.top ?? -9999,
                    left: position?.left ?? -9999,
                }}
                onMouseEnter={() => showTooltip(true)}
                onMouseLeave={() => hideTooltip()}
            >
                <div className="univer-break-words">{title}</div>
                <div
                    ref={arrowRef}
                    aria-hidden="true"
                    className="
                      univer-absolute univer-size-2 univer-rotate-45 univer-rounded-sm univer-bg-gray-800
                      dark:!univer-bg-gray-100
                    "
                    style={{
                        ...(activePlacement === 'bottom' && {
                            top: -4,
                            left: arrowOffset !== undefined ? `${arrowOffset}px` : '50%',
                            transform: 'translateX(-50%) rotate(45deg)',
                        }),
                        ...(activePlacement === 'top' && {
                            bottom: -4,
                            left: arrowOffset !== undefined ? `${arrowOffset}px` : '50%',
                            transform: 'translateX(-50%) rotate(45deg)',
                        }),
                        ...(activePlacement === 'left' && {
                            right: -4,
                            top: arrowOffset !== undefined ? `${arrowOffset}px` : '50%',
                            transform: 'translateY(-50%) rotate(45deg)',
                        }),
                        ...(activePlacement === 'right' && {
                            left: -4,
                            top: arrowOffset !== undefined ? `${arrowOffset}px` : '50%',
                            transform: 'translateY(-50%) rotate(45deg)',
                        }),
                    }}
                />
            </div>,
            document.body
        );
    }

    return (
        <>
            {triggerElement}
            {tooltipNode}
        </>
    );
}
