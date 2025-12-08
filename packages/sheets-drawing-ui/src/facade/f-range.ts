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

import type { ISheetLocationBase } from '@univerjs/sheets';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { getCurrentTypeOfRenderer, IRenderManagerService } from '@univerjs/engine-render';
import { FileNamePart, IBatchSaveImagesService, SheetDrawingUpdateController } from '@univerjs/sheets-drawing-ui';
import { FRange } from '@univerjs/sheets/facade';

/**
 * Options for saving cell images
 */
export interface ISaveCellImagesOptions {
    /**
     * Whether to use cell address in file name (e.g., A1, B2)
     * @default true
     */
    useCellAddress?: boolean;
    /**
     * Column index to use for file name (0-based). If specified, the value from this column will be used in file name.
     */
    useColumnIndex?: number;
}

export interface IFRangeSheetDrawingMixin {
    /**
     * Inserts an image into the current cell.
     *
     * @param {string | File} file File or URL string
     * @returns True if the image is inserted successfully, otherwise false
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Insert an image into the cell A10
     * const fRange = fWorksheet.getRange('A10');
     * const result = await fRange.insertCellImageAsync('https://avatars.githubusercontent.com/u/61444807?s=48&v=4');
     * console.log(result);
     * ```
     */
    insertCellImageAsync(file: File | string): Promise<boolean>;

    /**
     * Save all cell images in this range to the file system.
     * This method will open a directory picker dialog and save all images to the selected directory.
     *
     * @param {ISaveCellImagesOptions} [options] Options for saving images
     * @returns {Promise<boolean>} True if images are saved successfully, otherwise false
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Save all cell images in range A1:D10
     * const fRange = fWorksheet.getRange('A1:D10');
     *
     * // Save with default options (using cell address as file name)
     * await fRange.saveCellImagesAsync();
     *
     * // Save with custom options
     * await fRange.saveCellImagesAsync({
     *   useCellAddress: true,
     *   useColumnIndex: 0, // Use values from column A for file names
     * });
     * ```
     */
    saveCellImagesAsync(options?: ISaveCellImagesOptions): Promise<boolean>;
}

export class FRangeSheetDrawingUI extends FRange implements IFRangeSheetDrawingMixin {
    override async insertCellImageAsync(file: File | string): Promise<boolean> {
        const renderManagerService = this._injector.get(IRenderManagerService);
        const controller = getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET, this._injector.get(IUniverInstanceService), renderManagerService)
            ?.with(SheetDrawingUpdateController);
        if (!controller) {
            return false;
        }
        const location: ISheetLocationBase = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            row: this.getRow(),
            col: this.getColumn(),
        };

        if (typeof file === 'string') {
            return controller.insertCellImageByUrl(file, location);
        } else {
            return controller.insertCellImageByFile(file, location);
        }
    }

    override async saveCellImagesAsync(options?: ISaveCellImagesOptions): Promise<boolean> {
        const batchSaveService = this._injector.get(IBatchSaveImagesService);
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const range = this.getRange();

        // Get images in the range
        const images = batchSaveService.getCellImagesFromRanges(unitId, subUnitId, [range]);

        if (images.length === 0) {
            return false;
        }

        // If only one image, download directly
        if (images.length === 1) {
            try {
                await batchSaveService.downloadSingleImage(images[0]);
                return true;
            } catch (error) {
                console.error('Failed to download image:', error);
                return false;
            }
        }

        // Build config from options
        const fileNameParts: FileNamePart[] = [];
        const useCellAddress = options?.useCellAddress ?? true;
        const useColumnIndex = options?.useColumnIndex;

        if (useCellAddress) {
            fileNameParts.push(FileNamePart.CELL_ADDRESS);
        }
        if (useColumnIndex !== undefined) {
            fileNameParts.push(FileNamePart.COLUMN_VALUE);
        }

        // Ensure at least one naming option
        if (fileNameParts.length === 0) {
            fileNameParts.push(FileNamePart.CELL_ADDRESS);
        }

        try {
            await batchSaveService.saveImagesWithContext(images, {
                fileNameParts,
                columnIndex: useColumnIndex,
            }, unitId, subUnitId);
            return true;
        } catch (error) {
            console.error('Failed to save images:', error);
            return false;
        }
    }
}

FRange.extend(FRangeSheetDrawingUI);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeSheetDrawingMixin { }
}
