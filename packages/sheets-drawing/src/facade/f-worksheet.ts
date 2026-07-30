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

import type { IDrawingParam, Injector } from '@univerjs/core';
import type { IFBlobSource } from '@univerjs/core/facade';
import type { IDrawingGroupUpdateParam } from '@univerjs/drawing';
import type { ISheetDrawing, ISheetDrawingPlacement, ISheetDrawingPlacementInput, ISheetImage } from '@univerjs/sheets-drawing';
import {
    DrawingTypeEnum,
    generateRandomId,
    getGroupState,

    ImageSourceType,

    IUndoRedoService,
    transformObjectOutOfGroup,
} from '@univerjs/core';
import { isGroupableDrawingType } from '@univerjs/drawing';
import { DrawingApplyType, getSheetDrawingPlacement, InsertSheetDrawingCommand, ISheetDrawingService, isSheetDrawingPlacementTarget, RemoveSheetDrawingCommand, SetDrawingApplyMutation, SetSheetDrawingCommand, SetSheetDrawingPlacementCommand } from '@univerjs/sheets-drawing';
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
     * Get the placement of an Image or Shape on this sheet.
     *
     * OneCell and TwoCell are always returned in normalized marker form, even
     * when bounds were supplied to the setter.
     *
     * @param {string} drawingId Drawing id.
     * @returns {ISheetDrawingPlacement | null} The placement, or `null` when the drawing is not an Image or Shape.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const placement = sheet.getDrawingPlacement('drawing-id');
     * if (placement?.kind === univerAPI.Enum.SheetDrawingAnchorType.Both) {
     *   console.log(placement.from, placement.to);
     * }
     * ```
     */
    getDrawingPlacement(drawingId: string): ISheetDrawingPlacement | null;

    /**
     * Set the placement of an Image or Shape on this sheet through the drawing command.
     *
     * Bounds are recommended for normal authoring flows and anchor-mode
     * changes. The command derives cell markers from the Sheet model in both
     * headless and UI runtimes. Use explicit markers when the user selected
     * cells, or when exact OOXML, copy/paste, or server-generated markers must
     * be preserved.
     *
     * @param {string} drawingId Drawing id.
     * @param {ISheetDrawingPlacementInput} placement Marker placement or absolute bounds with the requested anchor behavior.
     * @returns {boolean} `true` when the command succeeds.
     * @example OneCell inferred from bounds (recommended for changing an existing drawing)
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const image = sheet.getImages()[0];
     * if (!image) throw new Error('No image found.');
     * const changed = sheet.setDrawingPlacement(image.getId(), {
     *   kind: univerAPI.Enum.SheetDrawingAnchorType.Position,
     *   left: 160,
     *   top: 48,
     *   width: 240,
     *   height: 120,
     * });
     * console.log(changed);
     * ```
     * @example OneCell with an explicit user-selected anchor cell
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const image = sheet.getImages()[0];
     * if (!image) throw new Error('No image found.');
     * sheet.setDrawingPlacement(image.getId(), {
     *   kind: univerAPI.Enum.SheetDrawingAnchorType.Position,
     *   from: { row: 2, column: 2, rowOffset: 8, columnOffset: 8 },
     *   width: 240,
     *   height: 120,
     * });
     * ```
     * @example TwoCell inferred from bounds (recommended for changing an existing drawing)
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const image = sheet.getImages()[0];
     * if (!image) throw new Error('No image found.');
     * sheet.setDrawingPlacement(image.getId(), {
     *   kind: univerAPI.Enum.SheetDrawingAnchorType.Both,
     *   left: 160,
     *   top: 48,
     *   width: 240,
     *   height: 120,
     * });
     * ```
     * @example TwoCell with explicit user-selected start and end cells
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const image = sheet.getImages()[0];
     * if (!image) throw new Error('No image found.');
     * sheet.setDrawingPlacement(image.getId(), {
     *   kind: univerAPI.Enum.SheetDrawingAnchorType.Both,
     *   from: { row: 2, column: 2, rowOffset: 8, columnOffset: 8 },
     *   to: { row: 8, column: 6, rowOffset: 0, columnOffset: 0 },
     * });
     * ```
     * @example Absolute/free bounds for an overlay that must ignore row and column changes
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const image = sheet.getImages()[0];
     * if (!image) throw new Error('No image found.');
     * sheet.setDrawingPlacement(image.getId(), {
     *   kind: univerAPI.Enum.SheetDrawingAnchorType.None,
     *   left: 640,
     *   top: 96,
     *   width: 240,
     *   height: 120,
     * });
     * ```
     */
    setDrawingPlacement(drawingId: string, placement: ISheetDrawingPlacementInput): boolean;

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

    /**
     * Group drawings on the current sheet.
     * @param {string[]} drawingIds - The drawing ids to group. At least two drawings are required.
     * @param {string} [groupId] - Optional group drawing id. If omitted, a new id will be generated.
     * @returns {string | null} The group id if the operation succeeds, otherwise null.
     * @example
     * ```ts
     * // Group two over-grid images on the active sheet.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image1 = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(1)
     *   .setRow(1)
     *   .setWidth(100)
     *   .setHeight(100)
     *   .buildAsync();
     * const image2 = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(3)
     *   .setRow(1)
     *   .setWidth(100)
     *   .setHeight(100)
     *   .buildAsync();
     * fWorksheet.insertImages([image1, image2]);
     * const groupId = fWorksheet.groupDrawings([image1.drawingId, image2.drawingId]);
     * console.log(groupId);
     * ```
     */
    groupDrawings(drawingIds: string[], groupId?: string): string | null;

    /**
     * Ungroup drawing groups on the current sheet.
     * @param {string[]} groupIds - The group drawing ids to ungroup.
     * @returns {boolean} true if the operation succeeds, otherwise false.
     * @example
     * ```ts
     * // Group two images, then ungroup the generated group.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image1 = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(1)
     *   .setRow(1)
     *   .setWidth(100)
     *   .setHeight(100)
     *   .buildAsync();
     * const image2 = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(3)
     *   .setRow(1)
     *   .setWidth(100)
     *   .setHeight(100)
     *   .buildAsync();
     * fWorksheet.insertImages([image1, image2]);
     * const groupId = fWorksheet.groupDrawings([image1.drawingId, image2.drawingId]);
     * if (groupId) {
     *   const result = fWorksheet.ungroupDrawings([groupId]);
     *   console.log(result);
     * }
     * ```
     */
    ungroupDrawings(groupIds: string[]): boolean;

    /**
     * Get children of a drawing group on the current sheet.
     * @param {string} groupId - The group drawing id.
     * @param {boolean} [recursive] - Whether to return all descendants.
     * @returns {ISheetDrawing[]} The child drawings.
     * @example
     * ```ts
     * // Get the direct children of a drawing group.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image1 = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(1)
     *   .setRow(1)
     *   .setWidth(100)
     *   .setHeight(100)
     *   .buildAsync();
     * const image2 = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(3)
     *   .setRow(1)
     *   .setWidth(100)
     *   .setHeight(100)
     *   .buildAsync();
     * fWorksheet.insertImages([image1, image2]);
     * const groupId = fWorksheet.groupDrawings([image1.drawingId, image2.drawingId]);
     * if (groupId) {
     *   const children = fWorksheet.getDrawingGroupChildren(groupId);
     *   console.log(children.map((drawing) => drawing.drawingId));
     * }
     * ```
     */
    getDrawingGroupChildren(groupId: string, recursive?: boolean): ISheetDrawing[];

    /**
     * Get the parent group of a drawing on the current sheet.
     * @param {string} drawingId - The child drawing id.
     * @returns {ISheetDrawing | null} The parent group drawing, or null if the drawing is not grouped.
     * @example
     * ```ts
     * // Get the parent group of a drawing.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image1 = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(1)
     *   .setRow(1)
     *   .setWidth(100)
     *   .setHeight(100)
     *   .buildAsync();
     * const image2 = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(3)
     *   .setRow(1)
     *   .setWidth(100)
     *   .setHeight(100)
     *   .buildAsync();
     * fWorksheet.insertImages([image1, image2]);
     * fWorksheet.groupDrawings([image1.drawingId, image2.drawingId]);
     * const parentGroup = fWorksheet.getDrawingParentGroup(image1.drawingId);
     * console.log(parentGroup?.drawingId);
     * ```
     */
    getDrawingParentGroup(drawingId: string): ISheetDrawing | null;

    /**
     * Returns whether a drawing is inside a group on the current sheet.
     * @param {string} drawingId - The drawing id.
     * @returns {boolean} true if the drawing has a parent group.
     * @example
     * ```ts
     * // Check whether a drawing is inside a group.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image1 = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(1)
     *   .setRow(1)
     *   .setWidth(100)
     *   .setHeight(100)
     *   .buildAsync();
     * const image2 = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(3)
     *   .setRow(1)
     *   .setWidth(100)
     *   .setHeight(100)
     *   .buildAsync();
     * fWorksheet.insertImages([image1, image2]);
     * fWorksheet.groupDrawings([image1.drawingId, image2.drawingId]);
     * const isGrouped = fWorksheet.isDrawingGrouped(image1.drawingId);
     * console.log(isGrouped);
     * ```
     */
    isDrawingGrouped(drawingId: string): boolean;
}

