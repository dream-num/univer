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

import { Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { SheetFindReplaceHighlightShape } from '../find-replace-highlight.shape';

class TestCanvasContext {
    fillStyle = '';
    strokeStyle = '';
    lineWidth = 0;
    lineCap = '';
    lineDashOffset = 0;
    lineJoin = '';
    miterLimit = 0;
    fillCount = 0;
    strokeCount = 0;
    readonly rects: Array<{ left: number; top: number; width: number; height: number }> = [];

    save(): void {}

    restore(): void {}

    beginPath(): void {}

    closePath(): void {}

    setLineDash(): void {}

    rect(left: number, top: number, width: number, height: number): void {
        this.rects.push({ left, top, width, height });
    }

    fill(): void {
        this.fillCount += 1;
    }

    stroke(): void {
        this.strokeCount += 1;
    }
}

function drawShape(shape: SheetFindReplaceHighlightShape, context: TestCanvasContext): void {
    (shape as unknown as { _draw: (ctx: TestCanvasContext) => void })._draw(context);
}

function createViewTestBed() {
    const injector = new Injector();

    return {
        createHighlightShape(key: string, props: ConstructorParameters<typeof SheetFindReplaceHighlightShape>[1]) {
            return injector.createInstance(SheetFindReplaceHighlightShape, key, props);
        },
    };
}

describe('SheetFindReplaceHighlightShape', () => {
    it('draws a translucent search result highlight without a border by default', () => {
        const shape = new SheetFindReplaceHighlightShape('result', {
            inHiddenRange: false,
            color: { r: 1, g: 2, b: 3 },
            width: 10,
            height: 20,
        });
        const context = new TestCanvasContext();

        drawShape(shape, context);

        expect(context.rects).toEqual([{ left: 0, top: 0, width: 10, height: 20 }]);
        expect(context.fillStyle).toBe('rgba(1, 2, 3, 0.35)');
        expect(context.fillCount).toBe(1);
        expect(context.strokeCount).toBe(0);
    });

    it('draws the current search result with a solid two-pixel border', () => {
        const shape = new SheetFindReplaceHighlightShape('active-result', {
            inHiddenRange: false,
            color: { r: 4, g: 5, b: 6 },
            width: 10,
            height: 20,
        });
        shape.setShapeProps({
            activated: true,
            width: 30,
            height: 40,
        });
        const context = new TestCanvasContext();

        drawShape(shape, context);

        expect(context.rects).toEqual([{ left: 0, top: 0, width: 30, height: 40 }]);
        expect(context.fillStyle).toBe('rgba(4, 5, 6, 0.35)');
        expect(context.strokeStyle).toBe('rgb(4, 5, 6)');
        expect(context.lineWidth).toBe(2);
        expect(context.strokeCount).toBe(1);
    });

    it('removes the current result border after the shape is deactivated', () => {
        const shape = new SheetFindReplaceHighlightShape('active-result', {
            inHiddenRange: false,
            color: { r: 7, g: 8, b: 9 },
            activated: true,
            width: 10,
            height: 20,
        });
        const activeContext = new TestCanvasContext();

        drawShape(shape, activeContext);

        expect(activeContext.strokeStyle).toBe('rgb(7, 8, 9)');
        expect(activeContext.strokeCount).toBe(1);

        shape.setShapeProps({
            activated: false,
            width: 10,
            height: 20,
        });
        const inactiveContext = new TestCanvasContext();

        drawShape(shape, inactiveContext);

        expect(inactiveContext.fillStyle).toBe('rgba(7, 8, 9, 0.35)');
        expect(inactiveContext.lineWidth).toBe(0);
        expect(inactiveContext.strokeCount).toBe(0);
    });

    it('redraws refreshed search results with the latest bounds and color', () => {
        const shape = new SheetFindReplaceHighlightShape('refreshed-result', {
            inHiddenRange: false,
            color: { r: 10, g: 20, b: 30 },
            activated: true,
            width: 12,
            height: 24,
        });

        shape.setShapeProps({
            color: { r: 40, g: 50, b: 60 },
            activated: true,
            width: 36,
            height: 48,
        });
        const context = new TestCanvasContext();

        drawShape(shape, context);

        expect(context.rects).toEqual([{ left: 0, top: 0, width: 36, height: 48 }]);
        expect(context.fillStyle).toBe('rgba(40, 50, 60, 0.35)');
        expect(context.strokeStyle).toBe('rgb(40, 50, 60)');
        expect(context.lineWidth).toBe(2);
        expect(context.fillCount).toBe(1);
        expect(context.strokeCount).toBe(1);
    });

    it('marks the current match in a hidden range with a compact active highlight', () => {
        const shape = new SheetFindReplaceHighlightShape('hidden-current-result', {
            inHiddenRange: true,
            color: { r: 70, g: 80, b: 90 },
            activated: true,
            width: 2,
            height: 2,
        });
        const context = new TestCanvasContext();

        drawShape(shape, context);

        expect(context.rects).toEqual([{ left: 0, top: 0, width: 2, height: 2 }]);
        expect(context.fillStyle).toBe('rgba(70, 80, 90, 0.35)');
        expect(context.strokeStyle).toBe('rgb(70, 80, 90)');
        expect(context.lineWidth).toBe(2);
        expect(context.fillCount).toBe(1);
        expect(context.strokeCount).toBe(1);
    });

    it('keeps a hidden non-current match compact without drawing an active border', () => {
        const shape = new SheetFindReplaceHighlightShape('hidden-result', {
            inHiddenRange: true,
            color: { r: 90, g: 100, b: 110 },
            activated: false,
            width: 2,
            height: 2,
        });
        const context = new TestCanvasContext();

        drawShape(shape, context);

        expect(context.rects).toEqual([{ left: 0, top: 0, width: 2, height: 2 }]);
        expect(context.fillStyle).toBe('rgba(90, 100, 110, 0.35)');
        expect(context.lineWidth).toBe(0);
        expect(context.fillCount).toBe(1);
        expect(context.strokeCount).toBe(0);
    });

    it('activates an existing hidden-range highlight without changing its compact marker', () => {
        const shape = new SheetFindReplaceHighlightShape('hidden-result-to-activate', {
            inHiddenRange: true,
            color: { r: 120, g: 130, b: 140 },
            activated: false,
            width: 2,
            height: 2,
        });

        shape.setShapeProps({ activated: true });
        const context = new TestCanvasContext();

        drawShape(shape, context);

        expect(context.rects).toEqual([{ left: 0, top: 0, width: 2, height: 2 }]);
        expect(context.fillStyle).toBe('rgba(120, 130, 140, 0.35)');
        expect(context.strokeStyle).toBe('rgb(120, 130, 140)');
        expect(context.lineWidth).toBe(2);
        expect(context.fillCount).toBe(1);
        expect(context.strokeCount).toBe(1);
    });

    it('moves the current-match border between result highlights while preserving both fills', () => {
        const previousCurrent = new SheetFindReplaceHighlightShape('previous-current-result', {
            inHiddenRange: false,
            color: { r: 12, g: 34, b: 56 },
            activated: true,
            width: 18,
            height: 22,
        });
        const nextCurrent = new SheetFindReplaceHighlightShape('next-current-result', {
            inHiddenRange: false,
            color: { r: 78, g: 90, b: 123 },
            activated: false,
            width: 24,
            height: 28,
        });

        previousCurrent.setShapeProps({ activated: false });
        nextCurrent.setShapeProps({ activated: true });

        const previousContext = new TestCanvasContext();
        const nextContext = new TestCanvasContext();

        drawShape(previousCurrent, previousContext);
        drawShape(nextCurrent, nextContext);

        expect(previousContext.rects).toEqual([{ left: 0, top: 0, width: 18, height: 22 }]);
        expect(previousContext.fillStyle).toBe('rgba(12, 34, 56, 0.35)');
        expect(previousContext.lineWidth).toBe(0);
        expect(previousContext.fillCount).toBe(1);
        expect(previousContext.strokeCount).toBe(0);
        expect(nextContext.rects).toEqual([{ left: 0, top: 0, width: 24, height: 28 }]);
        expect(nextContext.fillStyle).toBe('rgba(78, 90, 123, 0.35)');
        expect(nextContext.strokeStyle).toBe('rgb(78, 90, 123)');
        expect(nextContext.lineWidth).toBe(2);
        expect(nextContext.fillCount).toBe(1);
        expect(nextContext.strokeCount).toBe(1);
    });

    it('creates search highlights as passive overlays above the sheet content', () => {
        const testBed = createViewTestBed();
        const shape = testBed.createHighlightShape('visible-result-overlay', {
            left: 32,
            top: 48,
            inHiddenRange: false,
            color: { r: 230, g: 180, b: 40 },
            width: 96,
            height: 24,
            evented: false,
            zIndex: 10000,
        });

        expect(shape.evented).toBe(false);
        expect(shape.zIndex).toBe(10000);
        expect(shape.left).toBe(32);
        expect(shape.top).toBe(48);
        expect(shape.width).toBe(96);
        expect(shape.height).toBe(24);
    });

    it('keeps a found cell anchored when navigation only toggles the active match state', () => {
        const testBed = createViewTestBed();
        const shape = testBed.createHighlightShape('anchored-result', {
            left: 120,
            top: 72,
            inHiddenRange: false,
            color: { r: 24, g: 144, b: 255 },
            width: 64,
            height: 22,
            evented: false,
            zIndex: 10000,
        });

        shape.setShapeProps({ activated: true });
        const context = new TestCanvasContext();

        drawShape(shape, context);

        expect(shape.left).toBe(120);
        expect(shape.top).toBe(72);
        expect(context.rects).toEqual([{ left: 0, top: 0, width: 64, height: 22 }]);
        expect(context.strokeStyle).toBe('rgb(24, 144, 255)');
        expect(context.lineWidth).toBe(2);
        expect(context.strokeCount).toBe(1);
    });
});
