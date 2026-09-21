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

import { ImageSourceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { WorksheetBackgroundImageExtension } from '../worksheet-background-image.extension';

describe('WorksheetBackgroundImageExtension', () => {
    it('applies the imported Excel DPI scale to the repeated pattern', () => {
        const setTransform = vi.fn();
        const pattern = { setTransform };
        const context = {
            createPattern: vi.fn(() => pattern),
            save: vi.fn(),
            restore: vi.fn(),
            fillRect: vi.fn(),
            fillStyle: undefined,
        };
        const image = {
            complete: true,
            naturalWidth: 100,
            getAttribute: vi.fn(() => null),
        };
        const extension = new WorksheetBackgroundImageExtension({} as never, vi.fn());
        (extension as any)._imageCache = { getImage: vi.fn(() => image) };

        extension.draw(
            context as never,
            {} as never,
            {
                worksheet: {
                    getConfig: () => ({
                        backgroundImage: {
                            source: 'data:image/png;base64,background',
                            imageSourceType: ImageSourceType.BASE64,
                            scaleX: 0.8,
                            scaleY: 0.75,
                        },
                    }),
                },
                columnWidthAccumulation: [100],
                rowHeightAccumulation: [20],
            } as never,
            [{ startColumn: 0, endColumn: 0, startRow: 0, endRow: 0 }],
            { viewRanges: [] } as never
        );

        expect(setTransform).toHaveBeenCalledWith({ a: 0.8, d: 0.75 });
        expect(context.fillRect).toHaveBeenCalledWith(0, 0, 100, 20);
    });
});
