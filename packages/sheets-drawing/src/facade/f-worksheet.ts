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

import type { IFBlobSource } from '@univerjs/core/facade';
import type { ISheetImage } from '@univerjs/sheets-drawing';
import { DrawingTypeEnum, ImageSourceType } from '@univerjs/core';
import { InsertSheetDrawingCommand, ISheetDrawingService, RemoveSheetDrawingCommand, SetSheetDrawingCommand } from '@univerjs/sheets-drawing';
import { FWorksheet } from '@univerjs/sheets/facade';
import { FOverGridImage, FOverGridImageBuilder } from './f-over-grid-image';

/**
 * @ignore
 */
export interface IFWorksheetDrawingMixin {
    /**
     * Insert an image to the sheet
     * @param {string} url - The image url
     * @returns true if the image is inserted successfully
     * @example
     * ```ts
     * // Insert an image to the sheet, default position is A1
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const result = await fWorksheet.insertImage('https://avatars.githubusercontent.com/u/61444807?s=48&v=4');
     * console.log(result);
     * ```
     */
    insertImage(url: string): Promise<boolean>;
    /**
     * @param {string} url - The image url
     * @param {number} column - The column index to insert the image
     * @param {number} row - The row index to insert the image
     * @returns True if the image is inserted successfully
     * @example
     * ```ts
     * // Insert an image to the sheet, position is F6
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const result = await fWorksheet.insertImage('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', 5, 5);
     * console.log(result);
     * ```
     */
    insertImage(url: string, column: number, row: number): Promise<boolean>;
    /**
     * @param {string} url - The image url
     * @param {number} column - The column index to insert the image
     * @param {number} row - The row index to insert the image
     * @param {number} offsetX - The column offset, pixel unit
     * @param {number} offsetY - The row offset, pixel unit
     * @returns True if the image is inserted successfully
     * @example
     * ```ts
     * // Insert an image to the sheet, position is F6, offset is 10px
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const result = await fWorksheet.insertImage('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', 5, 5, 10, 10);
     * console.log(result);
     * ```
     */
    insertImage(url: string, column: number, row: number, offsetX: number, offsetY: number): Promise<boolean>;
    insertImage(url: IFBlobSource): Promise<boolean>;
    insertImage(url: IFBlobSource, column: number, row: number): Promise<boolean>;
    insertImage(url: IFBlobSource, column: number, row: number, offsetX: number, offsetY: number): Promise<boolean>;
    insertImage(url: IFBlobSource | string, column: number, row: number, offsetX: number, offsetY: number): Promise<boolean>;

    /**
     * Insert images to the sheet
     * @param {ISheetImage[]} sheetImages - The images to insert
     * @returns {FWorksheet} The FWorksheet instance for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell, width is 500px, height is 300px
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setWidth(500)
     *   .setHeight(300)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     *
     * // update the image width to 100px and height to 50px
     * setTimeout(async () => {
     *   const imageBuilder = fWorksheet.getImageById(image.drawingId).toBuilder();
     *   const newImage = await imageBuilder.setWidth(100).setHeight(50).buildAsync();
     *   fWorksheet.updateImages([newImage]);
     * }, 4000);
     * ```
     */
    insertImages(sheetImages: ISheetImage[]): FWorksheet;

    /**
     * Get all images of the sheet.
     * @returns {FOverGridImage[]} The FOverGridImage instances
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const images = fWorksheet.getImages();
     * images.forEach((image) => {
     *   console.log(image, image.getId());
     * });
     * ```
     */
    getImages(): FOverGridImage[];

    /**
     * Get image by drawing id
     * @param {string} id - The drawing id of the image
     * @returns {FOverGridImage | null} The FOverGridImage instance
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const image = fWorksheet.getImageById('xxxx');
     * console.log(image);
     * ```
     */
    getImageById(id: string): FOverGridImage | null;

    /**
     * Delete images from the sheet
     * @param {FOverGridImage[]} sheetImages - The images to delete
     * @returns {FWorksheet} The FWorksheet instance for chaining
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const image = fWorksheet.getImages()[0];
     *
     * // Delete the first image of the sheet
     * fWorksheet.deleteImages([image]);
     * ```
     */
    deleteImages(sheetImages: FOverGridImage[]): FWorksheet;

    /**
     * Update images to the sheet
     * @param {ISheetImage[]} sheetImages - The images to update
     * @returns {FWorksheet} The FWorksheet instance for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell, width is 500px, height is 300px
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setWidth(500)
     *   .setHeight(300)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     *
     * // update the image width to 100px and height to 50px after 4 seconds
     * setTimeout(async () => {
     *   const imageBuilder = fWorksheet.getImageById(image.drawingId).toBuilder();
     *   const newImage = await imageBuilder.setWidth(100).setHeight(50).buildAsync();
     *   fWorksheet.updateImages([newImage]);
     * }, 4000);
     * ```
     */
    updateImages(sheetImages: ISheetImage[]): FWorksheet;

