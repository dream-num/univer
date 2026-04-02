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
import { afterEach, describe, expect, it, vi } from 'vitest';
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

    const imageIoService = {
        getImage: vi.fn(async (imageId: string) => `https://cdn.example.com/${imageId}.png`),
    };
    const urlImageService = {
        downloadImage: vi.fn(async (source: string) => new Blob([source], { type: 'image/png' })),
        registerURLImageDownloader: vi.fn(() => ({ dispose: vi.fn() })),
    };

    return {
        service: new BatchSaveImagesService(
            {
                getCurrentUnitForType: (type: UniverInstanceType) => (type === UniverInstanceType.UNIVER_SHEET ? workbook : null),
                getUnit: () => workbook,
            } as never,
            {
                getCurrentSelections: () => selections,
            } as never,
            imageIoService as never,
            urlImageService as never
        ),
        imageIoService,
        urlImageService,
    };
}

describe('BatchSaveImagesService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('collects cell images from current selections and exposes selection metadata', () => {
        const { service } = createService();

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
        const { service } = createService();
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

    it('collects images and data columns from explicit ranges', () => {
        const { service } = createService();

        expect(service.getCellImagesFromRanges('book-1', 'sheet-1', [{
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        }])).toEqual([
            expect.objectContaining({ cellAddress: 'A1', imageId: 'img-a1' }),
            expect.objectContaining({ cellAddress: 'B2', imageId: 'img-b2' }),
        ]);
        expect(service.getDataColumnsForRanges('book-1', 'sheet-1', [{
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        }])).toEqual([{ index: 3, label: 'D' }]);
    });

    it('falls back to the cell address when no filename parts produce usable content', () => {
        const { service } = createService();

        expect(service.generateFileName({
            row: 0,
            col: 0,
            cellAddress: 'A1',
            source: 'data:image/png;base64,aaa',
            imageSourceType: ImageSourceType.BASE64,
            imageId: 'img-a1',
        }, {
            fileNameParts: [FileNamePart.COLUMN_VALUE],
            columnIndex: 2,
        })).toBe('A1.png');
    });

    it('saves multiple images with deduplicated filenames', async () => {
        const { service, urlImageService } = createService();
        const write = vi.fn();
        const close = vi.fn();
        const getFileHandle = vi.fn(async () => ({
            createWritable: async () => ({
                write,
                close,
            }),
        }));

        vi.stubGlobal('fetch', vi.fn(async () => ({
            blob: async () => new Blob(['base64-image'], { type: 'image/png' }),
        })));
        vi.stubGlobal('window', {
            showDirectoryPicker: vi.fn(async () => ({
                getFileHandle,
            })),
        });

        const image = {
            row: 0,
            col: 0,
            cellAddress: 'A1',
            source: 'https://cdn.example.com/photo.png',
            imageSourceType: ImageSourceType.URL,
            imageId: 'img-a1',
        };

        await service.saveImages([image, image], {
            fileNameParts: [FileNamePart.CELL_ADDRESS],
        });

        expect(urlImageService.downloadImage).toHaveBeenCalledTimes(2);
        expect(getFileHandle).toHaveBeenNthCalledWith(1, 'A1.png', { create: true });
        expect(getFileHandle).toHaveBeenNthCalledWith(2, 'A1_1.png', { create: true });
        expect(write).toHaveBeenCalledTimes(2);
        expect(close).toHaveBeenCalledTimes(2);
    });

    it('saves uuid-backed images with worksheet context and resolves them through the image io service', async () => {
        const { service, imageIoService } = createService();
        const write = vi.fn();

        vi.stubGlobal('fetch', vi.fn(async () => ({
            blob: async () => new Blob(['uuid-image'], { type: 'image/png' }),
        })));
        vi.stubGlobal('window', {
            showDirectoryPicker: vi.fn(async () => ({
                getFileHandle: async () => ({
                    createWritable: async () => ({
                        write,
                        close: vi.fn(),
                    }),
                }),
            })),
        });

        await service.saveImagesWithContext([{
            row: 0,
            col: 0,
            cellAddress: 'A1',
            source: 'uuid-image-id',
            imageSourceType: ImageSourceType.UUID,
            imageId: 'uuid-image-id',
        }], {
            fileNameParts: [FileNamePart.CELL_ADDRESS, FileNamePart.COLUMN_VALUE],
            columnIndex: 3,
        }, 'book-1', 'sheet-1');

        expect(imageIoService.getImage).toHaveBeenCalledWith('uuid-image-id');
        expect(write).toHaveBeenCalledTimes(1);
    });

    it('downloads a single image through a browser download link', async () => {
        const { service, urlImageService } = createService();
        const anchor = {
            click: vi.fn(),
            href: '',
            download: '',
        };
        vi.stubGlobal('document', {
            body: {
                appendChild: vi.fn(),
                removeChild: vi.fn(),
            },
            createElement: vi.fn(() => anchor),
        });
        const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
        const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

        await service.downloadSingleImage({
            row: 1,
            col: 1,
            cellAddress: 'B2',
            source: 'https://cdn.example.com/photo.jpeg?version=1',
            imageSourceType: ImageSourceType.URL,
            imageId: 'img-b2',
        });

        expect(urlImageService.downloadImage).toHaveBeenCalledWith('https://cdn.example.com/photo.jpeg?version=1');
        expect(anchor.click).toHaveBeenCalledTimes(1);
        expect(createObjectURL).toHaveBeenCalledTimes(1);
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
    });

    it('delegates custom url image downloader registration to the url image service', () => {
        const { service, urlImageService } = createService();
        const downloader = vi.fn(async () => 'data:image/png;base64,abc');

        const disposable = service.registerURLImageDownloader(downloader);

        expect(urlImageService.registerURLImageDownloader).toHaveBeenCalledWith(downloader);
        expect(disposable).toMatchObject({ dispose: expect.any(Function) });
    });
});
