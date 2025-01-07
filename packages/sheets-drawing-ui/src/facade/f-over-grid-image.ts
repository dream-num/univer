/**
 * Copyright 2023-present DreamNum Inc.
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
import { ArrangeTypeEnum, DrawingTypeEnum, FBase, generateRandomId, ICommandService, ImageSourceType, Inject, Injector } from '@univerjs/core';
import { getImageSize } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SetDrawingArrangeCommand, SetSheetDrawingCommand } from '@univerjs/sheets-drawing-ui';
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
        sheetImage.unitId, sheetImage.subUnitId, { from, to }, sheetSkeletonManagerService
    );

    const { left, top, width, height } = absolutePosition;

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
        fOverGridImage.unitId, fOverGridImage.subUnitId, { column: fromColumn, columnOffset: fromColumnOffset, row: fromRow, rowOffset: fromRowOffset }, width, height, selectionRenderService, sheetSkeletonManagerService
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
     * @param image The image to be set. {@link ISheetImage}
     * @returns The builder. {@link FOverGridImageBuilder}
     * @example
     * ```ts
     * // create a new image builder.
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const imageBuilder = activeSheet.newOverGridImage();
     * const param = await imageBuilder.setImage({
     *    drawingId: '123456',
     *    drawingType: univerAPI.Enum.DrawingType.DRAWING_IMAGE,
     *    imageSourceType: univerAPI.Enum.ImageSourceType.BASE64,
     *    source: 'https://avatars.githubusercontent.com/u/61444807?s=48&v=4',
     *    unitId: activeSpreadsheet.getId(),
     *    subUnitId: activeSheet.getSheetId(),
     * }).setColumn(5).setRow(5).buildAsync();
     * activeSheet.insertImages([param]);
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
     * Set the unit id of the image
     * @param unitId The unit id of the image
     * @returns The builder
     * @example
     * ```ts
     * // create a new image builder.
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const imageBuilder = activeSheet.newOverGridImage();
     * const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).buildAsync();
     * activeSheet.insertImages([param]);
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

    getsource(): string {
        return this._image.source;
    }

    getSourceType(): ImageSourceType {
        return this._image.imageSourceType;
    }

    /**
     * Set the position of the image
     * @param column  The sheet start column of the image
     * @returns The builder.  {@link FOverGridImageBuilder}
     * @example
     * ```ts
     * // create a new image builder.
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const imageBuilder = activeSheet.newOverGridImage();
     * const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).buildAsync();
     * activeSheet.insertImages([param]);
     * ```
     */
    setColumn(column: number): FOverGridImageBuilder {
        this._image.column = column;
        return this;
    }

    /**
     * Set the position of the image
     * @param row The sheet start row of the image
     * @returns The builder.  {@link FOverGridImageBuilder}
     * @example
     * ```ts
     * // create a new image builder.
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const imageBuilder = activeSheet.newOverGridImage();
     * const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).buildAsync();
     * activeSheet.insertImages([param]);
     * ```
     */
    setRow(row: number): FOverGridImageBuilder {
        this._image.row = row;
        return this;
    }

    /**
     * Set the column offset of the image in a unit
     * @param offset The offset in pixels
     * @returns The builder.  {@link FOverGridImageBuilder}
     * @example
     * ```ts
     * // create a new image builder.
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const imageBuilder = activeSheet.newOverGridImage();
     * const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).setColumnOffset(10).setRowOffset(10).buildAsync();
     * activeSheet.insertImages([param]);
     * ```
     */
    setColumnOffset(offset: number): FOverGridImageBuilder {
        this._image.columnOffset = offset;
        return this;
    }

    /**
     * Set the row offset of the image in a unit
     * @param offset The offset in pixels
     * @returns The builder.  {@link FOverGridImageBuilder}
     * @example
     * ```ts
     * // create a new image builder.
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const imageBuilder = activeSheet.newOverGridImage();
     * const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).setColumnOffset(10).setRowOffset(10).buildAsync();
     * activeSheet.insertImages([param]);
     * ```
     */
    setRowOffset(offset: number): FOverGridImageBuilder {
        this._image.rowOffset = offset;
        return this;
    }

    /**
     * set the width of the image
     * @param width The width of the image, in pixels
     * @returns The builder.  {@link FOverGridImageBuilder}
     * @example
     * ```ts
     * // create a new image builder.
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const imageBuilder = activeSheet.newOverGridImage();
     * const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).setWidth(120).setHeight(50).buildAsync();
     * activeSheet.insertImages([param]);
     * ```
     */
    setWidth(width: number): FOverGridImageBuilder {
        this._image.width = width;
        return this;
    }

    /**
     * Set the height of the image
     * @param height The height of the image, in pixels
     * @returns The builder.  {@link FOverGridImageBuilder}
     * @example
     * ```ts
     * // create a new image builder.
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const imageBuilder = activeSheet.newOverGridImage();
     * const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).setWidth(120).setHeight(50).buildAsync();
     * activeSheet.insertImages([param]);
     * ```
     */
    setHeight(height: number): FOverGridImageBuilder {
        this._image.height = height;
        return this;
    }

    /**
     * Set the anchor type of the image, whether the position and size change with the cell
     * @param anchorType The anchor type {@link SheetDrawingAnchorType}
     * @returns The builder.  {@link FOverGridImageBuilder}
     * @example
     * ```ts
     * // create a new image builder.
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const imageBuilder = activeSheet.newOverGridImage();
     * const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).setAnchorType(univerAPI.Enum.SheetDrawingAnchorType.None).buildAsync();
     * activeSheet.insertImages([param]);
     * ```
     */
    setAnchorType(anchorType: SheetDrawingAnchorType): FOverGridImageBuilder {
        this._image.anchorType = anchorType;
        return this;
    }

    /**
     * Set the cropping region of the image by defining the top edges, thereby displaying the specific part of the image you want.
     * @param top  The number of pixels to crop from the top of the image.
     * @returns The builder.  {@link FOverGridImageBuilder}
     * @example
     * ```ts
     * // create a new image builder.
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const imageBuilder = activeSheet.newOverGridImage();
     * const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).setCropTop(10).setCropLeft(10).setCropBottom(10).setCropRight(10).buildAsync();
     * activeSheet.insertImages([param]);
     * ```
     */
    setCropTop(top: number): FOverGridImageBuilder {
        this._initializeSrcRect();
        this._image.srcRect!.top = top;
        return this;
    }

    /**
     * Set the cropping region of the image by defining the left edges, thereby displaying the specific part of the image you want.
     * @param left  The number of pixels to crop from the left side of the image.
     * @returns The builder.  {@link FOverGridImageBuilder}
     * @example
     * ```ts
     * // create a new image builder.
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const imageBuilder = activeSheet.newOverGridImage();
     * const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).setCropTop(10).setCropLeft(10).setCropBottom(10).setCropRight(10).buildAsync();
     * activeSheet.insertImages([param]);
     * ```
     */
    setCropLeft(left: number): FOverGridImageBuilder {
        this._initializeSrcRect();
        this._image.srcRect!.left = left;
        return this;
    }

    /**
     * Set the cropping region of the image by defining the bottom edges, thereby displaying the specific part of the image you want.
     * @param bottom  The number of pixels to crop from the bottom of the image.
     * @returns The builder.  {@link FOverGridImageBuilder}
     * @example
     * ```ts
     * // create a new image builder.
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const imageBuilder = activeSheet.newOverGridImage();
     * const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).setCropTop(10).setCropLeft(10).setCropBottom(10).setCropRight(10).buildAsync();
     * activeSheet.insertImages([param]);
     * ```
     */
    setCropBottom(bottom: number): FOverGridImageBuilder {
        this._initializeSrcRect();
        this._image.srcRect!.bottom = bottom;
        return this;
    }

    /**
     * Set the cropping region of the image by defining the right edges, thereby displaying the specific part of the image you want.
     * @param right  The number of pixels to crop from the right side of the image.
     * @returns The builder.  {@link FOverGridImageBuilder}
     * @example
     * ```ts
     * // create a new image builder.
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const imageBuilder = activeSheet.newOverGridImage();
     * const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).setCropTop(10).setCropLeft(10).setCropBottom(10).setCropRight(10).buildAsync();
     * activeSheet.insertImages([param]);
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
     * @param angle Degree of rotation of the image, for example, 90, 180, 270, etc.
     * @returns The builder {@link FOverGridImageBuilder}
     * @example
     * ```ts
     * // create a new image builder.
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const imageBuilder = activeSheet.newOverGridImage();
     * const param = await imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).setRotate(90).buildAsync();
     * activeSheet.insertImages([param]);
     * ```
     */
    setRotate(angle: number): FOverGridImageBuilder {
        this._image.angle = angle;
        return this;
    }

    // setPresetGeometry(prstGeom: PresetGeometryType): FOverGridImageBuilder {
    //     this._image.prstGeom = prstGeom;
    //     return this;
    // }

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

