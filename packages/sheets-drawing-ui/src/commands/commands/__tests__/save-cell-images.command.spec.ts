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

import type { IDisposable, IRange } from '@univerjs/core';
import type { IBatchSaveImagesConfig, ICellImageInfo } from '../../../services/batch-save-images.service';
import { Disposable, ImageSourceType, toDisposable } from '@univerjs/core';
import { IDialogService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { IBatchSaveImagesService } from '../../../services/batch-save-images.service';
import { BATCH_SAVE_IMAGES_DIALOG_ID } from '../../../views/batch-save-images/component-name';
import { SaveCellImagesCommand } from '../save-cell-images.command';

class TestDialogService extends Disposable implements IDialogService {
    private _dialogs: any[] = [];
    private readonly _dialogs$ = new BehaviorSubject<any[]>([]);

    open(params: any): IDisposable {
        this._dialogs.push(params);
        this._dialogs$.next(this._dialogs);

        return toDisposable(() => this.close(params.id));
    }

    close(id: string): void {
        const dialogs = [];
        for (const dialog of this._dialogs) {
            if (dialog.id !== id) {
                dialogs.push(dialog);
            }
        }
        this._dialogs = dialogs;
        this._dialogs$.next(this._dialogs);
    }

    closeAll(expectIds?: string[]): void {
        if (!expectIds) {
            this._dialogs = [];
            this._dialogs$.next([]);
            return;
        }

        const dialogs = [];
        for (const dialog of this._dialogs) {
            if (expectIds.includes(dialog.id)) {
                dialogs.push(dialog);
            }
        }
        this._dialogs = dialogs;
        this._dialogs$.next(this._dialogs);
    }

    getDialogs$() {
        return this._dialogs$.asObservable();
    }

    get dialogs() {
        return this._dialogs;
    }

    override dispose(): void {
        super.dispose();
        this._dialogs$.complete();
        this._dialogs = [];
    }
}

class TestBatchSaveImagesService implements IBatchSaveImagesService {
    private _images: ICellImageInfo[] = [];
    private _downloaded: ICellImageInfo[] = [];
    private _downloadFails = false;

    setImages(images: ICellImageInfo[]): void {
        this._images = images;
    }

    failDownload(): void {
        this._downloadFails = true;
    }

    get downloaded(): ICellImageInfo[] {
        return this._downloaded;
    }

    getCellImagesInSelection(): ICellImageInfo[] {
        return this._images;
    }

    getCellImagesFromRanges(_unitId: string, _subUnitId: string, _ranges: IRange[]): ICellImageInfo[] {
        return this._images;
    }

    getDataColumns(): Array<{ index: number; label: string }> {
        return [];
    }

    getDataColumnsForRanges(): Array<{ index: number; label: string }> {
        return [];
    }

    getSelectionRangeNotation(): string {
        return 'A1:B2';
    }

    generateFileName(imageInfo: ICellImageInfo): string {
        return imageInfo.cellAddress;
    }

    generateFileNameWithContext(imageInfo: ICellImageInfo): string {
        return imageInfo.cellAddress;
    }

    async saveImages(_images: ICellImageInfo[], _config: IBatchSaveImagesConfig): Promise<void> {
        return undefined;
    }

    async saveImagesWithContext(_images: ICellImageInfo[], _config: IBatchSaveImagesConfig): Promise<void> {
        return undefined;
    }

    async downloadSingleImage(imageInfo: ICellImageInfo): Promise<void> {
        if (this._downloadFails) {
            throw new Error('download failed');
        }
        this._downloaded.push(imageInfo);
    }

    getSelectionRowRange(): { startRow: number; endRow: number } | null {
        return { startRow: 0, endRow: 1 };
    }

    getSelectionColumnIndices(): Set<number> {
        return new Set([0, 1]);
    }

    registerURLImageDownloader(): IDisposable {
        return toDisposable(() => undefined);
    }
}

function createImage(imageId: string, cellAddress: string): ICellImageInfo {
    return {
        row: 0,
        col: 0,
        cellAddress,
        imageId,
        source: `https://example.com/${imageId}.png`,
        imageSourceType: ImageSourceType.URL,
    };
}

describe('SaveCellImagesCommand', () => {
    afterEach(() => {
        // each test disposes its own univer instance
    });

    it('downloads a single selected cell image directly', async () => {
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [IDialogService, { useClass: TestDialogService }],
            [IBatchSaveImagesService, { useClass: TestBatchSaveImagesService }],
        ]);
        const batchSaveService = testBed.get(IBatchSaveImagesService) as TestBatchSaveImagesService;
        const dialogService = testBed.get(IDialogService) as unknown as TestDialogService;
        batchSaveService.setImages([createImage('image-1', 'A1')]);
        testBed.commandService.registerCommand(SaveCellImagesCommand);

        expect(await testBed.commandService.executeCommand(SaveCellImagesCommand.id)).toBe(true);
        expect(batchSaveService.downloaded).toEqual([expect.objectContaining({
            imageId: 'image-1',
            cellAddress: 'A1',
        })]);
        expect(dialogService.dialogs).toEqual([]);

        testBed.univer.dispose();
    });

    it('opens the batch save dialog for multiple selected images', async () => {
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [IDialogService, { useClass: TestDialogService }],
            [IBatchSaveImagesService, { useClass: TestBatchSaveImagesService }],
        ]);
        const batchSaveService = testBed.get(IBatchSaveImagesService) as TestBatchSaveImagesService;
        const dialogService = testBed.get(IDialogService) as unknown as TestDialogService;
        batchSaveService.setImages([
            createImage('image-2', 'A1'),
            createImage('image-3', 'B2'),
        ]);
        testBed.commandService.registerCommand(SaveCellImagesCommand);

        expect(await testBed.commandService.executeCommand(SaveCellImagesCommand.id)).toBe(true);
        expect(dialogService.dialogs).toEqual([expect.objectContaining({
            id: BATCH_SAVE_IMAGES_DIALOG_ID,
            title: { title: 'sheets-drawing-ui.save.title (A1:B2)' },
            children: { label: BATCH_SAVE_IMAGES_DIALOG_ID },
        })]);
        dialogService.dialogs[0].onClose();
        expect(dialogService.dialogs).toEqual([]);

        testBed.univer.dispose();
    });

    it('returns false when the single image download fails', async () => {
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [IDialogService, { useClass: TestDialogService }],
            [IBatchSaveImagesService, { useClass: TestBatchSaveImagesService }],
        ]);
        const batchSaveService = testBed.get(IBatchSaveImagesService) as TestBatchSaveImagesService;
        batchSaveService.setImages([createImage('image-4', 'C3')]);
        batchSaveService.failDownload();
        testBed.commandService.registerCommand(SaveCellImagesCommand);

        expect(await testBed.commandService.executeCommand(SaveCellImagesCommand.id)).toBe(false);
        expect(batchSaveService.downloaded).toEqual([]);

        testBed.univer.dispose();
    });
});
