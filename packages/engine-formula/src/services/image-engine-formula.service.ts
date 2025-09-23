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

import type { ICellData } from '@univerjs/core';
import type { IStringValueObjectOptions } from '../engine/value-object/primitive-object';
import { BooleanNumber, BuildTextUtils, CellValueType, createDocumentModelWithStyle, createIdentifier, Disposable, DrawingTypeEnum, generateRandomId, ImageSourceType, IUniverInstanceService, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType, WrapTextType } from '@univerjs/core';
import { ErrorType } from '../basics/error-type';

export interface IImageEngineFormulaService {
    generateCellValue(imageInfo: IStringValueObjectOptions['imageInfo'], unitId: string, subUnitId: string): ICellData;
}

/**
 *
 */
export class ImageEngineFormulaService extends Disposable implements IImageEngineFormulaService {
    private _errorValueCell: ICellData = {
        v: ErrorType.VALUE,
        t: CellValueType.STRING,
    };

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
    }

    generateCellValue(imageInfo: IStringValueObjectOptions['imageInfo'], unitId: string, subUnitId: string): ICellData {
        if (!imageInfo) return this._errorValueCell;

        const { source, altText, sizing, height, width } = imageInfo;
        // const { width: imageWidth, height: imageHeight, image } = await this._getImageSize(source);

        // if (!image) return this._errorValueCell;

        const docDataModel = createDocumentModelWithStyle('', {});
        const docDrawingParam = {
            unitId,
            subUnitId,
            drawingId: generateRandomId(),
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.URL,
            source,
            transform: {
                left: 0,
                top: 0,
                width,
                height,
            },
            docTransform: {
                size: {
                    width,
                    height,
                },
                positionH: {
                    relativeFrom: ObjectRelativeFromH.PAGE,
                    posOffset: 0,
                },
                positionV: {
                    relativeFrom: ObjectRelativeFromV.PARAGRAPH,
                    posOffset: 0,
                },
                angle: 0,
            },
            behindDoc: BooleanNumber.FALSE,
            title: '',
            description: '',
            layoutType: PositionedObjectLayoutType.INLINE, // Insert inline drawing by default.
            wrapText: WrapTextType.BOTH_SIDES,
            distB: 0,
            distL: 0,
            distR: 0,
            distT: 0,
        };
        const jsonXActions = BuildTextUtils.drawing.add({
            documentDataModel: docDataModel,
            drawings: [docDrawingParam],
            selection: {
                collapsed: true,
                startOffset: 0,
                endOffset: 0,
            },
        });

        if (jsonXActions) {
            docDataModel.apply(jsonXActions);

            return {
                p: docDataModel.getSnapshot(),
            };
        }

        return this._errorValueCell;
    }

    private async _getImageSize(src: string): Promise<Required<{
        width: number;
        height: number;
        image: HTMLImageElement | null;
    }>> {
        return new Promise((resolve) => {
            const image = new Image();
            image.src = src;
            image.onload = () => {
                resolve({
                    width: image.width,
                    height: image.height,
                    image,
                });
            };
            image.onerror = () => {
                resolve({
                    width: 0,
                    height: 0,
                    image: null,
                });
            };
        });
    };
}

export const IImageEngineFormulaService = createIdentifier<ImageEngineFormulaService>(
    'univer.formula.image-engine-formula.service'
);