export class FOverGridImage extends FBase {
    constructor(
        private _image: ISheetImage,
        @ICommandService protected readonly _commandService: ICommandService,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    getId(): string {
        return this._image.drawingId;
    }

    getType(): DrawingTypeEnum {
        return this._image.drawingType;
    }

    /**
     * Remove the image from the sheet
     * @returns success or not
     * @example
     * ```ts
     * // remove the image from the sheet
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const image = activeSheet.getImages()[0];
     * console.log('Delete state is ', image?.remove());
     * ```
     */
    remove(): boolean {
        return this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._image.unitId, drawings: [this._image] });
    }

    /**
     * Convert the image to a FOverGridImageBuilder
     * @returns The builder FOverGridImageBuilder
     * @example
     * ```ts
     * // convert the image to a builder
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const image = activeSheet.getImages()[0];
     * const builder = image.toBuilder();
     * const param = await builder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).buildAsync();
     * activeSheet.updateImages([param]);
     * ```
     */
    toBuilder(): FOverGridImageBuilder {
        const builder = this._injector.createInstance(FOverGridImageBuilder);
        builder.setImage(this._image);
        return builder;
    }

    /**
     * Set the source of the image
     * @param source The source of the image
     * @returns success or not
     * @example
     * ```ts
     * // set the source of the image
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const image = activeSheet.getImages()[0];
     * console.log('Set source state is ', image.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4'));
     */
    setSource(source: string): boolean;
    /**
     * Set the source of the image, change image display.
     * @param source  The source of the image
     * @param sourceType The source type of the image, {@link ImageSourceType}
     * @returns success or not
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
     * @param row  The sheet start row of the image
     * @param column The sheet start column of the image
     * @returns success or not
     * @example
     * ```ts
     *  // set the position of the image
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const image = activeSheet.getImages()[0];
     * console.log('Set position state is ', image.setPosition(5, 5));
     * ```
     */
    async setPositionAsync(row: number, column: number): Promise<boolean>;
    /**
     *
     * @param column  The sheet start column of the image
     * @param row  The sheet start row of the image
     * @param rowOffset  The offset of the start row
     * @param columnOffset  The offset of the start column
     * @returns success or not
     * @example
     * ```ts
     * // set the position of the image
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const image = activeSheet.getImages()[0];
     * console.log('Set position state is ', image.setPosition(5, 5, 10, 10));
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
     * @param width  The width of the image
     * @param height  The height of the image
     * @returns success or not
     * @example
     * ```ts
     * // set the size of the image
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const image = activeSheet.getImages()[0];
     * console.log('Set size state is ', image.setSize(50, 120));
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
     * @param top  The number of pixels to crop from the top of the image.
     * @param left  The number of pixels to crop from the left side of the image.
     * @param bottom  The number of pixels to crop from the bottom of the image.
     * @param right  The number of pixels to crop from the right side of the image.
     * @returns success or not
     * @example
     * ```ts
     * // set the crop of the image
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const image = activeSheet.getImages()[0];
     * console.log('Set crop state is ', image.setCrop(10, 10, 10, 10));
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

    // setPresetGeometry(prstGeom: PresetGeometryType): boolean {
    //     this._image.prstGeom = prstGeom;
    //     return this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._image.unitId, drawings: [this._image] });
    // }

    /**
     * Set the rotation angle of the image
     * @param angle Degree of rotation of the image, for example, 90, 180, 270, etc.
     * @returns success or not
     * @example
     * ```ts
     * // set the rotation angle of the image
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const image = activeSheet.getImages()[0];
     * console.log('Set rotate state is ', image.setRotate(90));
     * ```
     */
    setRotate(angle: number): boolean {
        this._image.sheetTransform.angle = angle;
        return this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._image.unitId, drawings: [this._image] });
    }

    /**
     * Move the image layer forward by one level
     * @returns success or not
     * @example
     * ```ts
     * // move the image forward
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const image = activeSheet.getImages()[0];
     * console.log('Move forward state is ', image.setForward());
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
     * @returns success or not
     * @example
     * ```ts
     * // move the image backward
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const image = activeSheet.getImages()[0];
     * console.log('Move backward state is ', image.setBackward());
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
     * Move the image layer to the back
     * @returns success or not
     * @example
     * ```ts
     * // move the image to the back
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const image = activeSheet.getImages()[0];
     * console.log('Move back state is ', image.setBack());
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
     * Move the image layer to the front
     * @returns success or not
     * @example
     * ```ts
     * // move the image to the front
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * const image = activeSheet.getImages()[0];
     * console.log('Move front state is ', image.setFront());
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
