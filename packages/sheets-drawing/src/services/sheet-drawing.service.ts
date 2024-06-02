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

import { type IDrawingParam, type IImageData, type IRotationSkewFlipTransform, type IUnitDrawingService, UnitDrawingService } from '@univerjs/drawing';
import { createIdentifier } from '@wendellhu/redi';

interface ICellPosition {
    column: number; // column number
    columnOffset: number; // column offset, unit is EMUs
    row: number; // row number
    rowOffset: number; // row offset, unit is EMUs
}

export enum SheetDrawingAnchorType {
    Position = '0',
    Both = '1',
    None = '2',
}

export interface ISheetDrawingPosition extends IRotationSkewFlipTransform {
    from: ICellPosition;
    to: ICellPosition;
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
}

// TODO@wzhudev: this shouldn't be here. It should be in the sheets package
export interface ISheetFloatDom extends IFloatDomData, ISheetDrawingBase {}

export type ISheetDrawing = ISheetImage | ISheetShape | ISheetFloatDom;

type OptionalField<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type ISheetUpdateDrawing = OptionalField<ISheetImage | ISheetShape, 'sheetTransform'>;

export class SheetDrawingService extends UnitDrawingService<ISheetDrawing> {}

export interface ISheetDrawingService extends IUnitDrawingService<ISheetDrawing> {}

export const ISheetDrawingService = createIdentifier<ISheetDrawingService>('sheets-drawing.sheet-drawing.service');
