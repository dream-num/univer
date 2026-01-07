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

import { createIdentifier, Disposable, IImageIoService, ImageSourceType, Inject, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import type { ICellData, IDisposable, IRange, Nullable, Workbook } from '@univerjs/core';
import type { IImageData } from '@univerjs/drawing';
import { SheetsSelectionsService } from '@univerjs/sheets';

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
    }
}

/**
 * File name part type for multi-select
 */
export enum FileNamePart {
    /**
     * Use cell address as part of file name (e.g., A1, B2)
     */
    CELL_ADDRESS = 'cellAddress',
    /**
     * Use value from a specific column as part of file name
     */
    COLUMN_VALUE = 'columnValue',
}

export interface ICellImageInfo {
    row: number;
    col: number;
    cellAddress: string;
    source: string;
    imageSourceType: ImageSourceType;
    imageId: string;
}

export interface IBatchSaveImagesConfig {
    /**
     * Selected file name parts (multi-select)
     */
    fileNameParts: FileNamePart[];
    /**
     * Column index for COLUMN_VALUE part
     */
    columnIndex?: number;
}

export interface IBatchSaveImagesService {
    /**
     * Get all cell images in the current selection
     */
    getCellImagesInSelection(): ICellImageInfo[];

    /**
     * Get cell images from specified ranges
     * @param unitId The workbook unit ID
     * @param subUnitId The worksheet ID
     * @param ranges The ranges to get images from
     */
    getCellImagesFromRanges(unitId: string, subUnitId: string, ranges: IRange[]): ICellImageInfo[];

    /**
     * Get columns that have data in the current selection
     */
    getDataColumns(): Array<{ index: number; label: string }>;

    /**
     * Get columns that have data for specified ranges
     * @param unitId The workbook unit ID
     * @param subUnitId The worksheet ID
     * @param ranges The ranges to check
     */
    getDataColumnsForRanges(unitId: string, subUnitId: string, ranges: IRange[]): Array<{ index: number; label: string }>;

    /**
     * Get current selection range as A1 notation
     */
    getSelectionRangeNotation(): string;

    /**
     * Generate file name for a cell image based on config
     * @param imageInfo The cell image info
     * @param config The file name configuration
     */
    generateFileName(imageInfo: ICellImageInfo, config: IBatchSaveImagesConfig): string;

    /**
     * Generate file name with specified worksheet context
     * @param imageInfo The cell image info
     * @param config The file name configuration
     * @param unitId The workbook unit ID
     * @param subUnitId The worksheet ID
     */
    generateFileNameWithContext(imageInfo: ICellImageInfo, config: IBatchSaveImagesConfig, unitId: string, subUnitId: string): string;

    /**
     * Save images to the file system
     * @param images The images to save
     * @param config The file name configuration
     */
    saveImages(images: ICellImageInfo[], config: IBatchSaveImagesConfig): Promise<void>;

    /**
     * Save images to the file system with specified worksheet context
     * @param images The images to save
     * @param config The file name configuration
     * @param unitId The workbook unit ID
     * @param subUnitId The worksheet ID
     */
    saveImagesWithContext(images: ICellImageInfo[], config: IBatchSaveImagesConfig, unitId: string, subUnitId: string): Promise<void>;

    /**
     * Download a single image directly
     * @param imageInfo The cell image info
     */
    downloadSingleImage(imageInfo: ICellImageInfo): Promise<void>;

    /**
     * Get the row range of current selection
     * Returns the min and max row indices
     */
    getSelectionRowRange(): { startRow: number; endRow: number } | null;

    /**
     * Get all column indices that are within the current selection
     */
    /**
     * Get all column indices that are within the current selection
     */
    getSelectionColumnIndices(): Set<number>;

    /**
     * Register a custom image downloader for URL images
     * @param downloader The downloader function that takes a URL and returns a base64 string
     * @returns A disposable object to unregister the downloader
     */
    registerURLImageDownloader(downloader: (url: string) => Promise<string>): IDisposable;
}