    /**
     * Get the current selected images.
     * @returns {FOverGridImage[]} The FOverGridImage instances
     * @example
     * ```ts
     * const fWorksheet = univerAPI.getActiveWorkbook().getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const images = fWorksheet.getActiveImages();
     * images.forEach((image) => {
     *   console.log(image, image.getId());
     * });
     * ```
     */
    getActiveImages(): FOverGridImage[];

    /**
     * Create a new over grid image builder.
     * @returns {FOverGridImageBuilder} The FOverGridImageBuilder instance
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell, width is 500px, height is 300px
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setWidth(500)
     *   .setHeight(300)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     * ```
     */
    newOverGridImage(): FOverGridImageBuilder;
}

export class FWorksheetDrawingMixin extends FWorksheet implements IFWorksheetDrawingMixin {
    override async insertImage(url: IFBlobSource | string, column?: number, row?: number, offsetX?: number, offsetY?: number): Promise<boolean> {
        const imageBuilder = this.newOverGridImage();
        if (typeof url === 'string') {
            imageBuilder.setSource(url);
        } else {
            const blobSource = url.getBlob();
            const base64 = await blobSource.getDataAsString();
            imageBuilder.setSource(base64, ImageSourceType.BASE64);
        }

        if (column !== undefined) {
            imageBuilder.setColumn(column);
        } else {
            imageBuilder.setColumn(0);
        }

        if (row !== undefined) {
            imageBuilder.setRow(row);
        } else {
            imageBuilder.setRow(0);
        }

        if (offsetX !== undefined) {
            imageBuilder.setColumnOffset(offsetX);
        } else {
            imageBuilder.setColumnOffset(0);
        }

        if (offsetY !== undefined) {
            imageBuilder.setRowOffset(offsetY);
        } else {
            imageBuilder.setRowOffset(0);
        }

        const param = await imageBuilder.buildAsync();
        // param.drawingId

        return this._commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: this._fWorkbook.getId(), drawings: [param] });
    }

    override insertImages(sheetImages: ISheetImage[]): FWorksheet {
        const param = sheetImages.map((image) => {
            image.unitId = this._fWorkbook.getId();
            image.subUnitId = this.getSheetId();
            return image;
        });

        this._commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: this._fWorkbook.getId(), drawings: param });
        return this;
    }

    override deleteImages(sheetImages: FOverGridImage[]): FWorksheet {
        const drawings = sheetImages.map((image) => {
            return {
                unitId: this._fWorkbook.getId(),
                drawingId: image.getId(),
                subUnitId: this.getSheetId(),
                drawingType: image.getType(),
            };
        });
        this._commandService.syncExecuteCommand(RemoveSheetDrawingCommand.id, { unitId: this._fWorkbook.getId(), drawings });

        return this;
    }

    override getImages(): FOverGridImage[] {
        const sheetDrawingService = this._injector.get(ISheetDrawingService);
        const drawingData = sheetDrawingService.getDrawingData(this._fWorkbook.getId(), this.getSheetId());
        const images: FOverGridImage[] = [];
        for (const drawingId in drawingData) {
            const drawing = drawingData[drawingId];
            if (drawing.drawingType !== DrawingTypeEnum.DRAWING_IMAGE) {
                continue;
            }
            images.push(this._injector.createInstance(FOverGridImage, drawing as ISheetImage));
        }
        return images;
    }

    override getImageById(id: string): FOverGridImage | null {
        const sheetDrawingService = this._injector.get(ISheetDrawingService);
        const drawing = sheetDrawingService.getDrawingByParam({ unitId: this._fWorkbook.getId(), subUnitId: this.getSheetId(), drawingId: id });
        if (drawing && drawing.drawingType === DrawingTypeEnum.DRAWING_IMAGE) {
            return this._injector.createInstance(FOverGridImage, drawing as ISheetImage);
        }
        return null;
    }

    override getActiveImages(): FOverGridImage[] {
        const sheetDrawingService = this._injector.get(ISheetDrawingService);
        const drawingData = sheetDrawingService.getFocusDrawings();
        const images: FOverGridImage[] = [];
        for (const drawingId in drawingData) {
            const drawing = drawingData[drawingId];
            images.push(this._injector.createInstance(FOverGridImage, drawing as ISheetImage));
        }
        return images;
    }

    override updateImages(sheetImages: ISheetImage[]): FWorksheet {
        this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._fWorkbook.getId(), drawings: sheetImages });
        return this;
    }

    override newOverGridImage(): FOverGridImageBuilder {
        const unitId = this._fWorkbook.getId();
        const subUnitId = this.getSheetId();
        return this._injector.createInstance(FOverGridImageBuilder, unitId, subUnitId);
    }
}

FWorksheet.extend(FWorksheetDrawingMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetDrawingMixin { }
}