export class FWorksheetDrawingMixin extends FWorksheet implements IFWorksheetDrawingMixin {
    private _sheetDrawingServiceValue?: ISheetDrawingService;
    private _undoRedoServiceValue?: IUndoRedoService;

    override _initialize(injector: Injector): void {
        this._sheetDrawingServiceValue = injector.get(ISheetDrawingService);
        this._undoRedoServiceValue = injector.get(IUndoRedoService);
    }

    private get _sheetDrawingService(): ISheetDrawingService {
        if (!this._sheetDrawingServiceValue) {
            throw new Error('SHEETS_DRAWING_FACADE_NOT_INITIALIZED');
        }
        return this._sheetDrawingServiceValue;
    }

    private get _undoRedoService(): IUndoRedoService {
        if (!this._undoRedoServiceValue) {
            throw new Error('SHEETS_DRAWING_FACADE_NOT_INITIALIZED');
        }
        return this._undoRedoServiceValue;
    }

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
        const drawingData = this._sheetDrawingService.getDrawingData(this._fWorkbook.getId(), this.getSheetId());
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
        const drawing = this._sheetDrawingService.getDrawingByParam({ unitId: this._fWorkbook.getId(), subUnitId: this.getSheetId(), drawingId: id });
        if (drawing && drawing.drawingType === DrawingTypeEnum.DRAWING_IMAGE) {
            return this._injector.createInstance(FOverGridImage, drawing as ISheetImage);
        }
        return null;
    }

    override getActiveImages(): FOverGridImage[] {
        const drawingData = this._sheetDrawingService.getFocusDrawings();
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

    override getDrawingPlacement(drawingId: string): ISheetDrawingPlacement | null {
        const drawing = this._sheetDrawingService.getDrawingByParam({
            unitId: this._fWorkbook.getId(),
            subUnitId: this.getSheetId(),
            drawingId,
        });
        return isSheetDrawingPlacementTarget(drawing) ? getSheetDrawingPlacement(drawing) : null;
    }

    override setDrawingPlacement(drawingId: string, placement: ISheetDrawingPlacementInput): boolean {
        return this._commandService.syncExecuteCommand(SetSheetDrawingPlacementCommand.id, {
            unitId: this._fWorkbook.getId(),
            subUnitId: this.getSheetId(),
            drawings: [{ drawingId, placement }],
        });
    }

    override newOverGridImage(): FOverGridImageBuilder {
        const unitId = this._fWorkbook.getId();
        const subUnitId = this.getSheetId();
        return this._injector.createInstance(FOverGridImageBuilder, unitId, subUnitId);
    }

    override groupDrawings(drawingIds: string[], groupId = generateRandomId(10)): string | null {
        const uniqueDrawingIds = Array.from(new Set(drawingIds));
        if (uniqueDrawingIds.length < 2) return null;

        const unitId = this._fWorkbook.getId();
        const subUnitId = this.getSheetId();
        if (this._sheetDrawingService.getDrawingByParam({ unitId, subUnitId, drawingId: groupId })) return null;

        const drawings = uniqueDrawingIds.map((drawingId) => this._sheetDrawingService.getDrawingByParam({ unitId, subUnitId, drawingId }));

        if (drawings.some((drawing) => !drawing)) return null;
        if (drawings.some((drawing) => !isGroupableDrawingType(drawing!.drawingType))) return null;

        const validDrawings = drawings as ISheetDrawing[];
        const groupTransform = getGroupState(0, 0, validDrawings.map((drawing) => drawing.transform || {}));
        const groupParam = {
            unitId,
            subUnitId,
            drawingId: groupId,
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            transform: groupTransform,
            groupBaseBound: {
                left: groupTransform.left,
                top: groupTransform.top,
                width: groupTransform.width,
                height: groupTransform.height,
            },
        } as IDrawingParam;
        const children = validDrawings.map((drawing) => ({
            ...drawing,
            groupId,
        })) as IDrawingParam[];

        const result = this._applyGroupDrawingOperation([{
            parent: groupParam,
            children,
        }], DrawingApplyType.GROUP);

        return result ? groupId : null;
    }

    override ungroupDrawings(groupIds: string[]): boolean {
        const unitId = this._fWorkbook.getId();
        const subUnitId = this.getSheetId();
        const groupParams: IDrawingGroupUpdateParam[] = [];

        for (const groupId of groupIds) {
            const groupDrawing = this._sheetDrawingService.getDrawingByParam({ unitId, subUnitId, drawingId: groupId });
            if (!groupDrawing || groupDrawing.drawingType !== DrawingTypeEnum.DRAWING_GROUP) continue;

            const groupTransform = groupDrawing.transform || { width: 0, height: 0 };
            const children = this._sheetDrawingService.getDrawingsByGroup({ unitId, subUnitId, drawingId: groupId })
                .map((drawing) => {
                    const newTransform = transformObjectOutOfGroup(
                        drawing.transform || {},
                        groupTransform,
                        groupTransform.width || 0,
                        groupTransform.height || 0,
                        groupDrawing.groupBaseBound
                    );

                    return {
                        ...drawing,
                        transform: {
                            ...drawing.transform,
                            ...newTransform,
                        },
                        groupId: undefined,
                    };
                });

            if (children.length > 0) {
                groupParams.push({
                    parent: groupDrawing,
                    children,
                });
            }
        }

        return this._applyGroupDrawingOperation(groupParams, DrawingApplyType.UNGROUP);
    }

    override getDrawingGroupChildren(groupId: string, recursive = false): ISheetDrawing[] {
        const unitId = this._fWorkbook.getId();
        const subUnitId = this.getSheetId();

        if (!recursive) {
            return this._sheetDrawingService.getDrawingsByGroup({ unitId, subUnitId, drawingId: groupId });
        }

        const nested = this._sheetDrawingService.getDrawingsByGroupNested({ unitId, subUnitId, drawingId: groupId });
        if (!nested) return [];

        return [
            ...(nested.flatChildren || []),
            ...nested.groups.filter((group) => group.drawingId !== groupId),
        ] as ISheetDrawing[];
    }

    override getDrawingParentGroup(drawingId: string): ISheetDrawing | null {
        const unitId = this._fWorkbook.getId();
        const subUnitId = this.getSheetId();
        const drawing = this._sheetDrawingService.getDrawingByParam({ unitId, subUnitId, drawingId });

        if (!drawing?.groupId) return null;

        const groupDrawing = this._sheetDrawingService.getDrawingByParam({ unitId, subUnitId, drawingId: drawing.groupId });
        if (!groupDrawing || groupDrawing.drawingType !== DrawingTypeEnum.DRAWING_GROUP) return null;

        return groupDrawing;
    }

    override isDrawingGrouped(drawingId: string): boolean {
        return this.getDrawingParentGroup(drawingId) !== null;
    }

    private _applyGroupDrawingOperation(groupParams: IDrawingGroupUpdateParam[], type: DrawingApplyType.GROUP | DrawingApplyType.UNGROUP): boolean {
        if (groupParams.length === 0) return false;

        const commandService = this._commandService;
        const jsonOp = type === DrawingApplyType.GROUP
            ? this._sheetDrawingService.getGroupDrawingOp(groupParams)
            : this._sheetDrawingService.getUngroupDrawingOp(groupParams);

        const { unitId, subUnitId, undo, redo, objects } = jsonOp;
        const result = commandService.syncExecuteCommand(SetDrawingApplyMutation.id, { op: redo, unitId, subUnitId, objects, type });

        if (result) {
            const inverseType = type === DrawingApplyType.GROUP ? DrawingApplyType.UNGROUP : DrawingApplyType.GROUP;
            this._undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    { id: SetDrawingApplyMutation.id, params: { op: undo, unitId, subUnitId, objects: this._invertGroupOperationObjects(objects as IDrawingGroupUpdateParam[], type), type: inverseType } },
                ],
                redoMutations: [
                    { id: SetDrawingApplyMutation.id, params: { op: redo, unitId, subUnitId, objects, type } },
                ],
            });

            return true;
        }

        return false;
    }

    private _invertGroupOperationObjects(groupParams: IDrawingGroupUpdateParam[], type: DrawingApplyType.GROUP | DrawingApplyType.UNGROUP): IDrawingGroupUpdateParam[] {
        return type === DrawingApplyType.GROUP
            ? groupParams.map((groupParam) => {
                const { parent, children } = groupParam;
                const groupTransform = parent.transform || { width: 0, height: 0 };
                return {
                    parent: {
                        ...parent,
                        transform: {
                            left: 0,
                            top: 0,
                        },
                    },
                    children: children.map((child) => ({
                        ...child,
                        transform: transformObjectOutOfGroup(
                            child.transform || {},
                            groupTransform,
                            groupTransform.width || 0,
                            groupTransform.height || 0,
                            parent.groupBaseBound
                        ),
                        groupId: undefined,
                    })),
                };
            })
            : groupParams.map((groupParam) => {
                const { parent, children } = groupParam;
                const groupTransform = getGroupState(0, 0, children.map((child) => child.transform || {}));
                return {
                    parent: {
                        ...parent,
                        transform: groupTransform,
                    },
                    children: children.map((child) => ({
                        ...child,
                        groupId: parent.drawingId,
                    })),
                };
            });
    }
}

FWorksheet.extend(FWorksheetDrawingMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetDrawingMixin { }
}
