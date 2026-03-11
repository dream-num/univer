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

import { DrawingTypeEnum, UniverInstanceType } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch, ImageSourceType } from '@univerjs/drawing';
import { describe, expect, it, vi } from 'vitest';
import { DrawingRenderService } from '../drawing-render.service';

vi.mock('@univerjs/drawing', async (importActual) => {
    const actual = await importActual<typeof import('@univerjs/drawing')>();
    return {
        ...actual,
        getDrawingShapeKeyByDrawingSearch: vi.fn(() => 'shape-key'),
    };
});

function createService(options?: { unitType?: UniverInstanceType; visible?: boolean; activeSheetId?: string }) {
    const drawingManagerService = {
        getDrawingVisible: vi.fn(() => options?.visible ?? true),
        getDrawingEditable: vi.fn(() => true),
        getDrawingOrder: vi.fn(() => ['drawing-1']),
    };
    const imageIoService = {
        getImageSourceCache: vi.fn(),
        getImage: vi.fn(),
        addImageSourceCache: vi.fn(),
    };
    const urlImageService = {
        getImage: vi.fn(),
    };
    const univerInstanceService = {
        getUnitType: vi.fn(() => options?.unitType ?? UniverInstanceType.UNIVER_DOC),
        getCurrentUnitOfType: vi.fn(() => ({
            getActiveSheet: vi.fn(() => ({ getSheetId: vi.fn(() => options?.activeSheetId ?? 'sheet-1') })),
        })),
    };
    const scene = {
        getObject: vi.fn(() => null),
        addObject: vi.fn(),
        attachTransformerTo: vi.fn(),
    };

    return {
        drawingManagerService,
        imageIoService,
        scene,
        service: new DrawingRenderService(
            drawingManagerService as never,
            imageIoService as never,
            {} as never,
            urlImageService as never,
            univerInstanceService as never
        ),
        univerInstanceService,
    };
}

const baseImageParam = {
    drawingType: DrawingTypeEnum.DRAWING_IMAGE,
    drawingId: 'drawing-1',
    unitId: 'book-1',
    subUnitId: 'sheet-1',
    source: 'image-source',
    imageSourceType: ImageSourceType.BASE64,
    transform: { left: 10, top: 20, width: 30, height: 40, angle: 0, flipX: false, flipY: false, skewX: 0, skewY: 0 },
};

describe('DrawingRenderService', () => {
    it('skips rendering when the drawing is not visible, not an image, on another sheet, or missing transform', async () => {
        const hiddenCase = createService({ visible: false });
        expect(await hiddenCase.service.renderImages(baseImageParam as never, hiddenCase.scene as never)).toBeUndefined();
        expect(hiddenCase.scene.getObject).not.toHaveBeenCalled();

        const nonImageCase = createService();
        expect(await nonImageCase.service.renderImages({ ...baseImageParam, drawingType: DrawingTypeEnum.DRAWING_SHAPE } as never, nonImageCase.scene as never)).toBeUndefined();
        expect(nonImageCase.scene.getObject).not.toHaveBeenCalled();

        const inactiveSheetCase = createService({ unitType: UniverInstanceType.UNIVER_SHEET, activeSheetId: 'sheet-2' });
        expect(await inactiveSheetCase.service.renderImages(baseImageParam as never, inactiveSheetCase.scene as never)).toBeUndefined();
        expect(inactiveSheetCase.scene.getObject).not.toHaveBeenCalled();

        const noTransformCase = createService();
        expect(await noTransformCase.service.renderImages({ ...baseImageParam, transform: null } as never, noTransformCase.scene as never)).toBeUndefined();
        expect(noTransformCase.scene.getObject).not.toHaveBeenCalled();
    });

    it('updates existing scene objects instead of recreating them', async () => {
        const { scene, service } = createService();
        const transformByState = vi.fn();
        scene.getObject.mockReturnValue({ transformByState } as never);

        const result = await service.renderImages(baseImageParam as never, scene as never);

        expect(vi.mocked(getDrawingShapeKeyByDrawingSearch)).toHaveBeenCalledWith({
            drawingId: 'drawing-1',
            unitId: 'book-1',
            subUnitId: 'sheet-1',
        }, undefined);
        expect(transformByState).toHaveBeenCalledWith({
            left: 10,
            top: 20,
            width: 30,
            height: 40,
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
        });
        expect(scene.addObject).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });
});
