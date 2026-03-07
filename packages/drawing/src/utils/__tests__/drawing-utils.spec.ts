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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDrawingShapeKeyByDrawingSearch } from '../get-image-shape-key';
import { getImageSize } from '../get-image-size';

class MockImage {
    width = 320;
    height = 180;
    onload: null | (() => void) = null;
    onerror: null | ((error?: unknown) => void) = null;

    private _src = '';

    get src() {
        return this._src;
    }

    set src(value: string) {
        this._src = value;

        queueMicrotask(() => {
            if (value === 'bad-image') {
                this.onerror?.(new Error('load failed'));
                return;
            }

            this.onload?.();
        });
    }
}

describe('drawing utils', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should generate a drawing shape key with or without index', () => {
        expect(getDrawingShapeKeyByDrawingSearch({ unitId: 'u', subUnitId: 's', drawingId: 'd' })).toBe('u#-#s#-#d');
        expect(getDrawingShapeKeyByDrawingSearch({ unitId: 'u', subUnitId: 's', drawingId: 'd' }, 2)).toBe('u#-#s#-#d#-#2');
    });

    it('should resolve image size from the loaded image element', async () => {
        vi.stubGlobal('Image', MockImage);

        await expect(getImageSize('good-image')).resolves.toMatchObject({
            width: 320,
            height: 180,
            image: expect.objectContaining({ src: 'good-image' }),
        });
    });

    it('should reject when image loading fails', async () => {
        vi.stubGlobal('Image', MockImage);

        await expect(getImageSize('bad-image')).rejects.toEqual(new Error('load failed'));
    });
});
