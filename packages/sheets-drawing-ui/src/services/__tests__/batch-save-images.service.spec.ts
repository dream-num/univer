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

import { ImageSourceType, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { BatchSaveImagesService, FileNamePart } from '../batch-save-images.service';

function createService() {
    const cells = new Map<string, unknown>([
        ['0:0', {
            p: {
                drawingsOrder: ['img-a1'],
                drawings: {
                    'img-a1': {
                        drawingId: 'img-a1',
                        source: 'data:image/png;base64,aaa',
                        imageSourceType: ImageSourceType.BASE64,
                    },
                },
            },
        }],
        ['1:1', {
            p: {
                drawingsOrder: ['img-b2'],
                drawings: {
                    'img-b2': {
                        drawingId: 'img-b2',
                        source: 'https://cdn.example.com/photo.jpeg?version=1',
                        imageSourceType: ImageSourceType.URL,
                    },
                },
            },
        }],
        ['0:3', { v: 'Report:Q1' }],
        ['1:0', { v: 'Client/Name' }],
        ['1:3', { p: { body: { dataStream: 'Summary' } } }],
    ]);

    const cellMatrix = {
        getValue: (row: number, col: number) => cells.get(`${row}:${col}`) as never,
        getDataRange: () => ({ startRow: 0, endRow: 2, startColumn: 0, endColumn: 3 }),
    };
    const worksheet = {
        getCellMatrix: () => cellMatrix,
    };
    const workbook = {
        getActiveSheet: () => worksheet,
        getSheetBySheetId: () => worksheet,
    };
    const selections = [
        { range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 } },
        { range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } },
    ];

    return new BatchSaveImagesService(
        {
            getCurrentUnitForType: (type: UniverInstanceType) => (type === UniverInstanceType.UNIVER_SHEET ? workbook : null),
            getUnit: () => workbook,
        } as never,
        {
            getCurrentSelections: () => selections,
        } as never,
        {} as never,
        {} as never
    );
}

describe('BatchSaveImagesService', () => {
    it('collects cell images from current selections and exposes selection metadata', () => {
        const service = createService();

        expect(service.getCellImagesInSelection()).toEqual([
            {
                row: 0,
                col: 0,
                cellAddress: 'A1',
                source: 'data:image/png;base64,aaa',
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
    });

    it('finds data columns outside the selection and builds sanitized file names', () => {
        const service = createService();
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
        expect(service.generateFileName(imageInfo, {
            fileNameParts: [FileNamePart.COLUMN_VALUE, FileNamePart.CELL_ADDRESS],
            columnIndex: 0,
        })).toBe('Client_Name_B2.jpeg');
        expect(service.generateFileNameWithContext(imageInfo, {
            fileNameParts: [FileNamePart.CELL_ADDRESS, FileNamePart.COLUMN_VALUE],
            columnIndex: 3,
        }, 'book-1', 'sheet-1')).toBe('B2_Summary.jpeg');
    });
});