export const IBatchSaveImagesService = createIdentifier<IBatchSaveImagesService>('sheets-drawing-ui.batch-save-images.service');

/**
 * Convert column index to letter (0 -> A, 1 -> B, etc.)
 */
function columnIndexToLetter(index: number): string {
    let letter = '';
    let temp = index;

    while (temp >= 0) {
        letter = String.fromCharCode((temp % 26) + 65) + letter;
        temp = Math.floor(temp / 26) - 1;
    }

    return letter;
}

/**
 * Convert row and column to A1 notation
 */
function toA1Notation(row: number, col: number): string {
    return `${columnIndexToLetter(col)}${row + 1}`;
}

/**
 * Convert range to A1 notation
 */
function rangeToA1Notation(range: IRange): string {
    const start = toA1Notation(range.startRow, range.startColumn);
    const end = toA1Notation(range.endRow, range.endColumn);
    return start === end ? start : `${start}:${end}`;
}

/**
 * Check if a cell has image
 */
function cellHasImage(cell: Nullable<ICellData>): boolean {
    return !!(cell?.p?.drawingsOrder?.length && cell?.p?.drawingsOrder?.length > 0);
}

/**
 * Get image data from cell
 */
function getCellImageData(cell: ICellData): IImageData | null {
    if (!cell.p?.drawingsOrder?.length || !cell.p?.drawings) {
        return null;
    }

    const drawingId = cell.p.drawingsOrder[0];
    const drawing = cell.p.drawings[drawingId];

    if (!drawing || !('source' in drawing) || !('imageSourceType' in drawing)) {
        return null;
    }

    return drawing as unknown as IImageData;
}

/**
 * Get file extension from mime type or source
 */
function getFileExtension(source: string, imageSourceType: ImageSourceType): string {
    if (imageSourceType === ImageSourceType.BASE64) {
        const match = source.match(/^data:image\/(\w+);/);
        if (match) {
            return match[1] === 'jpeg' ? 'jpg' : match[1];
        }
    }

    // Try to get extension from URL
    if (imageSourceType === ImageSourceType.URL) {
        const urlMatch = source.match(/\.(\w+)(?:\?|$)/);
        if (urlMatch) {
            return urlMatch[1].toLowerCase();
        }
    }

    // Default to png
    return 'png';
}

/**
 * Convert image source to blob
 */
async function imageSourceToBlob(source: string, imageSourceType: ImageSourceType): Promise<Blob> {
    if (imageSourceType === ImageSourceType.BASE64) {
        const response = await fetch(source);
        return response.blob();
    }

    if (imageSourceType === ImageSourceType.URL) {
        const response = await fetch(source);
        return response.blob();
    }

    // For UUID type, we need to get the actual URL from the service
    throw new Error('UUID image type requires additional handling');
}

export class BatchSaveImagesService extends Disposable implements IBatchSaveImagesService {

