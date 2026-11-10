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

import type { IViewportInfo } from '@univerjs/engine-render';
import { UniverRenderingContext } from '@univerjs/engine-render';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeadingCollapseShape } from '../heading-collapse-shape';

function createButton() {
    const fills: string[] = [];
    const context = {
        save: vi.fn(),
        restore: vi.fn(),
        transform: vi.fn(),
        translate: vi.fn<(left: number, top: number) => void>(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        arc: vi.fn(),
        rect: vi.fn(),
        fill: () => fills.push(context.fillStyle),
        fillStyle: '',
        fillText: vi.fn(),
        measureText: (text: string) => ({ width: text.length * 8 }),
    };
    const ctx = new UniverRenderingContext(context as unknown as CanvasRenderingContext2D);
    const activate = vi.fn();
    const colors = { normal: '#121212', hover: '#3355ff', tooltipBackground: '#222222', tooltipText: '#ffffff' };
    const button = new HeadingCollapseShape('heading-button', colors, activate);
    button.update(false, 'Collapse', colors);
    return { button, ctx, context, fills, activate };
}

describe('HeadingCollapseShape', () => {
    afterEach(() => vi.useRealTimers());

    it('draws only the arrow until a 500ms hover, then draws its tooltip above', () => {
        vi.useFakeTimers();
        const { button, ctx, context, fills } = createButton();
        button.render(ctx);
        expect(fills).toEqual(['#121212']);
        button.onPointerEnter$.emitEvent({ buttons: 0 } as never);
        button.render(ctx);
        expect(fills).toEqual(['#121212', '#3355ff']);
        vi.advanceTimersByTime(499);
        button.render(ctx);
        expect(context.fillText).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        button.render(ctx);
        expect(context.fillText).toHaveBeenCalledWith('Collapse', expect.any(Number), expect.any(Number));
        expect(context.translate.mock.calls.some(([, top]) => top < 0)).toBe(true);
        const preventDefault = vi.fn();
        button.onPointerDown$.emitEvent({ button: 0, preventDefault } as never);
        button.onPointerUp$.emitEvent({ button: 0, preventDefault } as never);
        context.fillText.mockClear();
        button.render(ctx);
        expect(context.fillText).not.toHaveBeenCalled();
        expect(fills[fills.length - 1]).toBe('#3355ff');
        button.dispose();
    });

    it('keeps the tooltip inside the Canvas at its top edge', () => {
        vi.useFakeTimers();
        const { button, ctx, context } = createButton();
        button.onPointerEnter$.emitEvent({ buttons: 0 } as never);
        vi.advanceTimersByTime(500);
        button.render(ctx, { viewBound: { left: 0, top: 0, right: 400, bottom: 600 } } as IViewportInfo);
        expect(context.fillText).toHaveBeenCalled();
        expect(context.translate.mock.calls.some(([, top]) => top > button.height)).toBe(true);
        button.dispose();
    });

    it('cancels delayed tooltips on pointer leave, scroll reset and disposal', () => {
        vi.useFakeTimers();
        const { button, ctx, context } = createButton();
        button.onPointerEnter$.emitEvent({ buttons: 0 } as never);
        vi.advanceTimersByTime(300);
        button.onPointerLeave$.emitEvent({} as never);
        vi.advanceTimersByTime(500);
        button.render(ctx);
        expect(context.fillText).not.toHaveBeenCalled();
        button.onPointerEnter$.emitEvent({ buttons: 0 } as never);
        vi.advanceTimersByTime(499);
        button.render(ctx);
        expect(context.fillText).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        button.render(ctx);
        expect(context.fillText).toHaveBeenCalledOnce();
        button.resetHover();
        context.fillText.mockClear();
        button.render(ctx);
        expect(context.fillText).not.toHaveBeenCalled();
        button.onPointerEnter$.emitEvent({ buttons: 0 } as never);
        expect(vi.getTimerCount()).toBe(1);
        button.dispose();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('does not activate after dragging away or using the secondary button', () => {
        const { button, activate } = createButton();
        const preventDefault = vi.fn();
        button.onPointerDown$.emitEvent({ button: 0, preventDefault } as never);
        button.onPointerLeave$.emitEvent({} as never);
        button.onPointerUp$.emitEvent({ button: 0, preventDefault } as never);
        button.onPointerDown$.emitEvent({ button: 2, preventDefault } as never);
        button.onPointerUp$.emitEvent({ button: 2, preventDefault } as never);
        expect(activate).not.toHaveBeenCalled();
        button.onPointerDown$.emitEvent({ button: 0, preventDefault } as never);
        button.onPointerUp$.emitEvent({ button: 0, preventDefault } as never);
        expect(activate).toHaveBeenCalledOnce();
        button.dispose();
    });
});
