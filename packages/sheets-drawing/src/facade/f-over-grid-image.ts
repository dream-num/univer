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

import type { PresetGeometryType } from '@univerjs/core';
import type { ISheetImage, SheetDrawingAnchorType } from '../services/sheet-drawing.service';
import { DrawingTypeEnum, FBase, generateRandomId, ImageSourceType } from '@univerjs/core';

export class FOverGridImageBuilder {
    private _image: ISheetImage;

    constructor() {
        this._image = {
            drawingId: generateRandomId(6),
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.BASE64,
            source: '',
            unitId: '',
            subUnitId: '',
            sheetTransform: {
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
            },
        };
    }

    setSource(source: string): this;
    setSource(source: string, sourceType?: ImageSourceType): this;
    setSource(source: string, sourceType?: ImageSourceType): this {
        const sourceTypeVal = sourceType ?? ImageSourceType.BASE64;
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

    setFromColumn(column: number): this {
        this._image.sheetTransform.from.column = column;
        return this;
    }

    setFromRow(row: number): this {
        this._image.sheetTransform.from.row = row;
        return this;
    }

    setFromColumnOffset(offset: number): this {
        this._image.sheetTransform.from.columnOffset = offset;
        return this;
    }

    setFromRowOffset(offset: number): this {
        this._image.sheetTransform.from.rowOffset = offset;
        return this;
    }

    setToColumn(column: number): this {
        this._image.sheetTransform.to.column = column;
        return this;
    }

    setToRow(row: number): this {
        this._image.sheetTransform.to.row = row;
        return this;
    }

    setToColumnOffset(offset: number): this {
        this._image.sheetTransform.to.columnOffset = offset;
        return this;
    }

    setToRowOffset(offset: number): this {
        this._image.sheetTransform.to.rowOffset = offset;
        return this;
    }

    setAnchorType(anchorType: SheetDrawingAnchorType): this {
        this._image.anchorType = anchorType;
        return this;
    }

    setCropTop(top: number): this {
        this._initializeSrcRect();
        this._image.srcRect!.top = top;
        return this;
    }

    setCropLeft(left: number): this {
        this._initializeSrcRect();
        this._image.srcRect!.left = left;
        return this;
    }

    setCropBottom(bottom: number): this {
        this._initializeSrcRect();
        this._image.srcRect!.bottom = bottom;
        return this;
    }

    setCropRight(right: number): this {
        this._initializeSrcRect();
        this._image.srcRect!.right = right;
        return this;
    }

    private _initializeSrcRect() {
        if (this._image.srcRect == null) {
            this._image.srcRect = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
            };
        }
    }

    setPresetGeometry(prstGeom: PresetGeometryType): this {
        this._image.prstGeom = prstGeom;
        return this;
    }

    build(): ISheetImage {
        return this._image;
    }
}

export class FOverGridImage extends FBase {
    constructor(private _image: ISheetImage) {
        super();
    }

    getId(): string {
        return this._image.drawingId;
    }

    getType(): DrawingTypeEnum {
        return this._image.drawingType;
    }
}
