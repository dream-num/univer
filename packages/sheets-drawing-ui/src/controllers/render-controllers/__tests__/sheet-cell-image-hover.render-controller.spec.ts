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

import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetCellImageHoverRenderController } from '../sheet-celll-image-hover.render-controller';

describe('SheetCellImageHoverRenderController', () => {
    it('previews a cell image when the clicked cell event already contains a drawing', () => {
        const currentRichTextNoDistinct$ = new Subject<unknown>();
        const currentClickedCell$ = new Subject<unknown>();
        const previewImage = vi.fn();
        const resetCursor = vi.fn();

        const image = {
            src: 'data:image/png;base64,test',
            width: 38,
            height: 38,
        };

        const controller = new SheetCellImageHoverRenderController(
            {
                unitId: 'unit-1',
                scene: {
                    setCursor: vi.fn(),
                    resetCursor,
                },
            } as never,
            {
                currentRichTextNoDistinct$,
                currentClickedCell$,
            } as never,
            {
                getWorkbookSelections: () => ({
                    getCurrentSelections: () => [],
                }),
            } as never,
            {
                previewImage,
            } as never,
            {
                getCurrentSkeleton: () => ({
                    imageCacheMap: {
                        getImage: () => image,
                    },
                }),
            } as never
        );

        currentClickedCell$.next({
            drawing: {
                drawing: {
                    drawingOrigin: {
                        imageSourceType: 'BASE64',
                        source: image.src,
                    },
                },
            },
        });

        expect(previewImage).toHaveBeenCalledWith('preview-cell-image', image.src, image.width, image.height);
        expect(resetCursor).toHaveBeenCalled();

        controller.dispose();
    });
});
