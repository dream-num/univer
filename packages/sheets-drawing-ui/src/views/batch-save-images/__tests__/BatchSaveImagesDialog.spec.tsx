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
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { Root } from 'react-dom/client';
import type { IBatchSaveImagesConfig, ICellImageInfo } from '../../../services/batch-save-images.service';
import { Disposable, ImageSourceType, toDisposable } from '@univerjs/core';
import { IMarkSelectionService } from '@univerjs/sheets-ui';
import { IDialogService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { FileNamePart, IBatchSaveImagesService } from '../../../services/batch-save-images.service';
import { BatchSaveImagesDialog } from '../BatchSaveImagesDialog';
import { BATCH_SAVE_IMAGES_DIALOG_ID } from '../component-name';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestDialogService extends Disposable implements IDialogService {
    private readonly _closedIds: string[] = [];
    private readonly _dialogs$ = new BehaviorSubject<any[]>([]);

    open(): IDisposable {
        return toDisposable(() => undefined);
    }

    close(id: string): void {
        this._closedIds.push(id);
    }

    closeAll(): void {
        this._closedIds.push('*');
    }

    getDialogs$() {
        return this._dialogs$.asObservable();
    }

    get closedIds(): string[] {
        return this._closedIds;
    }

    override dispose(): void {
        super.dispose();
        this._dialogs$.complete();
    }
}

class TestMarkSelectionService implements IMarkSelectionService {
    private _nextId = 1;
    private readonly _shapeMap = new Map<string, ISelectionWithStyle>();
    private readonly _addedRanges: IRange[] = [];
    private readonly _removedIds: string[] = [];

    addShape(selection: ISelectionWithStyle): string {
        const id = `shape-${this._nextId++}`;
        this._shapeMap.set(id, selection);
        this._addedRanges.push(selection.range);
        return id;
    }

    addShapeWithNoFresh(selection: ISelectionWithStyle): string {
        return this.addShape(selection);
    }

    removeShape(id: string): void {
        this._shapeMap.delete(id);
        this._removedIds.push(id);
    }

    removeAllShapes(): void {
        this._shapeMap.clear();
    }

    refreshShapes(): void {
        return undefined;
    }

    getShapeMap(): ReturnType<IMarkSelectionService['getShapeMap']> {
        return this._shapeMap as unknown as ReturnType<IMarkSelectionService['getShapeMap']>;
    }

    get addedRanges(): IRange[] {
        return this._addedRanges;
    }

    get activeRanges(): IRange[] {
        return Array.from(this._shapeMap.values()).map((selection) => selection.range);
    }

    get removedIds(): string[] {
        return this._removedIds;
    }
}

class TestBatchSaveImagesService implements IBatchSaveImagesService {
    private readonly _images = [
        createImage('image-a', 'B3', 2, 1),
        createImage('image-b', 'B4', 3, 1),
    ];

    private readonly _dataColumns = [
        { index: 4, label: 'Name' },
        { index: 6, label: 'SKU' },
    ];

    private _failSaving = false;
    private _savedImages: ICellImageInfo[] = [];
    private _savedConfig: IBatchSaveImagesConfig | null = null;

    failSaving(): void {
        this._failSaving = true;
    }

    get savedImages(): ICellImageInfo[] {
        return this._savedImages;
    }

    get savedConfig(): IBatchSaveImagesConfig | null {
        return this._savedConfig;
    }

    getCellImagesInSelection(): ICellImageInfo[] {
        return this._images;
    }

    getCellImagesFromRanges(): ICellImageInfo[] {
        return this._images;
    }

    getDataColumns(): Array<{ index: number; label: string }> {
        return this._dataColumns;
    }

    getDataColumnsForRanges(): Array<{ index: number; label: string }> {
        return this._dataColumns;
    }

    getSelectionRangeNotation(): string {
        return 'B3:B4';
    }

    generateFileName(imageInfo: ICellImageInfo): string {
        return imageInfo.cellAddress;
    }

    generateFileNameWithContext(imageInfo: ICellImageInfo): string {
        return imageInfo.cellAddress;
    }

    async saveImages(images: ICellImageInfo[], config: IBatchSaveImagesConfig): Promise<void> {
        if (this._failSaving) {
            throw new Error('save failed');
        }

        this._savedImages = images;
        this._savedConfig = config;
    }

    async saveImagesWithContext(images: ICellImageInfo[], config: IBatchSaveImagesConfig): Promise<void> {
        await this.saveImages(images, config);
    }

    async downloadSingleImage(): Promise<void> {
        return undefined;
    }

    getSelectionRowRange(): { startRow: number; endRow: number } {
        return { startRow: 2, endRow: 3 };
    }

    getSelectionColumnIndices(): Set<number> {
        return new Set([1]);
    }

    registerURLImageDownloader(): IDisposable {
        return toDisposable(() => undefined);
    }
}

class TestEmptyBatchSaveImagesService extends TestBatchSaveImagesService {
    override getCellImagesInSelection(): ICellImageInfo[] {
        return [];
    }

    override getCellImagesFromRanges(): ICellImageInfo[] {
        return [];
    }
}

class TestNoDataColumnsBatchSaveImagesService extends TestBatchSaveImagesService {
    override getDataColumns(): Array<{ index: number; label: string }> {
        return [];
    }

    override getDataColumnsForRanges(): Array<{ index: number; label: string }> {
        return [];
    }
}

function createImage(imageId: string, cellAddress: string, row: number, col: number): ICellImageInfo {
    return {
        row,
        col,
        cellAddress,
        imageId,
        source: `https://example.com/${imageId}.png`,
        imageSourceType: ImageSourceType.URL,
    };
}

function getButton(container: HTMLElement, text: string): HTMLButtonElement {
    const button = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === text);
    if (!button) {
        throw new Error(`Button ${text} was not rendered`);
    }

    return button;
}

