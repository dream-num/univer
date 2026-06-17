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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DrawingImageClipService } from '../drawing-image-clip.service';

describe('DrawingImageClipService', () => {
    let service: DrawingImageClipService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([DrawingImageClipService]);
        service = injector.get(DrawingImageClipService);
    });

    it('delegates image clipping to the registered shape engine', () => {
        const bounds = { left: 0, top: 0, width: 20, height: 10 };
        const delegate = vi.fn(() => bounds);
        const disposable = service.registerClipDelegate(delegate);

        expect(service.applyShapeClip({} as never, 'rect', 20, 10, { adj: 1 })).toBe(bounds);
        expect(delegate).toHaveBeenCalledWith({}, 'rect', 20, 10, { adj: 1 });

        disposable.dispose();
        expect(service.applyShapeClip({} as never, 'rect', 20, 10)).toBe(false);
    });

    it('publishes whether shape clipping is available in the current runtime', () => {
        const values: boolean[] = [];
        service.canUseShapeClip$.subscribe((value) => values.push(value));

        service.setCanUseShapeClip(true);

        expect(values).toEqual([false, true]);
    });

    it('clears registered clipping behavior when disposed', () => {
        const delegate = vi.fn(() => ({ left: 0, top: 0, width: 20, height: 10 }));
        service.registerClipDelegate(delegate);

        service.dispose();

        expect(service.applyShapeClip({} as never, 'rect', 20, 10)).toBe(false);
    });
});
