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

import type { ICellData, ICommandInfo, Nullable } from '@univerjs/core';
import type { IImageFormulaInfo, IRuntimeImageFormulaDataType, ISetImageFormulaDataMutationParams, IUnitImageFormulaDataType } from '@univerjs/engine-formula';
import { BooleanNumber, BuildTextUtils, CellValueType, createDocumentModelWithStyle, Disposable, DrawingTypeEnum, generateRandomId, ICommandService, ImageSourceType, Inject, InterceptorEffectEnum, ObjectMatrix, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType, WrapTextType } from '@univerjs/core';
import { ErrorType, FormulaDataModel, SetImageFormulaDataMutation } from '@univerjs/engine-formula';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';

export class ImageFormulaCellInterceptorController extends Disposable {
    private _errorValueCell: ICellData = {
        v: ErrorType.VALUE,
        t: CellValueType.STRING,
    };

    private _refreshRender: () => void;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();

        this._initInterceptorCellContent();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted(async (command: ICommandInfo) => {
                // Synchronous data from worker
                if (command.id === SetImageFormulaDataMutation.id) {
                    const params = command.params as ISetImageFormulaDataMutationParams;
                    if (!params) return;

                    const { imageFormulaData } = params;
                    if (!imageFormulaData || imageFormulaData.length === 0) return;

                    const updateRuntimeImageFormulaData = await Promise.all(
                        imageFormulaData.map((imageFormulaInfo) => {
                            return this._getImageNatureSize(imageFormulaInfo);
                        })
                    );

                    const unitImageFormulaData: IUnitImageFormulaDataType = {};

                    updateRuntimeImageFormulaData.forEach((imageFormulaInfo) => {
                        const { unitId, sheetId, row, column, ...imageInfo } = imageFormulaInfo;
                        if (!unitImageFormulaData[unitId]) {
                            unitImageFormulaData[unitId] = {};
                        }
                        if (!unitImageFormulaData[unitId]![sheetId]) {
                            unitImageFormulaData[unitId]![sheetId] = new ObjectMatrix<Nullable<IImageFormulaInfo>>();
                        }
                        unitImageFormulaData[unitId]![sheetId]!.setValue(row, column, imageInfo);
                    });

                    this._formulaDataModel.mergeUnitImageFormulaData(unitImageFormulaData);

                    // Refresh render
                    this._refreshRender();
                }
            })
        );
    }

    // eslint-disable-next-line max-lines-per-function
    private _initInterceptorCellContent() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                priority: 100,
                effect: InterceptorEffectEnum.Value,
                // eslint-disable-next-line max-lines-per-function
                handler: (cell, location, next) => {
                    const { unitId, subUnitId, row, col } = location;
                    const unitImageFormulaData = this._formulaDataModel.getUnitImageFormulaData();
                    const imageInfo = unitImageFormulaData?.[unitId]?.[subUnitId]?.getValue(row, col);

                    if (!imageInfo) {
                        return next(cell);
                    }

                    const {
                        source,
                        // altText,
                        // sizing,
                        height,
                        width,
                        isErrorImage,
                        imageNaturalWidth,
                        imageNaturalHeight,
                    } = imageInfo;

                    // If the image failed to load, return #VALUE! error.
                    if (isErrorImage) {
                        return next(this._errorValueCell);
                    }

                    const finalWidth = width || imageNaturalWidth;
                    const finalHeight = height || imageNaturalHeight;

                    // TODO: @Wpxp123456 - now not support altText and sizing, need to be implemented in the future.

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
                            width: finalWidth,
                            height: finalHeight,
                        },
                        docTransform: {
                            size: {
                                width: finalWidth,
                                height: finalHeight,
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
                        return next({
                            p: docDataModel.getSnapshot(),
                        });
                    }

                    return next(this._errorValueCell);
                },
            })
        );
    }

    private async _getImageNatureSize(imageFormulaInfo: IRuntimeImageFormulaDataType): Promise<IRuntimeImageFormulaDataType> {
        const imageInfo = await this._getImageSize(imageFormulaInfo.source);

        if (!imageInfo.image) {
            return { ...imageFormulaInfo, isErrorImage: true };
        }

        return {
            ...imageFormulaInfo,
            isErrorImage: false,
            imageNaturalHeight: imageInfo.height,
            imageNaturalWidth: imageInfo.width,
        };
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

    registerRefreshRenderFunction(refreshRender: () => void) {
        this._refreshRender = refreshRender;
    }
}
