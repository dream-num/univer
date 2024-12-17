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

import type { ISheetImage, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { DrawingTypeEnum, FBase, generateRandomId, ICommandService, ImageSourceType, Inject, Injector } from '@univerjs/core';
import { getImageSize } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SetSheetDrawingCommand } from '@univerjs/sheets-drawing-ui';
import { convertPositionCellToSheetOverGrid, convertPositionSheetOverGridToAbsolute, ISheetSelectionRenderService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';

export interface IFOverGridImage extends Omit<ISheetImage, 'sheetTransform' | 'transform'> {
    column: number;
    columnOffset: number;
    row: number;
    rowOffset: number;
    width: number;
    height: number;

    flipY?: boolean;
    flipX?: boolean;
    angle?: number;
    skewX?: number;
    skewY?: number;
}

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

    setImage(image: ISheetImage): FOverGridImageBuilder {
        const renderManagerService = this._injector.get(IRenderManagerService);
        const render = renderManagerService.getRenderById(image.unitId);
        if (!render) {
            throw new Error(`Render Unit with unitId ${image.unitId} not found`);
        }
        const skeletonManagerService = render.with(SheetSkeletonManagerService);

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
     * const param = imageBuilder.setSource('https://avatars.githubusercontent.com/u/61444807?s=48&v=4').setColumn(5).setRow(5).build();
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

    setColumn(column: number): FOverGridImageBuilder {
        this._image.column = column;
        return this;
    }

    setRow(row: number): FOverGridImageBuilder {
        this._image.row = row;
        return this;
    }

    setColumnOffset(offset: number): FOverGridImageBuilder {
        this._image.columnOffset = offset;
        return this;
    }

    setRowOffset(offset: number): FOverGridImageBuilder {
        this._image.rowOffset = offset;
        return this;
    }

    setWidth(width: number): FOverGridImageBuilder {
        this._image.width = width;
        return this;
    }

    setHeight(height: number): FOverGridImageBuilder {
        this._image.height = height;
        return this;
    }

    setAnchorType(anchorType: SheetDrawingAnchorType): FOverGridImageBuilder {
        this._image.anchorType = anchorType;
        return this;
    }

    setCropTop(top: number): FOverGridImageBuilder {
        this._initializeSrcRect();
        this._image.srcRect!.top = top;
        return this;
    }

    setCropLeft(left: number): FOverGridImageBuilder {
        this._initializeSrcRect();
        this._image.srcRect!.left = left;
        return this;
    }

    setCropBottom(bottom: number): FOverGridImageBuilder {
        this._initializeSrcRect();
        this._image.srcRect!.bottom = bottom;
        return this;
    }

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

    async build(): Promise<ISheetImage> {
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

    remove(): boolean {
        return this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._image.unitId, drawings: [this._image] });
    }

    toBuilder(): FOverGridImageBuilder {
        const builder = this._injector.createInstance(FOverGridImageBuilder);
        builder.setImage(this._image);
        return builder;
    }

    setSource(source: string): boolean;
    setSource(source: string, sourceType?: ImageSourceType): boolean;
    setSource(source: string, sourceType?: ImageSourceType): boolean {
        const sourceTypeVal = sourceType ?? ImageSourceType.URL;
        this._image.source = source;
        this._image.imageSourceType = sourceTypeVal;
        return this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._image.unitId, drawings: [this._image] });
    }

    setPosition(column: number, row: number): boolean;
    setPosition(column: number, row: number, rowOffset?: number, columnOffset?: number): boolean;
    setPosition(column: number, row: number, rowOffset?: number, columnOffset?: number): boolean {
        const builder = this.toBuilder();
        builder.setColumn(column);
        builder.setRow(row);
        if (rowOffset != null) {
            builder.setRowOffset(rowOffset);
        }
        if (columnOffset != null) {
            builder.setColumnOffset(columnOffset);
        }
        return this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._image.unitId, drawings: [builder.build()] });
    }

    setSize(width: number, height: number): boolean {
        const builder = this.toBuilder();
        builder.setWidth(width);
        builder.setHeight(height);
        return this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._image.unitId, drawings: [builder.build()] });
    }

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

    setRotate(angle: number): FOverGridImageBuilder {
        this._image.sheetTransform.angle = angle;
        return this._commandService.syncExecuteCommand(SetSheetDrawingCommand.id, { unitId: this._image.unitId, drawings: [this._image] });
    }
}
