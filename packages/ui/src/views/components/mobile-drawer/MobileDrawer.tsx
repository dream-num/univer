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

import type { AriaRole, PointerEvent, ReactNode } from 'react';
import { clsx, resetButtonClassName, scrollbarClassName } from '@univerjs/design';
import { useRef, useState } from 'react';

export type MobileDrawerSnap = 'compact' | 'expanded';
export type MobileDrawerRelease = MobileDrawerSnap | 'closed';
type MobileDrawerRef<T> = { current: T | null } | ((instance: T | null) => void) | null;

const MOBILE_DRAWER_COMPACT_PERCENT = 40;
const MOBILE_DRAWER_EXPANDED_PERCENT = 80;

export function resolveMobileDrawerRelease(params: {
    snap: MobileDrawerSnap;
    deltaY: number;
    durationMs: number;
    percent: number;
}): MobileDrawerRelease {
    const { snap, deltaY, durationMs, percent } = params;
    const velocity = deltaY / Math.max(durationMs, 1);
    if ((deltaY > 48 && velocity > 0.55) || percent < 20) return 'closed';
    if (snap === 'expanded' && deltaY > 24) return 'compact';
    if (snap === 'compact' && deltaY < -24) return 'expanded';
    return percent >= 60 ? 'expanded' : 'compact';
}

export function MobileDrawer(props: {
    snap: MobileDrawerSnap;
    expandLabel: string;
    collapseLabel: string;
    onSnapChange: (snap: MobileDrawerSnap) => void;
    onClose: () => void;
    children?: ReactNode;
    header?: ReactNode;
    floatingActions?: ReactNode;
    componentName?: string;
    panelRef?: MobileDrawerRef<HTMLElement>;
    contentRef?: MobileDrawerRef<HTMLDivElement>;
    panelClassName?: string;
    contentClassName?: string;
    footer?: ReactNode;
    role?: AriaRole;
    ariaLabel?: string;
}) {
    const {
        snap,
        expandLabel,
        collapseLabel,
        onSnapChange,
        onClose,
        children,
        header,
        floatingActions,
        componentName = 'mobile-drawer',
        panelRef,
        contentRef,
        panelClassName,
        contentClassName,
        footer,
        role,
        ariaLabel,
    } = props;
    const [dragPercent, setDragPercent] = useState<number | null>(null);
    const suppressHandleClickRef = useRef(false);
    const dragRef = useRef<{
        startY: number;
        startTime: number;
        startPercent: number;
        currentPercent: number;
        moved: boolean;
    } | null>(null);
    const drawerPercent = dragPercent ?? (snap === 'compact'
        ? MOBILE_DRAWER_COMPACT_PERCENT
        : MOBILE_DRAWER_EXPANDED_PERCENT);

    function beginDrag(clientY: number) {
        dragRef.current = {
            startY: clientY,
            startTime: performance.now(),
            startPercent: drawerPercent,
            currentPercent: drawerPercent,
            moved: false,
        };
    }

    function moveDrag(clientY: number) {
        const drag = dragRef.current;
        if (!drag) return;

        const deltaY = clientY - drag.startY;
        const nextPercent = Math.max(0, Math.min(
            MOBILE_DRAWER_EXPANDED_PERCENT,
            drag.startPercent - deltaY / Math.max(window.innerHeight, 1) * 100
        ));
        drag.currentPercent = nextPercent;
        drag.moved ||= Math.abs(deltaY) > 6;
        setDragPercent(nextPercent);
    }

    function endDrag(clientY: number) {
        const drag = dragRef.current;
        if (!drag) return;

        const result = resolveMobileDrawerRelease({
            snap,
            deltaY: clientY - drag.startY,
            durationMs: performance.now() - drag.startTime,
            percent: drag.currentPercent,
        });
        suppressHandleClickRef.current = drag.moved;
        dragRef.current = null;
        setDragPercent(null);
        if (result === 'closed') {
            onClose();
        } else {
            onSnapChange(result);
        }
    }

    function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
            // Some embedded WebViews expose Pointer Events but not pointer capture.
        }
        beginDrag(event.clientY);
    }

    function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
        moveDrag(event.clientY);
    }

    function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
        endDrag(event.clientY);
    }

    return (
        <>
            {floatingActions && (
                <div
                    className="univer-pointer-events-none univer-absolute univer-right-4 univer-z-30"
                    style={{ bottom: `calc(${drawerPercent}dvh + 12px)` }}
                >
                    {floatingActions}
                </div>
            )}
            <section
                ref={panelRef}
                role={role}
                aria-modal={role === 'dialog' || undefined}
                aria-label={ariaLabel}
                data-u-comp={componentName}
                data-snap={snap}
                className={clsx(`
                  univer-absolute univer-inset-x-0 univer-bottom-0 univer-z-20 univer-flex univer-flex-col
                  univer-overflow-hidden univer-rounded-t-[24px] univer-bg-gray-50 univer-shadow-2xl
                  univer-transition-[height] univer-duration-200
                  dark:!univer-bg-gray-900
                `, dragPercent != null && '!univer-transition-none', panelClassName)}
                style={{
                    height: `${drawerPercent}dvh`,
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                }}
            >
                <div
                    className="
                      univer-relative univer-flex univer-h-14 univer-shrink-0 univer-items-end univer-bg-gray-0
                      dark:!univer-bg-gray-800
                    "
                >
                    <button
                        type="button"
                        aria-label={snap === 'compact' ? expandLabel : collapseLabel}
                        className={clsx(resetButtonClassName, `
                          univer-absolute univer-left-1/2 univer-top-0 univer-z-10 univer-flex univer-h-6 univer-w-16
                          -univer-translate-x-1/2 univer-touch-none univer-items-center univer-justify-center
                        `)}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        onClick={() => {
                            if (suppressHandleClickRef.current) {
                                suppressHandleClickRef.current = false;
                                return;
                            }
                            onSnapChange(snap === 'compact' ? 'expanded' : 'compact');
                        }}
                    >
                        <span
                            className="
                              univer-h-1 univer-w-10 univer-rounded-full univer-bg-gray-300
                              dark:!univer-bg-gray-600
                            "
                        />
                    </button>
                    {header}
                </div>
                <div
                    ref={contentRef}
                    className={clsx(
                        'univer-flex-1 univer-overflow-y-auto univer-overflow-x-hidden univer-p-3',
                        scrollbarClassName,
                        contentClassName
                    )}
                >
                    {children}
                </div>
                {footer}
            </section>
        </>
    );
}
