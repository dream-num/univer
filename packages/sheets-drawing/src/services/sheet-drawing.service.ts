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

import type { IDrawingParam, IRotationSkewFlipTransform, Serializable } from '@univerjs/core';
import type { IImageData, IUnitDrawingService } from '@univerjs/drawing';
import type { ISheetOverGridPosition } from '@univerjs/sheets';
import { createIdentifier } from '@univerjs/core';
import { UnitDrawingService } from '@univerjs/drawing';

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
    sheetTransform: ISheetDrawingPosition;
    anchorType?: SheetDrawingAnchorType;
}

export interface ISheetImage extends IImageData, ISheetDrawingBase {

}

/**
 * test type
 */
export interface ISheetShape extends IDrawingParam, ISheetDrawingBase {

}

export interface IFloatDomData extends IDrawingParam {
    componentKey: string;
    data?: Serializable;
    allowTransform?: boolean;
}

// TODO@wzhudev: this shouldn't be here. It should be in the sheets package
export interface ISheetFloatDom extends IFloatDomData, ISheetDrawingBase {}

export type ISheetDrawing = ISheetImage | ISheetShape | ISheetFloatDom;

type OptionalField<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type ISheetUpdateDrawing = OptionalField<ISheetImage | ISheetShape, 'sheetTransform'>;

export class SheetDrawingService extends UnitDrawingService<ISheetDrawing> {}

export interface ISheetDrawingService extends IUnitDrawingService<ISheetDrawing> {}

export const ISheetDrawingService = createIdentifier<ISheetDrawingService>('sheets-drawing.sheet-drawing.service');
