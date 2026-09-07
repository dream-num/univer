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

import type { ReactElement, ReactNode, RefObject } from 'react';
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';

export type MobilePanelLayout = 'canvas' | 'modal';

interface IMobileCanvasPanel {
    ref: RefObject<HTMLElement | null>;
    layout: MobilePanelLayout;
    dragging: boolean;
}

const MobileCanvasLayoutContext = createContext<{
    panels: IMobileCanvasPanel[];
    register: (panel: IMobileCanvasPanel) => () => void;
} | null>(null);

const MOBILE_CANVAS_VISIBLE_RATIO = 0.4;

export function MobileCanvasLayoutProvider({ children }: { children: ReactNode }): ReactElement {
    const [panels, setPanels] = useState<IMobileCanvasPanel[]>([]);
    const register = useCallback((panel: IMobileCanvasPanel) => {
        setPanels((current) => [...current, panel]);
        return () => setPanels((current) => current.filter((item) => item !== panel));
    }, []);
    const value = useMemo(() => ({ panels, register }), [panels, register]);
    return <MobileCanvasLayoutContext.Provider value={value}>{children}</MobileCanvasLayoutContext.Provider>;
}

/** Register the actual surface, not its full-screen portal container. */
export function useMobileCanvasPanel(
    ref: RefObject<HTMLElement | null>,
    layout: MobilePanelLayout,
    dragging = false
): void {
    const register = useContext(MobileCanvasLayoutContext)?.register;
    useLayoutEffect(() => {
        if (ref.current && register) {
            return register({ ref, layout, dragging });
        }
    }, [ref, register, layout, dragging]);
}

/** Connect design-layer overlay surfaces to the current workbench layout. */
export function useMobileOverlayRegistration(layout: MobilePanelLayout): (element: HTMLElement) => void | (() => void) {
    const register = useContext(MobileCanvasLayoutContext)?.register;
    return useCallback((element: HTMLElement) => register?.({ ref: { current: element }, layout, dragging: false }), [register, layout]);
}

/** Minimal viewport translation in CSS pixels. Large objects keep their leading edge visible. */
export function getMobileCanvasPanDelta(
    target: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
    viewport: Pick<DOMRect, 'width' | 'height'>
): { x: number; y: number } {
    const reveal = (start: number, size: number, available: number) => {
        const margin = Math.min(16, available / 4);
        const end = start + Math.min(size, available - margin * 2);
        if (start < margin) {
            return margin - start;
        }
        return end > available - margin ? available - margin - end : 0;
    };
    return { x: reveal(target.left, target.width, viewport.width), y: reveal(target.top, target.height, viewport.height) };
}

/**
 * Opt-in canvas host. Panels remain outside the resizable inner element so their
 * measurement cannot feed back into their own containing block. No focus or zoom
 * changes are performed here; each renderer owns its viewport translation.
 */
export function useMobileCanvasViewport(options: {
    containerRef: RefObject<HTMLElement | null>;
    canvasRef: RefObject<HTMLElement | null>;
    enabled?: boolean;
    onReveal: () => void;
}): void {
    const { containerRef, canvasRef, enabled = true, onReveal } = options;
    const context = useContext(MobileCanvasLayoutContext);
    const revealRef = useRef(onReveal);
    useLayoutEffect(() => {
        revealRef.current = onReveal;
    }, [onReveal]);
    const previousHeightRef = useRef<number | null>(null);
    const needsRevealRef = useRef(false);

    useLayoutEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!context || !enabled || !container || !canvas) {
            return;
        }

        const panels = context.panels.flatMap(({ ref, layout, dragging }) =>
            ref.current ? [{ element: ref.current, layout, dragging }] : []);
        const viewport = window.visualViewport;
        let frame = 0;
        let settleFrame = 0;
        const originalHeight = canvas.style.height;
        const originalBottom = canvas.style.bottom;
        const originalTop = canvas.style.top;
        const panelStyles = panels.map(({ element }) => ({
            element,
            bottom: element.style.bottom,
            maxHeight: element.style.maxHeight,
        }));

        const settle = () => {
            cancelAnimationFrame(settleFrame);
            settleFrame = requestAnimationFrame(() => {
                settleFrame = requestAnimationFrame(() => {
                    if (needsRevealRef.current && !panels.some((panel) => panel.dragging)) {
                        needsRevealRef.current = false;
                        revealRef.current();
                    }
                });
            });
        };
        const measure = () => {
            const bounds = container.getBoundingClientRect();
            const modal = panels.some((panel) => panel.layout === 'modal');
            const visibleBottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
            const top = modal ? bounds.top : Math.max(bounds.top, viewport?.offsetTop ?? 0);
            let bottom = modal ? bounds.bottom : Math.min(bounds.bottom, visibleBottom);
            const panelMaxHeight = Math.max(0, bottom - top) * (1 - MOBILE_CANVAS_VISIBLE_RATIO);
            if (!modal) {
                for (const { element, layout } of panels) {
                    if (layout !== 'canvas') {
                        continue;
                    }
                    const containingBlock = element.offsetParent;
                    const parentBottom = getComputedStyle(element).position === 'fixed' || !containingBlock
                        ? window.innerHeight
                        : containingBlock.getBoundingClientRect().bottom;
                    element.style.bottom = `${Math.max(0, parentBottom - visibleBottom)}px`;
                    element.style.maxHeight = `${panelMaxHeight}px`;
                    const rect = element.getBoundingClientRect();
                    if (rect.right > bounds.left && rect.left < bounds.right && rect.bottom > bounds.top) {
                        bottom = Math.min(bottom, rect.top);
                    }
                }
            }
            const height = Math.max(0, bottom - top);
            const oldHeight = previousHeightRef.current ?? bounds.height;
            if (modal || height > oldHeight + 1) {
                needsRevealRef.current = false;
            }
            needsRevealRef.current ||= !modal && height < oldHeight - 1;
            previousHeightRef.current = height;
            canvas.style.bottom = 'auto';
            canvas.style.top = `${top - bounds.top}px`;
            canvas.style.height = `${height}px`;
            settle();
        };
        const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(measure);
        };
        const observer = new ResizeObserver(schedule);
        const cancelReveal = () => {
            needsRevealRef.current = false;
        };
        canvas.addEventListener('pointerdown', cancelReveal);
        observer.observe(container);
        panels.forEach(({ element }) => observer.observe(element));
        viewport?.addEventListener('resize', schedule);
        viewport?.addEventListener('scroll', schedule);
        window.addEventListener('resize', schedule);
        measure();
        return () => {
            observer.disconnect();
            canvas.removeEventListener('pointerdown', cancelReveal);
            cancelAnimationFrame(frame);
            cancelAnimationFrame(settleFrame);
            viewport?.removeEventListener('resize', schedule);
            viewport?.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            canvas.style.height = originalHeight;
            canvas.style.bottom = originalBottom;
            canvas.style.top = originalTop;
            panelStyles.forEach(({ element, bottom, maxHeight }) => {
                element.style.bottom = bottom;
                element.style.maxHeight = maxHeight;
            });
        };
    }, [context, enabled, containerRef, canvasRef]);
}
