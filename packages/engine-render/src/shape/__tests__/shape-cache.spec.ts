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
import { describe, expect, it, vi } from 'vitest';
import type { IBoundRectNoAngle } from '../../basics/vector2';
import type { UniverRenderingContext } from '../../context';
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

function createTestInjector(key: string, props?: { width: number; height: number }) {
    return new Injector([
        [Canvas, {
            useFactory: (container: Injector) => container.createInstance(Canvas, { width: 200, height: 100, pixelRatio: 1 }),
            deps: [Injector],
        }],
        [CachedShape, {
            useFactory: (container: Injector) => container.createInstance(CachedShape, key, props),
            deps: [Injector],
        }],
    ]);
}

describe('Shape render cache', () => {
    it.each(Array.from({ length: 391 }, (_, index) => index + 10))('keeps native backing pixels and cache reuse at %s percent', (percent) => {
        const injector = createTestInjector('fractional-cache');
        const context = injector.get(Canvas).getContext();
        const blit = vi.spyOn(context, 'drawImage');
        try {
            const shape = injector.get(CachedShape);
            for (const dpr of [1, 2, 3]) {
                for (const scale of [percent / 100 * dpr, Math.fround(percent / 100 * dpr)]) {
                    context.setTransform(scale, 0, 0, scale, 0, 0);
                    const bounds = { left: 0, top: 0, right: 57 / scale, bottom: 12 / scale };
                    const previousDraws = shape.drawCount;
                    shape.makeDirtyNoDebounce(true);
                    shape.drawCached(context, bounds);
                    shape.drawCached(context, bounds);
                    expect(shape.drawCount, 'An unchanged native bitmap must not be repainted').toBe(previousDraws + 1);
                    const args = blit.mock.calls.at(-1)!;
                    const bitmap = args[0] as HTMLCanvasElement;
                    // A cache blit must keep the physical pixel count; a missing pixel would stretch its contents.
                    expect(bitmap.width).toBe(Math.round((args[3] as number) * scale));
                    expect(bitmap.height).toBe(Math.round((args[4] as number) * scale));
                }
            }
        } finally {
            blit.mockRestore();
            injector.dispose();
        }
    });

    it('reuses the cached bitmap until its local bounds change', () => {
        const injector = createTestInjector('cached-shape');
        try {
            const shape = injector.get(CachedShape);
            const context = injector.get(Canvas).getContext();

            shape.drawCached(context, { left: -10, top: -10, right: 110, bottom: 60 });
            shape.drawCached(context, { left: -10, top: -10, right: 110, bottom: 60 });
            expect(shape.drawCount).toBe(1);

            context.setTransform(0.5, 0, 0, 0.5, 0, 0);
            shape.drawCached(context, { left: -10, top: -10, right: 110, bottom: 60 });
            expect(shape.drawCount).toBe(2);

            shape.drawCached(context, { left: -10, top: -10, right: 120, bottom: 60 });
            expect(shape.drawCount).toBe(3);
        } finally {
            injector.dispose();
        }
    });

    it('keeps the cached bitmap across drag translation but invalidates it for resize', () => {
        const injector = createTestInjector('translated-cached-shape', { width: 100, height: 50 });
        try {
            const shape = injector.get(CachedShape);
            const context = injector.get(Canvas).getContext();
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
        } finally {
            injector.dispose();
        }
    });
});
