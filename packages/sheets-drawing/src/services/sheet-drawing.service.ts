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

import type { DrawingTypeEnum, IDrawingParam, IRotationSkewFlipTransform, Serializable } from '@univerjs/core';
import type { IDrawingJsonUndo1, IImageData, IUnitDrawingService } from '@univerjs/drawing';
import type { ISheetOverGridPosition } from '@univerjs/sheets';
import { createIdentifier, Optional } from '@univerjs/core';
import { UnitDrawingService } from '@univerjs/drawing';
import { SheetSkeletonService } from '@univerjs/sheets';
import { normalizeSheetDrawing } from './sheet-drawing-placement';

export enum SheetDrawingAnchorType {
    /**
     * Only the position of the drawing follows the cell changes. When rows or columns are inserted or deleted, the position of the drawing changes, but the size remains the same.
     */
    Position = '0',

    /**
     * The size and position of the drawing follow the cell changes. When rows or columns are inserted or deleted, the size and position of the drawing change accordingly.
     */
    Both = '1',

    /**
     * The size and position of the drawing do not follow the cell changes. When rows or columns are inserted or deleted, the position and size of the drawing remain unchanged.
     */
    None = '2',
}

export interface ISheetDrawingPosition extends IRotationSkewFlipTransform, ISheetOverGridPosition {

}

export interface ISheetDrawingBase {
    /** @deprecated Legacy unrotated cell rectangle. Use axisAlignSheetTransform and transform. */
    sheetTransform?: ISheetDrawingPosition;
    /**
     * Excel's major-axis cell rectangle. Both uses both markers and Position
     * uses the start marker with transform.width/height,
     * while None uses transform directly. Group children retain relative transforms.
     * Orientation fields on legacy markers are deprecated. Read and write them on transform.
     */
    axisAlignSheetTransform: ISheetDrawingPosition;
    /** Defaults to Position: the drawing moves with cells while retaining its size. */
    anchorType?: SheetDrawingAnchorType;
}

export interface ISheetImage extends IImageData, ISheetDrawingBase {

}

/**
 * test type
 */
export interface ISheetShape extends IDrawingParam, ISheetDrawingBase {

}

/** Canvas-hosted spreadsheet filter whose business definition lives in its owning feature resource. */
export interface ISheetSlicerDrawing extends IDrawingParam, ISheetDrawingBase {
    drawingType: DrawingTypeEnum.DRAWING_SLICER | DrawingTypeEnum.DRAWING_TIMELINE;
    slicerViewId: string;
}

export interface IFloatDomData extends IDrawingParam {
    componentKey: string;
    data?: Serializable;
    allowTransform?: boolean;
     /**
      * Excel's cell anchor rectangle.
      */
    axisAlignSheetTransform: ISheetDrawingPosition;
}

// TODO@wzhudev: this shouldn't be here. It should be in the sheets package
export interface ISheetFloatDom extends IFloatDomData, ISheetDrawingBase { }

export type ISheetDrawing = ISheetImage | ISheetShape | ISheetFloatDom | ISheetSlicerDrawing;

export type ISheetUpdateDrawing = ISheetImage | ISheetShape;

export class SheetDrawingService extends UnitDrawingService<ISheetDrawing> {
    constructor(@Optional(SheetSkeletonService) private readonly _sheetSkeletonService?: SheetSkeletonService) {
        super();
    }

    override getBatchAddOp(drawings: ISheetDrawing[]) {
        return super.getBatchAddOp(drawings.map((drawing) => this._normalizeDrawing(drawing)));
    }

    override getBatchUpdateOp(drawings: ISheetDrawing[]) {
        return super.getBatchUpdateOp(drawings.map((drawing) => {
            if (!drawing.sheetTransform) return this._normalizeDrawing(drawing);
            const current = this.getDrawingByParam(drawing);
            return this._normalizeDrawing({
                ...current,
                ...drawing,
                transform: { ...current?.transform, ...drawing.transform },
                axisAlignSheetTransform: drawing.axisAlignSheetTransform,
            });
        }));
    }

    private _normalizeDrawing(drawing: ISheetDrawing): ISheetDrawing {
        const hasGeometry = drawing.axisAlignSheetTransform?.from && drawing.transform?.width != null && drawing.transform.height != null;
        const skeleton = drawing.sheetTransform && !hasGeometry && drawing.anchorType !== SheetDrawingAnchorType.None && !drawing.groupId
            ? this._sheetSkeletonService?.ensureSkeleton(drawing.unitId, drawing.subUnitId)
            : undefined;
        const normalized = normalizeSheetDrawing(drawing, skeleton);
        if (!normalized.sheetTransform) {
            const { sheetTransform: _legacy, ...model } = normalized;
            return model as ISheetDrawing;
        }
        return normalized;
    }
}

export interface ISheetDrawingService extends IUnitDrawingService<ISheetDrawing> {
    getBatchUpdateOp(updateParams: ISheetDrawing[]): IDrawingJsonUndo1;
}

export const ISheetDrawingService = createIdentifier<ISheetDrawingService>('sheets-drawing.sheet-drawing.service');
