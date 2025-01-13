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

import canUseDom from 'rc-util/lib/Dom/canUseDom';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from '../../helper/clsx';

export interface ITooltipProps {
    /**
     * Whether the tooltip is visible
     * @description If not set, the tooltip will be controlled by the component itself
     */
    visible?: boolean;
    /**
     * Whether the tooltip is a child of the trigger element
     * @default false
     */
    asChild?: boolean;
    /**
     * The content of the tooltip
     * @description If not set, the tooltip will not be displayed。 Although it can be set to ReactNode, it is recommended to use string.
     */
    title?: React.ReactNode;
    /**
     * The trigger element
     */
    children: React.ReactNode;
    /**
     * The placement of the tooltip
     * @default 'bottom'
     */
    placement?: 'top' | 'bottom' | 'left' | 'right';
    /**
     * Whether the tooltip is displayed when the content is ellipsis
     * @default false
     */
    showIfEllipsis?: boolean;
    /**
     * Callback when the visibility of the tooltip changes
     */
    onVisibleChange?: (visible: boolean) => void;
}

export function Tooltip({ visible, asChild = false, title, children, placement = 'bottom', showIfEllipsis = false, onVisibleChange }: ITooltipProps) {
    if (!canUseDom || title === undefined) {
        return null;
    }

    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [actualPlacement, setActualPlacement] = useState(placement);
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [arrowOffset, setArrowOffset] = useState(0);

    const [internalShow, setInternalShow] = useState(false);
    const isControlled = visible !== undefined;
    const show = isControlled ? visible : internalShow;

    const updateShow = (newShow: boolean) => {
        if (!isControlled) {
            setInternalShow(newShow);
        }
        onVisibleChange?.(newShow);
    };

    const updatePosition = () => {
        if (!triggerRef.current || !tooltipRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        const MARGIN = 8;
        const ARROW_PADDING = 12;

        let newPlacement = placement;
        let newArrowOffset = 0;

        // Calculate base position
        const getBasePosition = () => {
            switch (newPlacement) {
                case 'top':
                    return {
                        x: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
                        y: triggerRect.top - tooltipRect.height - MARGIN,
                    };
                case 'bottom':
                    return {
                        x: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
                        y: triggerRect.bottom + MARGIN,
                    };
                case 'left':
                    return {
                        x: triggerRect.left - tooltipRect.width - MARGIN,
                        y: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
                    };
                case 'right':
                    return {
                        x: triggerRect.right + MARGIN,
                        y: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
                    };
            }
        };

        // Check if it needs to be flipped
        const shouldFlip = (pos: { x: number; y: number }) => {
            switch (newPlacement) {
                case 'top':
                    return pos.y < MARGIN;
                case 'bottom':
                    return pos.y + tooltipRect.height > window.innerHeight - MARGIN;
                case 'left':
                    return pos.x < MARGIN;
                case 'right':
                    return pos.x + tooltipRect.width > window.innerWidth - MARGIN;
            }
        };

        // Get flipped placement
        const getFlippedPlacement = () => {
            const map = {
                top: 'bottom',
                bottom: 'top',
                left: 'right',
                right: 'left',
            } as const;
            return map[newPlacement];
        };

        // Initial position calculation
        let pos = getBasePosition();

        // Check if it needs to be flipped
        if (shouldFlip(pos)) {
            newPlacement = getFlippedPlacement();
            pos = getBasePosition();
        } else {
            // Edge avoidance adjustment
            if (['top', 'bottom'].includes(newPlacement)) {
                const minX = MARGIN;
                const maxX = window.innerWidth - tooltipRect.width - MARGIN;

                if (pos.x < minX) {
                    newArrowOffset = pos.x - minX;
                    pos.x = minX;
                } else if (pos.x > maxX) {
                    newArrowOffset = pos.x - maxX;
                    pos.x = maxX;
                }

                // Limit arrow offset
                const maxArrowOffset = tooltipRect.width / 2 - ARROW_PADDING;
                newArrowOffset = Math.max(Math.min(newArrowOffset, maxArrowOffset), -maxArrowOffset);
            } else {
                const minY = MARGIN;
                const maxY = window.innerHeight - tooltipRect.height - MARGIN;

                if (pos.y < minY) {
                    newArrowOffset = pos.y - minY;
                    pos.y = minY;
                } else if (pos.y > maxY) {
                    newArrowOffset = pos.y - maxY;
                    pos.y = maxY;
                }

                // Limit arrow offset
                const maxArrowOffset = tooltipRect.height / 2 - ARROW_PADDING;
                newArrowOffset = Math.max(Math.min(newArrowOffset, maxArrowOffset), -maxArrowOffset);
            }
        }

        // Add scroll offset
        pos.x += scrollX;
        pos.y += scrollY;

        setPosition(pos);
        setActualPlacement(newPlacement);
        setArrowOffset(newArrowOffset);
        setMounted(true);
    };

    useEffect(() => {
        if (show) {
            setMounted(false);
            requestAnimationFrame(() => {
                updatePosition();
            });

            const handleUpdate = () => {
                setMounted(false);
                requestAnimationFrame(updatePosition);
            };

            window.addEventListener('scroll', handleUpdate);
            window.addEventListener('resize', handleUpdate);

            return () => {
                window.removeEventListener('scroll', handleUpdate);
                window.removeEventListener('resize', handleUpdate);
            };
        }
    }, [show]);

    useEffect(() => {
        const element = triggerRef.current;
        if (!element) {
            return;
        }

        const childEl = asChild ? element : element.firstElementChild as HTMLElement;

        function isContentOverflowing(element: HTMLElement): boolean {
            return Math.abs(element.scrollWidth - element.clientWidth) > 1;
        }

        function onMouseEnter() {
            if (showIfEllipsis && childEl) {
                if (!isContentOverflowing(childEl)) return;
            }
            updateShow(true);
        }

        function onMouseLeave() {
            updateShow(false);
            setMounted(false);
        }

        if (isControlled && !onVisibleChange) {
            return;
        }

        element.addEventListener('mouseenter', onMouseEnter);
        element.addEventListener('mouseleave', onMouseLeave);

        return () => {
            element.removeEventListener('mouseenter', onMouseEnter);
            element.removeEventListener('mouseleave', onMouseLeave);
        };
    }, [asChild, showIfEllipsis, isControlled, onVisibleChange]);

    useEffect(() => {
        if (isControlled) {
            if (visible) {
                setMounted(false);
                requestAnimationFrame(() => {
                    updatePosition();
                });
            } else {
                setMounted(false);
            }
        }
    }, [visible, isControlled]);

    // eslint-disable-next-line react/no-clone-element
    const enhancedChild = React.cloneElement(
        // eslint-disable-next-line react/no-children-only
        React.Children.only(children) as React.ReactElement,
        {
            ref: triggerRef,
        }
    );

    return (
        <>
            {asChild
                ? enhancedChild
                : (
                    <div ref={triggerRef} className="univer-inline-block">
                        {children}
                    </div>
                )}

            {show && createPortal(
                <div
                    ref={tooltipRef}
                    className={clsx(`
                      univer-pointer-events-none univer-fixed univer-z-[1100] univer-font-sans univer-opacity-0
                      univer-duration-200 univer-animate-in univer-fade-in-0 univer-zoom-in-95
                    `, {
                        'univer-opacity-100': mounted,
                        'univer-slide-in-from-bottom-2': actualPlacement === 'top' && mounted,
                        'univer-slide-in-from-top-2': actualPlacement === 'bottom' && mounted,
                        'univer-slide-in-from-right-2': actualPlacement === 'left' && mounted,
                        'univer-slide-in-from-left-2': actualPlacement === 'right' && mounted,
                    })}
                    data-state={show ? 'open' : 'closed'}
                    style={{
                        left: position.x,
                        top: position.y,
                        transition: 'opacity 150ms ease-out',
                    }}
                >
                    <div className="univer-relative">
                        <div
                            className={`
                              univer-w-fit univer-max-w-[192px] univer-break-words univer-rounded-lg univer-bg-gray-700
                              univer-px-3 univer-py-2.5 univer-text-xs univer-font-medium univer-text-white
                            `}
                        >
                            {title}
                        </div>
                        {/* Arrow */}
                        <div
                            className={clsx('univer-absolute univer-h-2 univer-w-2 univer-rotate-45 univer-bg-gray-700', {
                                '-univer-bottom-1 univer-left-1/2 -univer-translate-x-1/2': actualPlacement === 'top',
                                '-univer-top-1 univer-left-1/2 -univer-translate-x-1/2': actualPlacement === 'bottom',
                                '-univer-right-1 univer-top-1/2 -univer-translate-y-1/2': actualPlacement === 'left',
                                '-univer-left-1 univer-top-1/2 -univer-translate-y-1/2': actualPlacement === 'right',
                            })}
                            style={{
                                ...(actualPlacement === 'top' && {
                                    '--tw-translate-x': `calc(-50% + ${arrowOffset}px)`,
                                }),
                                ...(actualPlacement === 'bottom' && {
                                    '--tw-translate-x': `calc(-50% + ${arrowOffset}px)`,
                                }),
                                ...(actualPlacement === 'left' && {
                                    '--tw-translate-y': `calc(-50% + ${arrowOffset}px)`,
                                }),
                                ...(actualPlacement === 'right' && {
                                    '--tw-translate-y': `calc(-50% + ${arrowOffset}px)`,
                                }),
                            } as React.CSSProperties}
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
