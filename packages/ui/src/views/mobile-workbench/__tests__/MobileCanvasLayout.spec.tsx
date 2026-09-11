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

/** @vitest-environment jsdom */

import type { MobilePanelLayout } from '../MobileCanvasLayout';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getMobileCanvasPanDelta,
    MobileCanvasLayoutProvider,
    useMobileCanvasPanel,
    useMobileCanvasViewport,
} from '../MobileCanvasLayout';

describe('mobile canvas layout', () => {
    const reveal = vi.fn();
    let panelTop = 540;
    let viewportHeight = 900;
    const viewportEvents = new EventTarget();
    const resizeCallbacks = new Set<() => void>();

    function Panel({ layout, dragging }: { layout: MobilePanelLayout; dragging?: boolean }) {
        const ref = useRef<HTMLDivElement>(null);
        useMobileCanvasPanel(ref, layout, dragging);
        return <div ref={ref} role="region" aria-label="panel"><input aria-label="editor" /></div>;
    }

    function Canvas({ panelsOnly, enabled }: { panelsOnly?: boolean; enabled?: boolean }) {
        const containerRef = useRef<HTMLDivElement>(null);
        const canvasRef = useRef<HTMLDivElement>(null);
        useMobileCanvasViewport({ containerRef, canvasRef, panelsOnly, enabled, onReveal: reveal });
        return <div ref={containerRef} role="region" aria-label="host"><div ref={canvasRef} role="region" aria-label="canvas" /></div>;
    }

    function App({ layout, dragging, panelsOnly, enabled }: { layout?: MobilePanelLayout; dragging?: boolean; panelsOnly?: boolean; enabled?: boolean }) {
        return (
            <MobileCanvasLayoutProvider>
                <Canvas panelsOnly={panelsOnly} enabled={enabled} />
                {layout && <Panel layout={layout} dragging={dragging} />}
            </MobileCanvasLayoutProvider>
        );
    }

    function flush() {
        act(() => {
            vi.advanceTimersByTime(100);
        });
    }

    beforeEach(() => {
        vi.useFakeTimers();
        reveal.mockClear();
        panelTop = 540;
        viewportHeight = 900;
        resizeCallbacks.clear();
        vi.stubGlobal('innerHeight', 900);
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 16));
        vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id));
        vi.stubGlobal('ResizeObserver', class {
            constructor(private readonly callback: () => void) { resizeCallbacks.add(callback); }
            observe() {}
            disconnect() { resizeCallbacks.delete(this.callback); }
        });
        vi.stubGlobal('visualViewport', {
            offsetTop: 0,
            get height() { return viewportHeight; },
            addEventListener: viewportEvents.addEventListener.bind(viewportEvents),
            removeEventListener: viewportEvents.removeEventListener.bind(viewportEvents),
        });
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
            if (this.getAttribute('aria-label') === 'host') return new DOMRect(0, 44, 430, 856);
            if (this.getAttribute('aria-label') === 'panel') {
                const bottom = Number.parseFloat(this.style.bottom) || 0;
                return new DOMRect(0, panelTop - bottom, 430, 900 - panelTop);
            }
            return new DOMRect(0, 0, 430, 900);
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('resizes for an object panel and only reveals when the available area shrinks', () => {
        const view = render(<App />);
        expect(screen.getByRole('region', { name: 'canvas' }).style.height).toBe('856px');
        view.rerender(<App layout="canvas" />);
        flush();
        expect(screen.getByRole('region', { name: 'canvas' }).style.height).toBe('496px');
        expect(reveal).toHaveBeenCalledTimes(1);
        act(() => resizeCallbacks.forEach((callback) => callback()));
        flush();
        expect(reveal).toHaveBeenCalledTimes(1);
        view.rerender(<App />);
        flush();
        expect(screen.getByRole('region', { name: 'canvas' }).style.height).toBe('856px');
        expect(reveal).toHaveBeenCalledTimes(1);
    });

    it('only resizes the canvas while its owning product enables the viewport', () => {
        const view = render(<App panelsOnly enabled={false} layout="canvas" />);
        const canvas = screen.getByRole('region', { name: 'canvas' });
        flush();
        expect(canvas.style.height).toBe('');
        expect(reveal).not.toHaveBeenCalled();

        view.rerender(<App panelsOnly enabled layout="canvas" />);
        flush();
        expect(canvas.style.height).toBe('496px');
        expect(reveal).toHaveBeenCalledTimes(1);

        view.rerender(<App panelsOnly enabled={false} layout="canvas" />);
        act(() => resizeCallbacks.forEach((callback) => callback()));
        flush();
        expect(canvas.style.height).toBe('');
        expect(canvas.style.top).toBe('');
        expect(canvas.style.bottom).toBe('');
        expect(reveal).toHaveBeenCalledTimes(1);
    });

    it('keeps the canvas unchanged for global settings', () => {
        render(<App layout="modal" />);
        viewportHeight = 500;
        act(() => viewportEvents.dispatchEvent(new Event('resize')));
        flush();
        expect(screen.getByRole('region', { name: 'canvas' }).style.height).toBe('856px');
        expect(reveal).not.toHaveBeenCalled();
    });

    it('leaves document keyboard layout alone outside object panels and restores the host on close', () => {
        const view = render(<App panelsOnly />);
        const canvas = screen.getByRole('region', { name: 'canvas' });
        viewportHeight = 700;
        act(() => viewportEvents.dispatchEvent(new Event('resize')));
        flush();
        expect(canvas.style.height).toBe('');
        view.rerender(<App panelsOnly layout="canvas" />);
        flush();
        expect(canvas.style.height).toBe('296px');
        expect(reveal).toHaveBeenCalledTimes(1);
        view.rerender(<App panelsOnly />);
        flush();
        expect(canvas.style.height).toBe('');
        expect(canvas.style.top).toBe('');
        expect(canvas.style.bottom).toBe('');
        view.rerender(<App panelsOnly layout="modal" />);
        flush();
        expect(canvas.style.height).toBe('');
        expect(reveal).toHaveBeenCalledTimes(1);
    });

    it('counts keyboard and panel geometry once and retains input focus over repeated keyboard cycles', () => {
        render(<App layout="canvas" />);
        const input = screen.getByRole('textbox', { name: 'editor' });
        input.focus();
        for (let cycle = 0; cycle < 6; cycle++) {
            viewportHeight = 700;
            act(() => viewportEvents.dispatchEvent(new Event('resize')));
            flush();
            expect(screen.getByRole('region', { name: 'canvas' }).style.height).toBe('296px');
            expect(document.activeElement).toBe(input);
            viewportHeight = 900;
            act(() => viewportEvents.dispatchEvent(new Event('resize')));
            flush();
            expect(screen.getByRole('region', { name: 'canvas' }).style.height).toBe('496px');
            expect(document.activeElement).toBe(input);
        }
    });

    it('resizes during drawer dragging but reveals only after release', () => {
        const view = render(<App layout="canvas" dragging />);
        flush();
        expect(reveal).not.toHaveBeenCalled();
        panelTop = 450;
        act(() => resizeCallbacks.forEach((callback) => callback()));
        flush();
        expect(screen.getByRole('region', { name: 'canvas' }).style.height).toBe('406px');
        expect(reveal).not.toHaveBeenCalled();
        view.rerender(<App layout="canvas" />);
        flush();
        expect(reveal).toHaveBeenCalledTimes(1);
    });

    it('positions nested absolute panels against their containing block', () => {
        render(<App layout="canvas" />);
        const panel = screen.getByRole('region', { name: 'panel' });
        const host = screen.getByRole('region', { name: 'host' });
        Object.defineProperty(panel, 'offsetParent', { value: host });
        viewportHeight = 700;
        act(() => viewportEvents.dispatchEvent(new Event('resize')));
        flush();
        expect(panel.style.bottom).toBe('200px');
        expect(screen.getByRole('region', { name: 'canvas' }).style.height).toBe('296px');
    });

    it('does not fight a manual canvas gesture with a pending reveal', () => {
        render(<App layout="canvas" />);
        fireEvent.pointerDown(screen.getByRole('region', { name: 'canvas' }));
        flush();
        expect(reveal).not.toHaveBeenCalled();
    });

    it('only pans hidden targets and retains scale-independent distances', () => {
        const viewport = { width: 430, height: 400 };
        expect(getMobileCanvasPanDelta({ left: 20, top: 20, width: 100, height: 80 }, viewport)).toEqual({ x: 0, y: 0 });
        expect(getMobileCanvasPanDelta({ left: 20, top: 350, width: 100, height: 80 }, viewport)).toEqual({ x: 0, y: -46 });
        expect(getMobileCanvasPanDelta({ left: 100, top: 350, width: 800, height: 600 }, viewport)).toEqual({ x: -84, y: -334 });
    });
});
