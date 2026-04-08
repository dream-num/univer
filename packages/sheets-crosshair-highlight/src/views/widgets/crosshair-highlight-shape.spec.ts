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

import { Rect } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { SheetCrossHairHighlightShape } from './crosshair-highlight-shape';

describe('SheetCrossHairHighlightShape', () => {
    it('should set shape props and draw rectangle with rgba color', () => {
        const drawKey = '_draw';
        const drawSpy = vi.spyOn(Rect, 'drawWith').mockImplementation(() => undefined);
        const emptyShape = new SheetCrossHairHighlightShape('shape-empty');
        emptyShape.setShapeProps({
            color: { r: 7, g: 8, b: 9 },
            width: 1,
            height: 1,
        });
        (emptyShape as unknown as Record<string, (ctx: unknown) => void>)[drawKey]({} as never);

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
        (shape as unknown as Record<string, (ctx: unknown) => void>)[drawKey]({} as never);

        expect(drawSpy).toHaveBeenCalledWith(
            {} as never,
            expect.objectContaining({
                width: shape.width,
                height: shape.height,
                fill: 'rgba(1, 2, 3, 0.4)',
                strokeWidth: 0,
            })
        );
        expect(drawSpy).toHaveBeenCalledWith(
            {} as never,
            expect.objectContaining({
                fill: 'rgba(7, 8, 9, 0.5)',
            })
        );
    });
});