function getCheckbox(container: HTMLElement, index: number): HTMLInputElement {
    const checkbox = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[index];
    if (!checkbox) {
        throw new Error(`Checkbox ${index} was not rendered`);
    }

    return checkbox;
}

function openSelect(select: HTMLElement): void {
    select.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
}

describe('BatchSaveImagesDialog', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        root = undefined;
        container = undefined;
    });

    async function renderDialog(batchSaveImagesService = TestBatchSaveImagesService) {
        const testBed = createSheetsDrawingUiTestBed(undefined, [
            [IDialogService, { useClass: TestDialogService }],
            [IMarkSelectionService, { useClass: TestMarkSelectionService }],
            [IBatchSaveImagesService, { useClass: batchSaveImagesService }],
        ]);

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: testBed.injector }}>
                    <BatchSaveImagesDialog />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        return {
            testBed,
            batchSaveService: testBed.get(IBatchSaveImagesService) as TestBatchSaveImagesService,
            dialogService: testBed.get(IDialogService) as unknown as TestDialogService,
            markSelectionService: testBed.get(IMarkSelectionService) as TestMarkSelectionService,
        };
    }

    it('saves selected images with the chosen column value in file names', async () => {
        const { testBed, batchSaveService, dialogService, markSelectionService } = await renderDialog();
        const columnValueCheckbox = getCheckbox(container!, 1);

        await act(async () => {
            columnValueCheckbox.click();
            await Promise.resolve();
        });

        expect(markSelectionService.activeRanges).toEqual([{
            startRow: 2,
            endRow: 3,
            startColumn: 4,
            endColumn: 4,
        }]);

        await act(async () => {
            openSelect(container!.querySelector<HTMLElement>('[data-u-comp="select"]')!);
            await Promise.resolve();
        });

        const skuOption = Array.from(document.body.querySelectorAll<HTMLElement>('[data-slot="dropdown-menu-radio-item"]'))
            .find((item) => item.textContent === 'SKU');
        if (!skuOption) {
            throw new Error('SKU column option was not rendered');
        }

        await act(async () => {
            skuOption.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(markSelectionService.activeRanges).toEqual([{
            startRow: 2,
            endRow: 3,
            startColumn: 6,
            endColumn: 6,
        }]);
        expect(markSelectionService.removedIds).toEqual(['shape-1']);

        await act(async () => {
            getButton(container!, 'sheets-drawing-ui.save.confirm').click();
            await Promise.resolve();
        });

        expect(batchSaveService.savedImages.map((image) => image.imageId)).toEqual(['image-a', 'image-b']);
        expect(batchSaveService.savedConfig).toEqual({
            fileNameParts: [FileNamePart.CELL_ADDRESS, FileNamePart.COLUMN_VALUE],
            columnIndex: 6,
        });
        expect(dialogService.closedIds).toEqual([BATCH_SAVE_IMAGES_DIALOG_ID]);

        testBed.univer.dispose();
    });

    it('removes the highlighted lookup column when column values are no longer used in file names', async () => {
        const { testBed, batchSaveService, dialogService, markSelectionService } = await renderDialog();
        const columnValueCheckbox = getCheckbox(container!, 1);

        await act(async () => {
            columnValueCheckbox.click();
            await Promise.resolve();
        });

        expect(markSelectionService.activeRanges).toEqual([{
            startRow: 2,
            endRow: 3,
            startColumn: 4,
            endColumn: 4,
        }]);

        await act(async () => {
            columnValueCheckbox.click();
            await Promise.resolve();
        });

        expect(markSelectionService.activeRanges).toEqual([]);
        expect(markSelectionService.removedIds).toEqual(['shape-1']);

        await act(async () => {
            getButton(container!, 'sheets-drawing-ui.save.confirm').click();
            await Promise.resolve();
        });

        expect(batchSaveService.savedImages.map((image) => image.imageId)).toEqual(['image-a', 'image-b']);
        expect(batchSaveService.savedConfig).toEqual({
            fileNameParts: [FileNamePart.CELL_ADDRESS],
            columnIndex: undefined,
        });
        expect(dialogService.closedIds).toEqual([BATCH_SAVE_IMAGES_DIALOG_ID]);

        testBed.univer.dispose();
    });

    it('keeps cell address naming when the user tries to clear the last file name option', async () => {
        const { testBed, batchSaveService, dialogService, markSelectionService } = await renderDialog();
        const cellAddressCheckbox = getCheckbox(container!, 0);

        await act(async () => {
            cellAddressCheckbox.click();
            await Promise.resolve();
        });

        expect(markSelectionService.activeRanges).toEqual([]);

        await act(async () => {
            getButton(container!, 'sheets-drawing-ui.save.confirm').click();
            await Promise.resolve();
        });

        expect(batchSaveService.savedImages.map((image) => image.imageId)).toEqual(['image-a', 'image-b']);
        expect(batchSaveService.savedConfig).toEqual({
            fileNameParts: [FileNamePart.CELL_ADDRESS],
            columnIndex: undefined,
        });
        expect(dialogService.closedIds).toEqual([BATCH_SAVE_IMAGES_DIALOG_ID]);

        testBed.univer.dispose();
    });

    it('clears lookup column highlight without saving when the dialog is cancelled', async () => {
        const { testBed, batchSaveService, dialogService, markSelectionService } = await renderDialog();
        const columnValueCheckbox = getCheckbox(container!, 1);

        await act(async () => {
            columnValueCheckbox.click();
            await Promise.resolve();
        });

        expect(markSelectionService.activeRanges).toEqual([{
            startRow: 2,
            endRow: 3,
            startColumn: 4,
            endColumn: 4,
        }]);

        await act(async () => {
            getButton(container!, 'sheets-drawing-ui.save.cancel').click();
            await Promise.resolve();
        });

        expect(batchSaveService.savedConfig).toBeNull();
        expect(dialogService.closedIds).toEqual([BATCH_SAVE_IMAGES_DIALOG_ID]);

        await act(async () => {
            root!.unmount();
            root = undefined;
            await Promise.resolve();
        });

        expect(markSelectionService.activeRanges).toEqual([]);
        expect(markSelectionService.removedIds).toEqual(['shape-1']);

        testBed.univer.dispose();
    });

    it('keeps the dialog open and shows the save error when saving fails', async () => {
        const { testBed, batchSaveService, dialogService } = await renderDialog();
        batchSaveService.failSaving();

        await act(async () => {
            getButton(container!, 'sheets-drawing-ui.save.confirm').click();
            await Promise.resolve();
        });

        expect(batchSaveService.savedConfig).toBeNull();
        expect(dialogService.closedIds).toEqual([]);
        expect(container!.textContent).toContain('sheets-drawing-ui.save.error');

        testBed.univer.dispose();
    });

    it('saves by cell address when no lookup columns are available', async () => {
        const { testBed, batchSaveService, dialogService, markSelectionService } = await renderDialog(TestNoDataColumnsBatchSaveImagesService);

        expect(container!.querySelector('[data-u-comp="select"]')).toBeNull();
        expect(container!.textContent).not.toContain('sheets-drawing-ui.save.useColumnValue');
        expect(markSelectionService.activeRanges).toEqual([]);

        await act(async () => {
            getButton(container!, 'sheets-drawing-ui.save.confirm').click();
            await Promise.resolve();
        });

        expect(batchSaveService.savedImages.map((image) => image.imageId)).toEqual(['image-a', 'image-b']);
        expect(batchSaveService.savedConfig).toEqual({
            fileNameParts: [FileNamePart.CELL_ADDRESS],
            columnIndex: undefined,
        });
        expect(dialogService.closedIds).toEqual([BATCH_SAVE_IMAGES_DIALOG_ID]);

        testBed.univer.dispose();
    });

    it('prevents confirming when the selection contains no images', async () => {
        const { testBed, batchSaveService, dialogService, markSelectionService } = await renderDialog(TestEmptyBatchSaveImagesService);
        const confirmButton = getButton(container!, 'sheets-drawing-ui.save.confirm');

        expect(confirmButton.disabled).toBe(true);

        await act(async () => {
            confirmButton.click();
            await Promise.resolve();
        });

        expect(batchSaveService.savedConfig).toBeNull();
        expect(dialogService.closedIds).toEqual([]);
        expect(markSelectionService.activeRanges).toEqual([]);

        testBed.univer.dispose();
    });
});
