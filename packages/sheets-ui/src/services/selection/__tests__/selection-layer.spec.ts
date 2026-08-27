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

import type { ILayerRenderOptions, UniverRenderingContext } from '@univerjs/engine-render';
import { Layer } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { SelectionLayer } from '../selection-layer';

describe('SelectionLayer', () => {
    it('forwards incremental render options to the base layer', () => {
        const next = vi.fn();
        const scene = {
            getEngine: () => ({
                renderFrameTimeMetric$: { next },
            }),
        };
        const ctx = {} as UniverRenderingContext;
        const options: ILayerRenderOptions = {
            dirtyBounds: [{ left: 0, top: 0, right: 100, bottom: 24 }],
            preserveCache: true,
            viewportInfos: new Map(),
        };
        const render = vi.spyOn(Layer.prototype, 'render').mockReturnThis();
        const layer = new SelectionLayer(scene as never);

        expect(layer.render(ctx, false, options)).toBe(layer);
        expect(render).toHaveBeenCalledWith(ctx, false, options);
        expect(next).toHaveBeenCalledWith(['selectionLayer', expect.any(Number)]);
    });
});
