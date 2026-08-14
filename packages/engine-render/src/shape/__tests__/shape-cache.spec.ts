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

import type { IBoundRectNoAngle } from '../../basics/vector2';
import type { UniverRenderingContext } from '../../context';
import { describe, expect, it } from 'vitest';
import { Canvas } from '../../canvas';
import { Shape } from '../shape';

class CachedShape extends Shape<Record<never, never>> {
    drawCount = 0;

    drawCached(ctx: UniverRenderingContext, bounds: IBoundRectNoAngle): void {
        this._renderWithCache(ctx, bounds, (cacheContext) => {
            this.drawCount += 1;
            cacheContext.fillRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
        });
        this.makeDirty(false);
    }
}

describe('Shape render cache', () => {
    it('reuses the cached bitmap until its local bounds change', () => {
        const mainCanvas = new Canvas({ width: 200, height: 100, pixelRatio: 1 });
        const shape = new CachedShape('cached-shape');
        const context = mainCanvas.getContext();

        shape.drawCached(context, { left: -10, top: -10, right: 110, bottom: 60 });
        shape.drawCached(context, { left: -10, top: -10, right: 110, bottom: 60 });
        expect(shape.drawCount).toBe(1);

        context.setTransform(0.5, 0, 0, 0.5, 0, 0);
        shape.drawCached(context, { left: -10, top: -10, right: 110, bottom: 60 });
        expect(shape.drawCount).toBe(2);

        shape.drawCached(context, { left: -10, top: -10, right: 120, bottom: 60 });
        expect(shape.drawCount).toBe(3);

        shape.dispose();
        mainCanvas.dispose();
    });

    it('keeps the cached bitmap across drag translation but invalidates it for resize', () => {
        const mainCanvas = new Canvas({ width: 200, height: 100, pixelRatio: 1 });
        const shape = new CachedShape('translated-cached-shape', { width: 100, height: 50 });
        const context = mainCanvas.getContext();
        const bounds = { left: -10, top: -10, right: 110, bottom: 60 };

        shape.drawCached(context, bounds);
        shape.translate(24, 18);
        shape.drawCached(context, bounds);
        expect(shape.drawCount).toBe(1);

        shape.transformByState({ left: 30, top: 20, width: 100, height: 50 });
        shape.drawCached(context, bounds);
        expect(shape.drawCount).toBe(1);

        shape.transformByState({ width: 120 });
        shape.drawCached(context, bounds);
        expect(shape.drawCount).toBe(2);

        shape.dispose();
        mainCanvas.dispose();
    });
});
