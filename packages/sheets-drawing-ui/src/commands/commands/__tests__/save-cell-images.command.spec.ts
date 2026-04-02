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

import { ICommandService, LocaleService, Univer } from '@univerjs/core';
import { IDialogService } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IBatchSaveImagesService } from '../../../services/batch-save-images.service';
import { BATCH_SAVE_IMAGES_DIALOG_ID } from '../../../views/batch-save-images/component-name';
import { SaveCellImagesCommand } from '../save-cell-images.command';

function createCommandBed(overrides?: {
    images?: Array<{ cellAddress: string }>;
    downloadSingleImage?: ReturnType<typeof vi.fn>;
}) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const dialogService = {
        open: vi.fn(),
        close: vi.fn(),
    };
    const batchSaveService = {
        getCellImagesInSelection: vi.fn(() => overrides?.images ?? []),
        downloadSingleImage: overrides?.downloadSingleImage ?? vi.fn(async () => {}),
        getSelectionRangeNotation: vi.fn(() => 'A1:B2'),
    };
    injector.add([IDialogService, { useValue: dialogService as never }]);
    injector.add([IBatchSaveImagesService, { useValue: batchSaveService as never }]);

    const localeService = injector.get(LocaleService);
    vi.spyOn(localeService, 't').mockReturnValue('Save Images');

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(SaveCellImagesCommand);

    return { univer, commandService, dialogService, batchSaveService };
}

describe('SaveCellImagesCommand', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('downloads a single selected image directly', async () => {
        const testBed = createCommandBed({
            images: [{ cellAddress: 'A1' }],
        });

        expect(await testBed.commandService.executeCommand(SaveCellImagesCommand.id)).toBe(true);
        expect(testBed.batchSaveService.downloadSingleImage).toHaveBeenCalledWith({ cellAddress: 'A1' });
        expect(testBed.dialogService.open).not.toHaveBeenCalled();

        testBed.univer.dispose();
    });

    it('returns false when the direct download fails', async () => {
        const testBed = createCommandBed({
            images: [{ cellAddress: 'A1' }],
            downloadSingleImage: vi.fn(async () => {
                throw new Error('download failed');
            }),
        });

        expect(await testBed.commandService.executeCommand(SaveCellImagesCommand.id)).toBe(false);
        expect(testBed.dialogService.open).not.toHaveBeenCalled();

        testBed.univer.dispose();
    });

    it('opens the batch save dialog when multiple images are selected', async () => {
        const testBed = createCommandBed({
            images: [{ cellAddress: 'A1' }, { cellAddress: 'B2' }],
        });

        expect(await testBed.commandService.executeCommand(SaveCellImagesCommand.id)).toBe(true);
        expect(testBed.dialogService.open).toHaveBeenCalledWith(expect.objectContaining({
            id: BATCH_SAVE_IMAGES_DIALOG_ID,
            title: { title: 'Save Images (A1:B2)' },
        }));

        const dialogConfig = testBed.dialogService.open.mock.calls[0][0];
        dialogConfig.onClose();
        expect(testBed.dialogService.close).toHaveBeenCalledWith(BATCH_SAVE_IMAGES_DIALOG_ID);

        testBed.univer.dispose();
    });
});
