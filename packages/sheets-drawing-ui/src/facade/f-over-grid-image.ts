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

import type { IRotationSkewFlipTransform, ISize } from '@univerjs/core';
import type { ICellOverGridPosition } from '@univerjs/sheets';
import type { ISheetImage, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { ArrangeTypeEnum, DrawingTypeEnum, generateRandomId, ICommandService, ImageSourceType, Inject, Injector } from '@univerjs/core';
import { FBase } from '@univerjs/core/facade';
import { getImageSize } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { RemoveSheetDrawingCommand, SetDrawingArrangeCommand, SetSheetDrawingCommand } from '@univerjs/sheets-drawing-ui';
import { convertPositionCellToSheetOverGrid, convertPositionSheetOverGridToAbsolute, ISheetSelectionRenderService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';

export interface IFOverGridImage extends Omit<ISheetImage, 'sheetTransform' | 'transform'>, ICellOverGridPosition, IRotationSkewFlipTransform, Required<ISize> {

}

/**
 * Convert the image parameter to a FOverGridImage
 * @param {ISheetImage} sheetImage The image parameter
 * @param {SheetSkeletonManagerService} sheetSkeletonManagerService The skeleton manager service
 * @returns {IFOverGridImage} The FOverGridImage {@link IFOverGridImage}
 */
function convertSheetImageToFOverGridImage(sheetImage: ISheetImage, sheetSkeletonManagerService: SheetSkeletonManagerService): IFOverGridImage {
    const { from, to, flipY = false, flipX = false, angle = 0, skewX = 0, skewY = 0 } = sheetImage.sheetTransform;

    const { column: fromColumn, columnOffset: fromColumnOffset, row: fromRow, rowOffset: fromRowOffset } = from;

    const absolutePosition = convertPositionSheetOverGridToAbsolute(
        sheetImage.unitId,
        sheetImage.subUnitId,
        { from, to },
        sheetSkeletonManagerService
    );

    const { width, height } = absolutePosition;

    return {
        ...sheetImage,
        column: fromColumn,
        columnOffset: fromColumnOffset,
        row: fromRow,
        rowOffset: fromRowOffset,
        width,
        height,
        flipY,
        flipX,
        angle,
        skewX,
        skewY,
    };
}

/**
 * Convert the FOverGridImage to a ISheetImage
 * @param {IFOverGridImage} fOverGridImage The FOverGridImage
 * @param {ISheetSelectionRenderService} selectionRenderService The selection render service
 * @param {SheetSkeletonManagerService} sheetSkeletonManagerService The skeleton manager service
 * @returns {ISheetImage} The ISheetImage {@link ISheetImage}
 */
function convertFOverGridImageToSheetImage(fOverGridImage: IFOverGridImage, selectionRenderService: ISheetSelectionRenderService, sheetSkeletonManagerService: SheetSkeletonManagerService): ISheetImage {
    const { column: fromColumn, columnOffset: fromColumnOffset, row: fromRow, rowOffset: fromRowOffset, flipY = false, flipX = false, angle = 0, skewX = 0, skewY = 0, width, height } = fOverGridImage;

    const absolutePosition = convertPositionCellToSheetOverGrid(
        fOverGridImage.unitId,
        fOverGridImage.subUnitId,
        { column: fromColumn, columnOffset: fromColumnOffset, row: fromRow, rowOffset: fromRowOffset },
        width,
        height,
        selectionRenderService,
        sheetSkeletonManagerService
    );

    const { sheetTransform, transform } = absolutePosition;

    return {
        ...fOverGridImage,
        sheetTransform: {
            ...sheetTransform,
            flipY,
            flipX,
            angle,
            skewX,
            skewY,
        },
        transform: {
            ...transform,
            flipY,
            flipX,
            angle,
            skewX,
            skewY,
        },
    };
}

/**
 * @hideconstructor
 */
export class FOverGridImageBuilder {
    private _image: IFOverGridImage;
    constructor(
        unitId: string,
        subUnitId: string,
        @Inject(Injector) protected readonly _injector: Injector
        // @Inject(SheetSkeletonManagerService) protected readonly _skeletonManagerService: SheetSkeletonManagerService,
        // @ISheetSelectionRenderService protected readonly _selectionRenderService: ISheetSelectionRenderService
    ) {
        this._image = {
            drawingId: generateRandomId(6),
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.BASE64,
            source: '',
            unitId,
            subUnitId,
            column: 0,
            columnOffset: 0,
            row: 0,
            rowOffset: 0,
            width: 0,
            height: 0,
        };
    }

    /**
     * Set the initial image configuration for the image builder.
     * @param {ISheetImage} image - The image configuration
     * @returns {FOverGridImageBuilder} The `FOverGridImageBuilder` for chaining
     * @example
     * ```ts
     * // create a new image builder and set initial image configuration.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setImage({
     *     drawingId: '123456',
     *     drawingType: univerAPI.Enum.DrawingType.DRAWING_IMAGE,
     *     imageSourceType: univerAPI.Enum.ImageSourceType.BASE64,
     *     source: 'https://avatars.githubusercontent.com/u/61444807?s=48&v=4',
     *     unitId: fWorkbook.getId(),
     *     subUnitId: fWorksheet.getSheetId(),
     *   })
     *   .setColumn(5)
     *   .setRow(5)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     * ```
     */
    setImage(image: ISheetImage): FOverGridImageBuilder {
        const renderManagerService = this._injector.get(IRenderManagerService);
        const render = renderManagerService.getRenderById(image.unitId);
        if (!render) {
            throw new Error(`Render Unit with unitId ${image.unitId} not found`);
        }
        const skeletonManagerService = render.with(SheetSkeletonManagerService);

        if (image.sheetTransform == null) {
            image.sheetTransform = {
                from: {
                    column: 0,
                    columnOffset: 0,
                    row: 0,
                    rowOffset: 0,
                },
                to: {
                    column: 0,
                    columnOffset: 0,
                    row: 0,
                    rowOffset: 0,
                },
            };
        }
        this._image = convertSheetImageToFOverGridImage(image, skeletonManagerService);
        return this;
    }

    /**
     * Set the source of the image.
     * @param {string} source - The source of the image
     * @param {ImageSourceType} [sourceType] - The source type of the image, default is URL
     * @returns {FOverGridImageBuilder} The `FOverGridImageBuilder` for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     * ```
     */
    setSource(source: string): FOverGridImageBuilder;
    setSource(source: string, sourceType?: ImageSourceType): FOverGridImageBuilder;
    setSource(source: string, sourceType?: ImageSourceType): FOverGridImageBuilder {
        const sourceTypeVal = sourceType ?? ImageSourceType.URL;
        this._image.source = source;
        this._image.imageSourceType = sourceTypeVal;
        return this;
    }

    /**
     * Get the source of the image
     * @returns {string} The source of the image
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const images = fWorksheet.getImages();
     * images.forEach((image) => {
     *   console.log(image, image.toBuilder().getSource());
     * });
     * ```
     */
    getSource(): string {
        return this._image.source;
    }

    /**
     * Get the source type of the image
     * @returns {ImageSourceType} The source type of the image
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const images = fWorksheet.getImages();
     * images.forEach((image) => {
     *   console.log(image, image.toBuilder().getSourceType());
     * });
     * ```
     */
    getSourceType(): ImageSourceType {
        return this._image.imageSourceType;
    }

    /**
     * Set the horizontal position of the image
     * @param {number} column - The column index of the image start position, start at 0
     * @returns {FOverGridImageBuilder} The `FOverGridImageBuilder` for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     * ```
     */
    setColumn(column: number): FOverGridImageBuilder {
        this._image.column = column;
        return this;
    }

    /**
     * Set the vertical position of the image
     * @param {number} row - The row index of the image start position, start at 0
     * @returns {FOverGridImageBuilder} The `FOverGridImageBuilder` for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     * ```
     */
    setRow(row: number): FOverGridImageBuilder {
        this._image.row = row;
        return this;
    }

    /**
     * Set the horizontal offset of the image
     * @param {number} offset - The column offset of the image start position, pixel unit
     * @returns {FOverGridImageBuilder} The `FOverGridImageBuilder` for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell and horizontal offset is 10px.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setColumnOffset(10)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     * ```
     */
    setColumnOffset(offset: number): FOverGridImageBuilder {
        this._image.columnOffset = offset;
        return this;
    }

    /**
     * Set the vertical offset of the image
     * @param {number} offset - The row offset of the image start position, pixel unit
     * @returns {FOverGridImageBuilder} The `FOverGridImageBuilder` for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell and vertical offset is 10px.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setRowOffset(10)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     * ```
     */
    setRowOffset(offset: number): FOverGridImageBuilder {
        this._image.rowOffset = offset;
        return this;
    }

    /**
     * Set the width of the image
     * @param {number} width - The width of the image, pixel unit
     * @returns {FOverGridImageBuilder} The `FOverGridImageBuilder` for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell, width is 120px and height is 50px.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setWidth(120)
     *   .setHeight(50)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     * ```
     */
    setWidth(width: number): FOverGridImageBuilder {
        this._image.width = width;
        return this;
    }

    /**
     * Set the height of the image
     * @param {number} height - The height of the image, pixel unit
     * @returns {FOverGridImageBuilder} The `FOverGridImageBuilder` for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell, width is 120px and height is 50px.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setWidth(120)
     *   .setHeight(50)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     * ```
     */
    setHeight(height: number): FOverGridImageBuilder {
        this._image.height = height;
        return this;
    }

    /**
     * Set the anchor type of the image, whether the position and size change with the cell
     * @param {SheetDrawingAnchorType} anchorType - The anchor type of the image
     * @returns {FOverGridImageBuilder} The `FOverGridImageBuilder` for chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // image1 position is start from A6 cell, anchor type is Position.
     * // Only the position of the drawing follows the cell changes. When rows or columns are inserted or deleted, the position of the drawing changes, but the size remains the same.
     * const image1 = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(0)
     *   .setRow(5)
     *   .setAnchorType(univerAPI.Enum.SheetDrawingAnchorType.Position)
     *   .buildAsync();
     *
     * // image2 position is start from C6 cell, anchor type is Both.
     * // The size and position of the drawing follow the cell changes. When rows or columns are inserted or deleted, the size and position of the drawing change accordingly.
     * const image2 = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(2)
     *   .setRow(5)
     *   .setAnchorType(univerAPI.Enum.SheetDrawingAnchorType.Both)
     *   .buildAsync();
     *
     * // image3 position is start from E6 cell, anchor type is None.
     * // The size and position of the drawing do not follow the cell changes. When rows or columns are inserted or deleted, the position and size of the drawing remain unchanged.
     * const image3 = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(4)
     *   .setRow(5)
     *   .setAnchorType(univerAPI.Enum.SheetDrawingAnchorType.None)
     *   .buildAsync();
     *
     * // insert images into the sheet
     * fWorksheet.insertImages([image1, image2, image3]);
     *
     * // after 2 seconds, set the row height of the 5th row to 100px and insert a row before the 5th row.
     * // then observe the position and size changes of the images.
     * setTimeout(() => {
     *   fWorksheet.setRowHeight(5, 100).insertRowBefore(5);
     * }, 2000);
     * ```
     */
    setAnchorType(anchorType: SheetDrawingAnchorType): FOverGridImageBuilder {
        this._image.anchorType = anchorType;
        return this;
    }

    /**
     * Set the cropping region of the image by defining the top edges, thereby displaying the specific part of the image you want.
     * @param {number} top - The number of pixels to crop from the top of the image
     * @returns {FOverGridImageBuilder} The `FOverGridImageBuilder` for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell, top crop is 10px.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setCropTop(10)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     * ```
     */
    setCropTop(top: number): FOverGridImageBuilder {
        this._initializeSrcRect();
        this._image.srcRect!.top = top;
        return this;
    }

    /**
     * Set the cropping region of the image by defining the left edges, thereby displaying the specific part of the image you want.
     * @param {number} left - The number of pixels to crop from the left side of the image
     * @returns {FOverGridImageBuilder} The `FOverGridImageBuilder` for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell, left crop is 10px.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setCropLeft(10)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     * ```
     */
    setCropLeft(left: number): FOverGridImageBuilder {
        this._initializeSrcRect();
        this._image.srcRect!.left = left;
        return this;
    }

    /**
     * Set the cropping region of the image by defining the bottom edges, thereby displaying the specific part of the image you want.
     * @param {number} bottom - The number of pixels to crop from the bottom of the image
     * @returns {FOverGridImageBuilder} The `FOverGridImageBuilder` for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell, bottom crop is 10px.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setCropBottom(10)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     * ```
     */
    setCropBottom(bottom: number): FOverGridImageBuilder {
        this._initializeSrcRect();
        this._image.srcRect!.bottom = bottom;
        return this;
    }

    /**
     * Set the cropping region of the image by defining the right edges, thereby displaying the specific part of the image you want.
     * @param {number} right - The number of pixels to crop from the right side of the image
     * @returns {FOverGridImageBuilder} The `FOverGridImageBuilder` for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell, right crop is 10px.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setCropRight(10)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     * ```
     */
    setCropRight(right: number): FOverGridImageBuilder {
        this._initializeSrcRect();
        this._image.srcRect!.right = right;
        return this;
    }

    private _initializeSrcRect(): void {
        if (this._image.srcRect == null) {
            this._image.srcRect = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
            };
        }
    }

    /**
     * Set the rotation angle of the image
     * @param {number} angle - Degree of rotation of the image, for example, 90, 180, 270, etc.
     * @returns {FOverGridImageBuilder} The `FOverGridImageBuilder` for chaining
     * @example
     * ```ts
     * // create a new image builder and set image source.
     * // then build `ISheetImage` and insert it into the sheet, position is start from F6 cell, rotate 90 degrees.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = await fWorksheet.newOverGridImage()
     *   .setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL)
     *   .setColumn(5)
     *   .setRow(5)
     *   .setRotate(90)
     *   .buildAsync();
     * fWorksheet.insertImages([image]);
     * ```
     */
    setRotate(angle: number): FOverGridImageBuilder {
        this._image.angle = angle;
        return this;
    }

    setUnitId(unitId: string): FOverGridImageBuilder {
        this._image.unitId = unitId;
        return this;
    }

    setSubUnitId(subUnitId: string): FOverGridImageBuilder {
        this._image.subUnitId = subUnitId;
        return this;
    }

    async buildAsync(): Promise<ISheetImage> {
        const renderManagerService = this._injector.get(IRenderManagerService);
        const render = renderManagerService.getRenderById(this._image.unitId);
        if (!render) {
            throw new Error(`Render Unit with unitId ${this._image.unitId} not found`);
        }
        const selectionRenderService = render.with(ISheetSelectionRenderService);
        const skeletonManagerService = render.with(SheetSkeletonManagerService);

        if (this._image.width === 0 || this._image.height === 0) {
            const size = await getImageSize(this._image.source);
            const width = size.width;
            const height = size.height;

            if (this._image.width === 0) {
                this._image.width = width;
            }

            if (this._image.height === 0) {
                this._image.height = height;
            }
        }

        return convertFOverGridImageToSheetImage(this._image, selectionRenderService, skeletonManagerService);
    }
}

/**
 * @hideconstructor
 */
export class FOverGridImage extends FBase {
    constructor(
        private _image: ISheetImage,
        @ICommandService protected readonly _commandService: ICommandService,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    /**
     * Get the id of the image
     * @returns {string} The id of the image
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const images = fWorksheet.getImages();
     * images.forEach((image) => {
     *   console.log(image, image.getId());
     * });
     * ```
     */
    getId(): string {
        return this._image.drawingId;
    }

    /**
     * Get the drawing type of the image
     * @returns {DrawingTypeEnum} The drawing type of the image
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const images = fWorksheet.getImages();
     * images.forEach((image) => {
     *   console.log(image, image.getType());
     * });
     * ```
     */
    getType(): DrawingTypeEnum {
        return this._image.drawingType;
    }

    /**
     * Remove the image from the sheet
     * @returns {boolean} true if the image is removed successfully, otherwise false
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = fWorksheet.getImages()[0];
     * const result = image?.remove();
     * console.log(result);
     * ```
     */
    remove(): boolean {
        return this._commandService.syncExecuteCommand(RemoveSheetDrawingCommand.id, { unitId: this._image.unitId, drawings: [this._image] });
    }

    /**
     * Convert the image to a FOverGridImageBuilder
     * @returns {FOverGridImageBuilder} The builder FOverGridImageBuilder
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const images = fWorksheet.getImages();
     * images.forEach((image) => {
     *   console.log(image, image.toBuilder().getSource());
     * });
     * ```
     */
    toBuilder(): FOverGridImageBuilder {
        const builder = this._injector.createInstance(FOverGridImageBuilder);
        builder.setImage(this._image);
        return builder;
    }

    /**
     * Set the source of the image
     * @param {string} source - The source of the image
     * @returns {boolean} true if the source is set successfully, otherwise false
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = fWorksheet.getImages()[0];
     * const result = image?.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4');
     * console.log(result);
     * ```
     */
    setSource(source: string): boolean;
    /**
     * Set the source of the image, change image display.
     * @param {string} source - The source of the image
     * @param {ImageSourceType} [sourceType] - The source type of the image, default is URL
     * @returns {boolean} true if the source is set successfully, otherwise false
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = fWorksheet.getImages()[0];
     * const result = image?.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4', univerAPI.Enum.ImageSourceType.URL);
     * console.log(result);
     * ```
     */
    setSource(source: string, sourceType?: ImageSourceType): boolean;
    setSource(source: string, sourceType?: ImageSourceType): boolean {
        const sourceTypeVal = sourceType ?? ImageSourceType.URL;
        this._image.source = source;
        this._image.imageSourceType = sourceTypeVal;
        return this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._image.unitId, drawings: [this._image] });
    }

    /**
     * Set the position of the image
     * @param {number} row - The row index of the image start position
     * @param {number} column - The column index of the image start position
     * @returns {boolean} true if the position is set successfully, otherwise false
     * @example
     * ```ts
     * // set the position of the image, the start position is F6 cell.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = fWorksheet.getImages()[0];
     * const result = image?.setPositionAsync(5, 5);
     * console.log(result);
     * ```
     */
    async setPositionAsync(row: number, column: number): Promise<boolean>;
    /**
     * @param {number} row - The row index of the image start position
     * @param {number} column - The column index of the image start position
     * @param {number} rowOffset - The row offset of the image start position, pixel unit
     * @param {number} columnOffset - The column offset of the image start position, pixel unit
     * @returns {boolean} true if the position is set successfully, otherwise false
     * @example
     * ```ts
     * // set the position of the image, the start position is F6 cell, and the offset is 10px.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = fWorksheet.getImages()[0];
     * const result = image?.setPositionAsync(5, 5, 10, 10);
     * console.log(result);
     * ```
     */
    async setPositionAsync(row: number, column: number, rowOffset?: number, columnOffset?: number): Promise<boolean>;
    async setPositionAsync(row: number, column: number, rowOffset?: number, columnOffset?: number): Promise<boolean> {
        const builder = this.toBuilder();
        builder.setColumn(column);
        builder.setRow(row);
        if (rowOffset != null) {
            builder.setRowOffset(rowOffset);
        }
        if (columnOffset != null) {
            builder.setColumnOffset(columnOffset);
        }
        const param = await builder.buildAsync();
        return this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._image.unitId, drawings: [param] });
    }

    /**
     * Set the size of the image
     * @param {number} width - The width of the image, pixel unit
     * @param {number} height - The height of the image, pixel unit
     * @returns {boolean} true if the size is set successfully, otherwise false
     * @example
     * ```ts
     * // set the image width 120px and height 50px
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = fWorksheet.getImages()[0];
     * const result = image?.setSizeAsync(120, 50);
     * console.log(result);
     * ```
     */
    async setSizeAsync(width: number, height: number): Promise<boolean> {
        const builder = this.toBuilder();
        builder.setWidth(width);
        builder.setHeight(height);
        const param = await builder.buildAsync();
        return this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._image.unitId, drawings: [param] });
    }

    /**
     * Set the cropping region of the image by defining the top, bottom, left, and right edges, thereby displaying the specific part of the image you want.
     * @param {number} top - The number of pixels to crop from the top of the image
     * @param {number} left - The number of pixels to crop from the left side of the image
     * @param {number} bottom - The number of pixels to crop from the bottom of the image
     * @param {number} right - The number of pixels to crop from the right side of the image
     * @returns {boolean} true if the crop is set successfully, otherwise false
     * @example
     * ```ts
     * // set the crop of the image, top 10px, left 10px, bottom 10px, right 10px.
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = fWorksheet.getImages()[0];
     * const result = image?.setCrop(10, 10, 10, 10);
     * console.log(result);
     * ```
     */
    setCrop(top?: number, left?: number, bottom?: number, right?: number): boolean {
        if (this._image.srcRect == null) {
            this._image.srcRect = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
            };
        }

        if (top != null) {
            this._image.srcRect.top = top;
        }

        if (left != null) {
            this._image.srcRect.left = left;
        }

        if (bottom != null) {
            this._image.srcRect.bottom = bottom;
        }

        if (right != null) {
            this._image.srcRect.right = right;
        }

        return this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._image.unitId, drawings: [this._image] });
    }

    /**
     * Set the rotation angle of the image
     * @param {number} angle - Degree of rotation of the image, for example, 90, 180, 270, etc.
     * @returns {boolean} true if the rotation is set successfully, otherwise false
     * @example
     * ```ts
     * // set 90 degrees rotation of the image
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = fWorksheet.getImages()[0];
     * const result = image?.setRotate(90);
     * console.log(result);
     * ```
     */
    setRotate(angle: number): boolean {
        this._image.sheetTransform.angle = angle;
        this._image.transform && (this._image.transform.angle = angle);
        return this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._image.unitId, drawings: [this._image] });
    }

    /**
     * Move the image layer forward by one level
     * @returns {boolean} true if the image is moved forward successfully, otherwise false
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = fWorksheet.getImages()[0];
     * const result = image?.setForward();
     * console.log(result);
     * ```
     */
    setForward(): boolean {
        return this._commandService.syncExecuteCommand(SetDrawingArrangeCommand.id, {
            unitId: this._image.unitId,
            subUnitId: this._image.subUnitId,
            drawingIds: [this._image.drawingId],
            arrangeType: ArrangeTypeEnum.forward,
        });
    }

    /**
     * Move the image layer backward by one level
     * @returns {boolean} true if the image is moved backward successfully, otherwise false
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = fWorksheet.getImages()[0];
     * const result = image?.setBackward();
     * console.log(result);
     * ```
     */
    setBackward(): boolean {
        return this._commandService.syncExecuteCommand(SetDrawingArrangeCommand.id, {
            unitId: this._image.unitId,
            subUnitId: this._image.subUnitId,
            drawingIds: [this._image.drawingId],
            arrangeType: ArrangeTypeEnum.backward,
        });
    }

    /**
     * Move the image layer to the bottom layer
     * @returns {boolean} true if the image is moved to the bottom layer successfully, otherwise false
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = fWorksheet.getImages()[0];
     * const result = image?.setBack();
     * console.log(result);
     * ```
     */
    setBack(): boolean {
        return this._commandService.syncExecuteCommand(SetDrawingArrangeCommand.id, {
            unitId: this._image.unitId,
            subUnitId: this._image.subUnitId,
            drawingIds: [this._image.drawingId],
            arrangeType: ArrangeTypeEnum.back,
        });
    }

    /**
     * Move the image layer to the top layer
     * @returns {boolean} true if the image is moved to the top layer successfully, otherwise false
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const image = fWorksheet.getImages()[0];
     * const result = image?.setFront();
     * console.log(result);
     * ```
     */
    setFront(): boolean {
        return this._commandService.syncExecuteCommand(SetDrawingArrangeCommand.id, {
            unitId: this._image.unitId,
            subUnitId: this._image.subUnitId,
            drawingIds: [this._image.drawingId],
            arrangeType: ArrangeTypeEnum.front,
        });
    }
}
