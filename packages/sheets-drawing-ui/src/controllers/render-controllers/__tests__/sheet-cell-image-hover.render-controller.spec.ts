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

import { CURSOR_TYPE } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SheetCellImageHoverRenderController } from '../sheet-celll-image-hover.render-controller';

function createController(selectionPrimary: Record<string, unknown>) {
    const currentRichTextNoDistinct$ = new Subject<any>();
    const currentClickedCell$ = new Subject<any>();
    const scene = {
        setCursor: vi.fn(),
        resetCursor: vi.fn(),
    };
    const drawingRenderService = {
        previewImage: vi.fn(),
    };
    const controller = new SheetCellImageHoverRenderController(
        { unitId: 'unit-1', scene } as never,
        { currentRichTextNoDistinct$, currentClickedCell$ } as never,
        {
            getWorkbookSelections: vi.fn(() => ({
                getCurrentSelections: vi.fn(() => [{ primary: selectionPrimary }]),
            })),
        } as never,
        drawingRenderService as never,
        {
            getCurrentSkeleton: vi.fn(() => ({
                imageCacheMap: {
                    getImage: vi.fn(() => ({ src: 'blob:image', width: 120, height: 80 })),
                },
            })),
        } as never
    );

    return {
        controller,
        currentRichTextNoDistinct$,
        currentClickedCell$,
        scene,
        drawingRenderService,
    };
}

describe('SheetCellImageHoverRenderController', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('sets zoom cursor for a cell image in the active primary selection and resets it when leaving', () => {
        vi.useFakeTimers();
        const { controller, currentRichTextNoDistinct$, scene } = createController({
            actualRow: 2,
            actualColumn: 3,
            startRow: 2,
            endRow: 2,
            startColumn: 3,
            endColumn: 3,
            isMerged: false,
            isMergedMainCell: false,
        });

        currentRichTextNoDistinct$.next({ unitId: 'unit-1', row: 2, col: 3, drawing: { drawing: {} } });
        expect(scene.setCursor).toHaveBeenCalledWith(CURSOR_TYPE.ZOOM_IN);

        vi.advanceTimersByTime(34);
        currentRichTextNoDistinct$.next({ unitId: 'unit-1', row: 4, col: 4, drawing: { drawing: {} } });
        expect(scene.resetCursor).toHaveBeenCalled();

        controller.dispose();
    });

    it('previews a clicked cell image and clears cursor state', () => {
        const { controller, currentRichTextNoDistinct$, currentClickedCell$, scene, drawingRenderService } = createController({
            actualRow: 1,
            actualColumn: 1,
            startRow: 1,
            endRow: 3,
            startColumn: 1,
            endColumn: 3,
            isMerged: true,
            isMergedMainCell: false,
        });
        const drawingOrigin = {
            imageSourceType: 'BASE64',
            source: 'image-source',
        };

        currentRichTextNoDistinct$.next({ unitId: 'unit-1', row: 2, col: 2, drawing: { drawing: { drawingOrigin } } });
        currentClickedCell$.next({ drawing: { drawing: { drawingOrigin } } });

        expect(drawingRenderService.previewImage).toHaveBeenCalledWith('preview-cell-image', 'blob:image', 120, 80);
        expect(scene.resetCursor).toHaveBeenCalled();

        controller.dispose();
    });
});