    private _urlImageDownloader: Nullable<(url: string) => Promise<string>> = null;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetsSelectionsService) private readonly _selectionService: SheetsSelectionsService,
        @IImageIoService private readonly _imageIoService: IImageIoService
    ) {
        super();
    }

    registerURLImageDownloader(downloader: (url: string) => Promise<string>): IDisposable {
        this._urlImageDownloader = downloader;
        return toDisposable(() => {
            if (this._urlImageDownloader === downloader) {
                this._urlImageDownloader = null;
            }
        });
    }

    getCellImagesInSelection(): ICellImageInfo[] {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return [];

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return [];

        const selections = this._selectionService.getCurrentSelections();
        if (!selections || selections.length === 0) return [];

        const cellMatrix = worksheet.getCellMatrix();
        const images: ICellImageInfo[] = [];

        for (const selection of selections) {
            const { startRow, endRow, startColumn, endColumn } = selection.range;

            for (let row = startRow; row <= endRow; row++) {
                for (let col = startColumn; col <= endColumn; col++) {
                    const cell = cellMatrix.getValue(row, col);

                    if (cellHasImage(cell)) {
                        const imageData = getCellImageData(cell!);
                        if (imageData) {
                            images.push({
                                row,
                                col,
                                cellAddress: toA1Notation(row, col),
                                source: imageData.source,
                                imageSourceType: imageData.imageSourceType,
                                imageId: imageData.drawingId,
                            });
                        }
                    }
                }
            }
        }

        return images;
    }

    getCellImagesFromRanges(unitId: string, subUnitId: string, ranges: IRange[]): ICellImageInfo[] {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return [];

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) return [];

        const cellMatrix = worksheet.getCellMatrix();
        const images: ICellImageInfo[] = [];

        for (const range of ranges) {
            const { startRow, endRow, startColumn, endColumn } = range;

            for (let row = startRow; row <= endRow; row++) {
                for (let col = startColumn; col <= endColumn; col++) {
                    const cell = cellMatrix.getValue(row, col);

                    if (cellHasImage(cell)) {
                        const imageData = getCellImageData(cell!);
                        if (imageData) {
                            images.push({
                                row,
                                col,
                                cellAddress: toA1Notation(row, col),
                                source: imageData.source,
                                imageSourceType: imageData.imageSourceType,
                                imageId: imageData.drawingId,
                            });
                        }
                    }
                }
            }
        }

        return images;
    }

    getDataColumns(): Array<{ index: number; label: string }> {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return [];

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return [];

        const selections = this._selectionService.getCurrentSelections();
        if (!selections || selections.length === 0) return [];

        const cellMatrix = worksheet.getCellMatrix();
        const dataRange = cellMatrix.getDataRange();

        // Get row range and column indices from selection
        let minRow = Infinity;
        let maxRow = -Infinity;
        const selectionColumnIndices = new Set<number>();

        for (const selection of selections) {
            minRow = Math.min(minRow, selection.range.startRow);
            maxRow = Math.max(maxRow, selection.range.endRow);

            // Collect all column indices within selection
            for (let col = selection.range.startColumn; col <= selection.range.endColumn; col++) {
                selectionColumnIndices.add(col);
            }
        }

        // Find columns that have values in the selection row range, excluding selection columns
        const columnsWithData = new Set<number>();

        for (let col = dataRange.startColumn; col <= dataRange.endColumn; col++) {
            // Skip columns that are within the selection
            if (selectionColumnIndices.has(col)) {
                continue;
            }

            for (let row = minRow; row <= maxRow; row++) {
                const cell = cellMatrix.getValue(row, col);
                if (cell) {
                    const value = cell.v?.toString() || cell.p?.body?.dataStream?.trim() || '';
                    if (value) {
                        columnsWithData.add(col);
                        break; // Found data in this column, move to next column
                    }
                }
            }
        }

        // Convert to array and sort
        const columns: Array<{ index: number; label: string }> = [];
        const sortedCols = Array.from(columnsWithData).sort((a, b) => a - b);

        for (const col of sortedCols) {
            columns.push({
                index: col,
                label: columnIndexToLetter(col),
            });
        }

        return columns;
    }

    getDataColumnsForRanges(unitId: string, subUnitId: string, ranges: IRange[]): Array<{ index: number; label: string }> {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return [];

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) return [];

        const cellMatrix = worksheet.getCellMatrix();
        const dataRange = cellMatrix.getDataRange();

        // Get row range and column indices from ranges
        let minRow = Infinity;
        let maxRow = -Infinity;
        const rangeColumnIndices = new Set<number>();

        for (const range of ranges) {
            minRow = Math.min(minRow, range.startRow);
            maxRow = Math.max(maxRow, range.endRow);

            // Collect all column indices within ranges
            for (let col = range.startColumn; col <= range.endColumn; col++) {
                rangeColumnIndices.add(col);
            }
        }

        // Find columns that have values in the row range, excluding range columns
        const columnsWithData = new Set<number>();

        for (let col = dataRange.startColumn; col <= dataRange.endColumn; col++) {
            // Skip columns that are within the ranges
            if (rangeColumnIndices.has(col)) {
                continue;
            }

            for (let row = minRow; row <= maxRow; row++) {
                const cell = cellMatrix.getValue(row, col);
                if (cell) {
                    const value = cell.v?.toString() || cell.p?.body?.dataStream?.trim() || '';
                    if (value) {
                        columnsWithData.add(col);
                        break;
                    }
                }
            }
        }

        // Convert to array and sort
        const columns: Array<{ index: number; label: string }> = [];
        const sortedCols = Array.from(columnsWithData).sort((a, b) => a - b);

        for (const col of sortedCols) {
            columns.push({
                index: col,
                label: columnIndexToLetter(col),
            });
        }

        return columns;
    }

    getSelectionRangeNotation(): string {
        const selections = this._selectionService.getCurrentSelections();
        if (!selections || selections.length === 0) return '';

        return selections.map((s) => rangeToA1Notation(s.range)).join(', ');
    }

    getSelectionRowRange(): { startRow: number; endRow: number } | null {
        const selections = this._selectionService.getCurrentSelections();
        if (!selections || selections.length === 0) return null;

        let minRow = Infinity;
        let maxRow = -Infinity;

        for (const selection of selections) {
            minRow = Math.min(minRow, selection.range.startRow);
            maxRow = Math.max(maxRow, selection.range.endRow);
        }

        return { startRow: minRow, endRow: maxRow };
    }

    getSelectionColumnIndices(): Set<number> {
        const selections = this._selectionService.getCurrentSelections();
        if (!selections || selections.length === 0) return new Set();

        const columnIndices = new Set<number>();
        for (const selection of selections) {
            for (let col = selection.range.startColumn; col <= selection.range.endColumn; col++) {
                columnIndices.add(col);
            }
        }

        return columnIndices;
    }

    generateFileName(imageInfo: ICellImageInfo, config: IBatchSaveImagesConfig): string {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const extension = getFileExtension(imageInfo.source, imageInfo.imageSourceType);
        const parts: string[] = [];

        // Process each selected file name part in order
        for (const part of config.fileNameParts) {
            if (part === FileNamePart.CELL_ADDRESS) {
                parts.push(imageInfo.cellAddress);
            } else if (part === FileNamePart.COLUMN_VALUE && config.columnIndex !== undefined) {
                const worksheet = workbook?.getActiveSheet();
                if (worksheet) {
                    const cellMatrix = worksheet.getCellMatrix();
                    const cell = cellMatrix.getValue(imageInfo.row, config.columnIndex);

                    if (cell) {
                        // Get cell display value
                        const value = cell.v?.toString() || cell.p?.body?.dataStream?.trim() || '';
                        if (value) {
                            // Sanitize file name (remove invalid characters)
                            const sanitized = value.replace(/[<>:"/\\|?*]/g, '_').trim();
                            if (sanitized) {
                                parts.push(sanitized);
                            }
                            // If sanitized is empty, skip this part (don't add anything)
                        }
                        // If value is empty, skip this part
                    }
                    // If cell is empty, skip this part
                }
            }
        }

        // If no parts selected or all parts failed, use cell address as default
        if (parts.length === 0) {
            return `${imageInfo.cellAddress}.${extension}`;
        }

        // Join parts with underscore
        return `${parts.join('_')}.${extension}`;
    }

    generateFileNameWithContext(imageInfo: ICellImageInfo, config: IBatchSaveImagesConfig, unitId: string, subUnitId: string): string {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        const extension = getFileExtension(imageInfo.source, imageInfo.imageSourceType);
        const parts: string[] = [];

        // Process each selected file name part in order
        for (const part of config.fileNameParts) {
            if (part === FileNamePart.CELL_ADDRESS) {
                parts.push(imageInfo.cellAddress);
            } else if (part === FileNamePart.COLUMN_VALUE && config.columnIndex !== undefined) {
                const worksheet = workbook?.getSheetBySheetId(subUnitId);
                if (worksheet) {
                    const cellMatrix = worksheet.getCellMatrix();
                    const cell = cellMatrix.getValue(imageInfo.row, config.columnIndex);

                    if (cell) {
                        // Get cell display value
                        const value = cell.v?.toString() || cell.p?.body?.dataStream?.trim() || '';
                        if (value) {
                            // Sanitize file name (remove invalid characters)
                            const sanitized = value.replace(/[<>:"/\\|?*]/g, '_').trim();
                            if (sanitized) {
                                parts.push(sanitized);
                            }
                        }
                    }
                }
            }
        }

        // If no parts selected or all parts failed, use cell address as default
        if (parts.length === 0) {
            return `${imageInfo.cellAddress}.${extension}`;
        }

        // Join parts with underscore
        return `${parts.join('_')}.${extension}`;
    }

    async saveImages(images: ICellImageInfo[], config: IBatchSaveImagesConfig): Promise<void> {
        // Request directory access using File System Access API
        const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
        // Track file names to handle duplicates
        const fileNameCounts = new Map<string, number>();

        for (const imageInfo of images) {
            let fileName = this.generateFileName(imageInfo, config);

            // Handle duplicate file names
            const baseName = fileName.replace(/\.\w+$/, '');
            const ext = fileName.match(/\.\w+$/)?.[0] || '.png';

            const count = fileNameCounts.get(baseName) || 0;
            if (count > 0) {
                fileName = `${baseName}_${count}${ext}`;
            }
            fileNameCounts.set(baseName, count + 1);

            try {
                // Get image blob
                const blob = await this._getImageBlob(imageInfo);

                // Create file and write
                const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
            } catch (error) {
                console.error(`Failed to save image ${fileName}:`, error);
                throw error;
            }
        }
    }

    async saveImagesWithContext(images: ICellImageInfo[], config: IBatchSaveImagesConfig, unitId: string, subUnitId: string): Promise<void> {
        // Request directory access using File System Access API
        const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });

        // Track file names to handle duplicates
        const fileNameCounts = new Map<string, number>();

        for (const imageInfo of images) {
            let fileName = this.generateFileNameWithContext(imageInfo, config, unitId, subUnitId);

            // Handle duplicate file names
            const baseName = fileName.replace(/\.\w+$/, '');
            const ext = fileName.match(/\.\w+$/)?.[0] || '.png';

            const count = fileNameCounts.get(baseName) || 0;
            if (count > 0) {
                fileName = `${baseName}_${count}${ext}`;
            }
            fileNameCounts.set(baseName, count + 1);

            try {
                // Get image blob
                const blob = await this._getImageBlob(imageInfo);

                // Create file and write
                const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
            } catch (error) {
                console.error(`Failed to save image ${fileName}:`, error);
                throw error;
            }
        }
    }

    async downloadSingleImage(imageInfo: ICellImageInfo): Promise<void> {
        const extension = getFileExtension(imageInfo.source, imageInfo.imageSourceType);
        const fileName = `${imageInfo.cellAddress}.${extension}`;

        try {
            const blob = await this._getImageBlob(imageInfo);

            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Failed to download image ${fileName}:`, error);
            throw error;
        }
    }

    private async _getImageBlob(imageInfo: ICellImageInfo): Promise<Blob> {
        if (imageInfo.imageSourceType === ImageSourceType.UUID) {
            // For UUID, we need to get the actual image from the service
            const imageUrl = await this._imageIoService.getImage(imageInfo.source);
            return imageSourceToBlob(imageUrl, ImageSourceType.URL);
        }

        if (imageInfo.imageSourceType === ImageSourceType.URL && this._urlImageDownloader) {
            try {
                const base64 = await this._urlImageDownloader(imageInfo.source);
                return imageSourceToBlob(base64, ImageSourceType.BASE64);
            } catch (error) {
                console.error(`Custom downloader failed for ${imageInfo.source}, falling back to default fetch:`, error);
                // Fallback to default fetch if custom downloader fails
            }
        }

        return imageSourceToBlob(imageInfo.source, imageInfo.imageSourceType);
    }
}
