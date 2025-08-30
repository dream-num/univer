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
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from '../../helper/clsx';

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
     * @default false
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
    } = props;

    // Internal state for uncontrolled mode
    const [uncontrolledVisible, setUncontrolledVisible] = useState(false);

    // Determine whether the tooltip is controlled or uncontrolled
    const isControlled = controlledVisible !== undefined;
    const visible = isControlled ? controlledVisible : uncontrolledVisible;

    const triggerRef = useRef<HTMLElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const arrowRef = useRef<HTMLDivElement | null>(null);

    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
    const [currentPlacement, setCurrentPlacement] = useState(placement);

    function isContentOverflowing(element: HTMLElement): boolean {
        return Math.abs(element.scrollWidth - element.clientWidth) > 1;
    }

    function showTooltip() {
        if (isControlled) {
            onVisibleChange?.(true);
        } else {
            setUncontrolledVisible(true);
        }
    }

    function hideTooltip() {
        if (isControlled) {
            onVisibleChange?.(false);
        } else {
            setUncontrolledVisible(false);
        }
    }

    // compute position when visible changes
    useLayoutEffect(() => {
        if (!visible) return;
        const trigger = triggerRef.current;
        const tip = tooltipRef.current;
        if (!trigger || !tip) return;

        const triggerRect = trigger.getBoundingClientRect();
        const tipRect = tip.getBoundingClientRect();
        const offset = 8; // gap between trigger and tooltip

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const placements = [placement, 'bottom', 'top', 'right', 'left'] as const;

        let chosen: typeof placement = placement;
        let top = 0;
        let left = 0;

        const computeFor = (p: typeof placement) => {
            let t = 0;
            let l = 0;
            if (p === 'bottom') {
                t = triggerRect.bottom + offset;
                l = triggerRect.left + triggerRect.width / 2 - tipRect.width / 2;
            } else if (p === 'top') {
                t = triggerRect.top - tipRect.height - offset;
                l = triggerRect.left + triggerRect.width / 2 - tipRect.width / 2;
            } else if (p === 'left') {
                t = triggerRect.top + triggerRect.height / 2 - tipRect.height / 2;
                l = triggerRect.left - tipRect.width - offset;
            } else {
                // right
                t = triggerRect.top + triggerRect.height / 2 - tipRect.height / 2;
                l = triggerRect.right + offset;
            }
            return { t, l };
        };

        for (const p of placements) {
            const { t, l } = computeFor(p);
            const fitsHorizontally = l >= 0 && l + tipRect.width <= viewportWidth;
            const fitsVertically = t >= 0 && t + tipRect.height <= viewportHeight;
            if (fitsHorizontally && fitsVertically) {
                chosen = p;
                top = t;
                left = l;
                break;
            }
        }

        // fallback to preferred placement computation if none fully fits
        if (!top && !left) {
            const c = computeFor(placement);
            top = Math.min(Math.max(0, c.t), viewportHeight - tipRect.height);
            left = Math.min(Math.max(0, c.l), viewportWidth - tipRect.width);
        }

        setCurrentPlacement(chosen);
        setCoords({ top: Math.round(top + window.scrollY), left: Math.round(left + window.scrollX) });
    }, [visible, placement]);

    // update position on scroll/resize while visible
    useEffect(() => {
        if (!visible) return;
        const handler = () => {
            if (!triggerRef.current || !tooltipRef.current) return;
            // trigger a layout effect recompute by toggling a state - here simply call the same logic by forcing effect run
            // easiest: call the layout effect by updating a small state; but we'll just recompute coords directly here
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tipRect = tooltipRef.current.getBoundingClientRect();
            const offset = 8;

            let top = 0;
            let left = 0;
            if (currentPlacement === 'bottom') {
                top = triggerRect.bottom + offset;
                left = triggerRect.left + triggerRect.width / 2 - tipRect.width / 2;
            } else if (currentPlacement === 'top') {
                top = triggerRect.top - tipRect.height - offset;
                left = triggerRect.left + triggerRect.width / 2 - tipRect.width / 2;
            } else if (currentPlacement === 'left') {
                top = triggerRect.top + triggerRect.height / 2 - tipRect.height / 2;
                left = triggerRect.left - tipRect.width - offset;
            } else {
                top = triggerRect.top + triggerRect.height / 2 - tipRect.height / 2;
                left = triggerRect.right + offset;
            }

            setCoords({ top: Math.round(top + window.scrollY), left: Math.round(left + window.scrollX) });
        };

        window.addEventListener('scroll', handler, true);
        window.addEventListener('resize', handler);
        return () => {
            window.removeEventListener('scroll', handler, true);
            window.removeEventListener('resize', handler);
        };
    }, [visible, currentPlacement]);

    // build trigger element: wrap children in an element that holds ref and handlers.
    // Note: we always wrap rather than attempting to forward refs into arbitrary child components.
    const commonProps = {
        ref: (node: HTMLElement | null) => (triggerRef.current = node),
        onMouseEnter: () => {
            if (showIfEllipsis && triggerRef.current) {
                if (!isContentOverflowing(triggerRef.current)) return;
            }
            showTooltip();
        },
        onMouseLeave: () => hideTooltip(),
        onFocus: () => showTooltip(),
        onBlur: () => hideTooltip(),
    } as React.HTMLAttributes<HTMLElement> & { ref?: (node: HTMLElement | null) => void };

    const triggerElement = asChild
        ? (
            <span {...commonProps} className="univer-inline-block univer-max-w-full univer-truncate">
                {children}
            </span>
        )
        : (
            <button type="button" {...commonProps}>
                {children}
            </button>
        );

    // tooltip node
    let tooltipNode: ReactElement | null = null;
    if (typeof document !== 'undefined' && visible && title && document.body) {
        tooltipNode = createPortal(
            <div
                ref={tooltipRef}
                role="tooltip"
                className={clsx(`
                  univer-animate-in univer-fade-in-0 univer-zoom-in-95 univer-pointer-events-auto univer-absolute
                  univer-z-[1081] univer-box-border univer-w-fit univer-max-w-sm univer-text-balance univer-rounded-lg
                  univer-bg-gray-700 univer-px-2.5 univer-py-2 univer-text-xs univer-font-medium univer-text-white
                  univer-shadow-lg univer-drop-shadow-sm
                  dark:!univer-bg-gray-100 dark:!univer-text-gray-900
                `, className)}
                style={{
                    top: coords?.top ?? -9999,
                    left: coords?.left ?? -9999,
                }}
                onMouseEnter={() => showTooltip()}
                onMouseLeave={() => hideTooltip()}
            >
                <div>{title}</div>
                <div
                    ref={arrowRef}
                    className={`
                      univer-absolute univer-size-2.5 univer-rotate-45 univer-rounded-sm univer-bg-gray-700
                      dark:univer-bg-gray-100
                    `}
                    style={{
                        // position arrow based on placement
                        ...(currentPlacement === 'bottom' && { top: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)' }),
                        ...(currentPlacement === 'top' && { bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)' }),
                        ...(currentPlacement === 'left' && { right: -5, top: '50%', transform: 'translateY(-50%) rotate(45deg)' }),
                        ...(currentPlacement === 'right' && { left: -5, top: '50%', transform: 'translateY(-50%) rotate(45deg)' }),
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
