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

import type { ICellData, IWorkbookData } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { BooleanNumber, ImageSourceType, LocaleType } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { afterEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../__tests__/create-sheets-drawing-ui-test-bed';
import { BatchSaveImagesService, FileNamePart, IBatchSaveImagesService } from '../batch-save-images.service';

const WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: '',
    sheetOrder: ['sheet1'],
    styles: {},
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'Sheet1',
            rowCount: 20,
            columnCount: 20,
            cellData: {
                0: {
                    0: createImageCell('img-a1', 'data:image/png;base64,aGVsbG8=', ImageSourceType.BASE64),
                    3: { v: 'Report:Q1' },
                },
                1: {
                    0: { v: 'Client/Name' },
                    1: createImageCell('img-b2', 'https://cdn.example.com/photo.jpeg?version=1', ImageSourceType.URL),
                    3: { p: { body: { dataStream: 'Summary' } } as ICellData['p'] },
                },
            },
            hidden: BooleanNumber.FALSE,
        },
    },
};

function createImageCell(drawingId: string, source: string, imageSourceType: ImageSourceType): ICellData {
    return {
        p: {
            id: `${drawingId}-doc`,
            documentStyle: {},
            drawingsOrder: [drawingId],
            drawings: {
                [drawingId]: {
                    drawingId,
                    source,
                    imageSourceType,
                },
            },
        } as unknown as ICellData['p'],
    };
}

function createSelection(startRow: number, endRow: number, startColumn: number, endColumn: number): ISelectionWithStyle {
    return {
        range: {
            startRow,
            endRow,
            startColumn,
            endColumn,
        },
        primary: {
            actualRow: startRow,
            actualColumn: startColumn,
            startRow,
            endRow,
            startColumn,
            endColumn,
            isMerged: false,
            isMergedMainCell: false,
        },
        style: null,
    };
}

function setup() {
    const testBed = createSheetsDrawingUiTestBed(WORKBOOK_DATA, [
        [IBatchSaveImagesService, { useClass: BatchSaveImagesService }],
    ]);
    const service = testBed.get(IBatchSaveImagesService);
    const selectionsService = testBed.get(SheetsSelectionsService);
    selectionsService.setSelections([
        createSelection(0, 0, 0, 1),
        createSelection(1, 1, 1, 1),
    ]);

    return {
        ...testBed,
        service,
        selectionsService,
    };
}

describe('BatchSaveImagesService', () => {
    afterEach(() => {
        Reflect.deleteProperty(window, 'showDirectoryPicker');
    });

    it('collects images from the active selection and reports the selected address space', () => {
        const { service, univer } = setup();

        expect(service.getCellImagesInSelection()).toEqual([
            {
                row: 0,
                col: 0,
                cellAddress: 'A1',
                source: 'data:image/png;base64,aGVsbG8=',
                imageSourceType: ImageSourceType.BASE64,
                imageId: 'img-a1',
            },
            {
                row: 1,
                col: 1,
                cellAddress: 'B2',
                source: 'https://cdn.example.com/photo.jpeg?version=1',
                imageSourceType: ImageSourceType.URL,
                imageId: 'img-b2',
            },
        ]);
        expect(service.getCellImagesFromRanges('test', 'sheet1', [
            { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
        ])).toEqual([
            {
                row: 0,
                col: 0,
                cellAddress: 'A1',
                source: 'data:image/png;base64,aGVsbG8=',
                imageSourceType: ImageSourceType.BASE64,
                imageId: 'img-a1',
            },
            {
                row: 1,
                col: 1,
                cellAddress: 'B2',
                source: 'https://cdn.example.com/photo.jpeg?version=1',
                imageSourceType: ImageSourceType.URL,
                imageId: 'img-b2',
            },
        ]);
        expect(service.getSelectionRangeNotation()).toBe('A1:B1, B2');
        expect(service.getSelectionRowRange()).toEqual({ startRow: 0, endRow: 1 });
        expect(Array.from(service.getSelectionColumnIndices()).sort((a, b) => a - b)).toEqual([0, 1]);

        univer.dispose();
    });

    it('uses neighboring data columns to build spreadsheet-friendly image file names', () => {
        const { service, univer } = setup();
        const imageInfo = {
            row: 1,
            col: 1,
            cellAddress: 'B2',
            source: 'https://cdn.example.com/photo.jpeg?version=1',
            imageSourceType: ImageSourceType.URL,
            imageId: 'img-b2',
        };

        expect(service.getDataColumns()).toEqual([
            { index: 3, label: 'D' },
        ]);
        expect(service.getDataColumnsForRanges('test', 'sheet1', [
            { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
        ])).toEqual([
            { index: 3, label: 'D' },
        ]);
        expect(service.generateFileName(imageInfo, {
            fileNameParts: [FileNamePart.COLUMN_VALUE, FileNamePart.CELL_ADDRESS],
            columnIndex: 0,
        })).toBe('Client_Name_B2.jpeg');
        expect(service.generateFileNameWithContext(imageInfo, {
            fileNameParts: [FileNamePart.CELL_ADDRESS, FileNamePart.COLUMN_VALUE],
            columnIndex: 3,
        }, 'test', 'sheet1')).toBe('B2_Summary.jpeg');

        univer.dispose();
    });

    it('keeps every image when batch saving would otherwise produce duplicate file names', async () => {
        const { service, univer } = setup();
        const savedFiles: string[] = [];
        window.showDirectoryPicker = async () => ({
            getFileHandle: async (name: string) => {
                savedFiles.push(name);
                return {
                    createWritable: async () => ({
                        write: async () => undefined,
                        close: async () => undefined,
                    }),
                };
            },
        }) as unknown as FileSystemDirectoryHandle;

        await service.saveImages([
            {
                row: 0,
                col: 0,
                cellAddress: 'A1',
                source: 'data:image/png;base64,aGVsbG8=',
                imageSourceType: ImageSourceType.BASE64,
                imageId: 'img-a1',
            },
            {
                row: 0,
                col: 1,
                cellAddress: 'A1',
                source: 'data:image/png;base64,aGVsbG8=',
                imageSourceType: ImageSourceType.BASE64,
                imageId: 'img-a1-copy',
            },
        ], {
            fileNameParts: [FileNamePart.CELL_ADDRESS],
        });

        expect(savedFiles).toEqual(['A1.png', 'A1_1.png']);

        univer.dispose();
    });
});
