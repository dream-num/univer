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

import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { FileNamePart, IBatchSaveImagesService, SheetDrawingUpdateController } from '@univerjs/sheets-drawing-ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FRangeSheetsDrawingUIMixin } from '../f-range';

function createRangeMixin() {
    const controller = {
        insertCellImageByUrl: vi.fn(async () => true),
        insertCellImageByFile: vi.fn(async () => true),
    };
    const batchSaveService: any = {
        getCellImagesFromRanges: vi.fn(() => []),
        downloadSingleImage: vi.fn(async () => {}),
        saveImagesWithContext: vi.fn(async () => {}),
    };

    const mixin: any = Object.create(FRangeSheetsDrawingUIMixin.prototype);
    mixin._injector = {
        get: (token: unknown) => {
            if (token === IRenderManagerService) {
                return {
                    getRenderUnitById: () => ({
                        with: <T>(request: T) => request === SheetDrawingUpdateController ? (controller as T) : (null as T),
                    }),
                };
            }

            if (token === IUniverInstanceService) {
                return {
                    getCurrentUnitOfType: (type: UniverInstanceType) => type === UniverInstanceType.UNIVER_SHEET
                        ? { getUnitId: () => 'book-1' }
                        : null,
                };
            }

            if (token === IBatchSaveImagesService) {
                return batchSaveService;
            }

            throw new Error(`Unknown dependency ${String(token)}`);
        },
    };
    mixin._workbook = { getUnitId: () => 'book-1' };
    mixin._worksheet = { getSheetId: () => 'sheet-1' };
    mixin.getRow = () => 4;
    mixin.getColumn = () => 2;
    mixin.getRange = () => ({
        startRow: 4,
        endRow: 4,
        startColumn: 2,
        endColumn: 2,
    });

    return { mixin: mixin as FRangeSheetsDrawingUIMixin & Record<string, any>, controller, batchSaveService };
}

describe('FRangeSheetsDrawingUIMixin', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('inserts a cell image from either a url or a file through the sheet drawing update controller', async () => {
        const { mixin, controller } = createRangeMixin();
        const file = new File(['image'], 'cell-image.png', { type: 'image/png' });

        expect(await mixin.insertCellImageAsync('https://example.com/image.png')).toBe(true);
        expect(await mixin.insertCellImageAsync(file)).toBe(true);

        expect(controller.insertCellImageByUrl).toHaveBeenCalledWith('https://example.com/image.png', {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            row: 4,
            col: 2,
        });
        expect(controller.insertCellImageByFile).toHaveBeenCalledWith(file, {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            row: 4,
            col: 2,
        });
    });

    it('returns false when there are no cell images to save', async () => {
        const { mixin, batchSaveService } = createRangeMixin();
        batchSaveService.getCellImagesFromRanges.mockReturnValue([]);

        expect(await mixin.saveCellImagesAsync()).toBe(false);
    });

    it('downloads a single image directly and saves multiple images with a derived file name config', async () => {
        const { mixin, batchSaveService } = createRangeMixin();
        batchSaveService.getCellImagesFromRanges
            .mockReturnValueOnce([{ cellAddress: 'C5' }])
            .mockReturnValueOnce([{ cellAddress: 'C5' }, { cellAddress: 'D6' }]);

        expect(await mixin.saveCellImagesAsync()).toBe(true);
        expect(batchSaveService.downloadSingleImage).toHaveBeenCalledWith({ cellAddress: 'C5' });

        expect(await mixin.saveCellImagesAsync({ useCellAddress: false, useColumnIndex: 3 })).toBe(true);
        expect(batchSaveService.saveImagesWithContext).toHaveBeenCalledWith(
            [{ cellAddress: 'C5' }, { cellAddress: 'D6' }],
            {
                fileNameParts: [FileNamePart.COLUMN_VALUE],
                columnIndex: 3,
            },
            'book-1',
            'sheet-1'
        );
    });

    it('falls back to cell addresses when all naming options are disabled and surfaces save failures as false', async () => {
        const { mixin, batchSaveService } = createRangeMixin();
        batchSaveService.getCellImagesFromRanges.mockReturnValue([{ cellAddress: 'C5' }, { cellAddress: 'D6' }]);
        batchSaveService.saveImagesWithContext.mockRejectedValueOnce(new Error('save failed'));

        expect(await mixin.saveCellImagesAsync({ useCellAddress: false })).toBe(false);
        expect(batchSaveService.saveImagesWithContext).toHaveBeenCalledWith(
            [{ cellAddress: 'C5' }, { cellAddress: 'D6' }],
            {
                fileNameParts: [FileNamePart.CELL_ADDRESS],
                columnIndex: undefined,
            },
            'book-1',
            'sheet-1'
        );
    });
});
