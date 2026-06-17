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
import { SheetCrossHairHighlightShape } from './crosshair-highlight-shape';

class TestCanvasContext {
    fillStyle = '';
    readonly rects: Array<{ left: number; top: number; width: number; height: number }> = [];
    fillCount = 0;

    save(): void {}

    restore(): void {}

    beginPath(): void {}

    closePath(): void {}

    rect(left: number, top: number, width: number, height: number): void {
        this.rects.push({ left, top, width, height });
    }

    fill(): void {
        this.fillCount += 1;
    }
}

function drawShape(shape: SheetCrossHairHighlightShape, context: TestCanvasContext): void {
    (shape as unknown as { _draw: (ctx: TestCanvasContext) => void })._draw(context);
}

describe('SheetCrossHairHighlightShape', () => {
    it('draws the highlight rectangle with its configured rgba fill', () => {
        const shape = new SheetCrossHairHighlightShape('shape-1', {
            color: { r: 1, g: 2, b: 3, a: 0.4 },
            width: 20,
            height: 10,
            left: 0,
            top: 0,
            zIndex: 1,
            evented: false,
        });
        shape.setShapeProps({ width: 30, height: 15 });
        const context = new TestCanvasContext();

        drawShape(shape, context);

        expect(context.rects).toEqual([{ left: 0, top: 0, width: 30, height: 15 }]);
        expect(context.fillStyle).toBe('rgba(1, 2, 3, 0.4)');
        expect(context.fillCount).toBe(1);
    });

    it('uses the default half opacity when the color has no alpha channel', () => {
        const shape = new SheetCrossHairHighlightShape('shape-default-alpha');
        shape.setShapeProps({
            color: { r: 7, g: 8, b: 9 },
            width: 1,
            height: 1,
        });
        const context = new TestCanvasContext();

        drawShape(shape, context);

        expect(context.fillStyle).toBe('rgba(7, 8, 9, 0.5)');
    });
});
