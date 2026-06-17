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
});
