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

import type { ICommandInfo, IRange, ITransformState, Nullable, Workbook } from '@univerjs/core';
import { Disposable, DrawingTypeEnum, ICommandService, IDrawingManagerService, IImageRemoteService, ImageSourceType, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import type { IImageData } from '@univerjs/image';
import { getImageSize } from '@univerjs/image';
import type { ISheetDrawingPosition, ISheetDrawingServiceParam } from '@univerjs/sheets';
import { ISheetDrawingService, SelectionManagerService } from '@univerjs/sheets';
import { ISelectionRenderService } from '@univerjs/sheets-ui';
import type { IInsertImageOperationParams } from '../commands/operations/insert-image.operation';
import { InsertCellImageOperation, InsertFloatImageOperation } from '../commands/operations/insert-image.operation';
import { InsertSheetImageCommand } from '../commands/commands/insert-sheet-image.command';
import type { IDrawingCommandParams, IInsertDrawingCommandParams, IPartialDrawingCommandParam, ISetDrawingCommandParam, ISetDrawingCommandParams } from '../commands/commands/interfaces';
import { SetSheetImageCommand } from '../commands/commands/set-sheet-image.command';
import { RemoveSheetImageCommand } from '../commands/commands/remove-sheet-image.command';


const SHEET_IMAGE_WIDTH_LIMIT = 1000;
const SHEET_IMAGE_HEIGHT_LIMIT = 1000;

@OnLifecycle(LifecycleStages.Rendered, SheetImageUpdateController)
export class SheetImageUpdateController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @IImageRemoteService private readonly _imageRemoteService: IImageRemoteService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._initCommandListeners();

        this._updateImageListener();
    }

    /**
     * Upload image to cell or float image
     */
    private _initCommandListeners() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted(async (command: ICommandInfo) => {
                if (command.id === InsertCellImageOperation.id || command.id === InsertFloatImageOperation.id) {
                    const params = command.params as IInsertImageOperationParams;
                    if (params.file == null) {
                        return;
                    }

                    if (command.id === InsertCellImageOperation.id) {
                        await this._insertCellImage(params.file);
                    } else {
                        await this._insertFloatImage(params.file);
                    }
                }
            })
        );
    }

    private async _insertCellImage(file: File) {

    }

    private async _insertFloatImage(file: File) {
        const imageParam = await this._imageRemoteService.saveImage(file);
        if (imageParam == null) {
            return;
        }

        const info = this._getUnitInfo();
        if (info == null) {
            return;
        }
        const { unitId, subUnitId } = info;

        // const currentAllDrawing = this._sheetDrawingService.getDrawingMap(unitId, subUnitId);
        // let zIndex = 0;
        // if (currentAllDrawing && Object.keys(currentAllDrawing).length > 0) {
        //     const drawingIds = Object.keys(currentAllDrawing);
        //     zIndex = drawingIds.length;
        // }

        const { imageId, imageSourceType } = imageParam;

        let { source } = imageParam;

        if (imageSourceType === ImageSourceType.UUID) {
            source = await this._imageRemoteService.getImage(imageId);
        }

        const { width, height } = await getImageSize(source);

        let scale = 1;
        if (width > SHEET_IMAGE_WIDTH_LIMIT || height > SHEET_IMAGE_HEIGHT_LIMIT) {
            const scaleWidth = SHEET_IMAGE_WIDTH_LIMIT / width;
            const scaleHeight = SHEET_IMAGE_HEIGHT_LIMIT / height;
            scale = Math.min(scaleWidth, scaleHeight);
        }


        const sheetTransform = this._getImagePosition(width, height, scale);

        if (sheetTransform == null) {
            return;
        }

        const imageDrawingDataParam: IImageData = {
            unitId,
            subUnitId,
            drawingId: imageId,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType,
            source,
            transform: this._transformImagePositionToTransform(sheetTransform),
        };

        const sheetDrawingParam: ISheetDrawingServiceParam = {
            originSize: {
                width,
                height,
            },
            sheetTransform,
            drawingId: imageId,
            unitId,
            subUnitId,
        };


        this._commandService.executeCommand(InsertSheetImageCommand.id, {
            unitId,
            drawings: [{
                sheetDrawingParam,
                drawingParam: imageDrawingDataParam,
            }],
        } as IInsertDrawingCommandParams);
    }

    private _getUnitInfo() {
        const universheet = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (universheet == null) {
            return;
        }

        const worksheet = universheet.getActiveSheet();
        if (worksheet == null) {
            return;
        }

        const unitId = universheet.getUnitId();
        const subUnitId = worksheet.getSheetId();

        return {
            unitId,
            subUnitId,
        };
    }

    private _transformImagePositionToTransform(position: ISheetDrawingPosition): Nullable<ITransformState> {
        const { from, to } = position;
        const { column: fromColumn, columnOffset: fromColumnOffset, row: fromRow, rowOffset: fromRowOffset } = from;
        const { column: toColumn, columnOffset: toColumnOffset, row: toRow, rowOffset: toRowOffset } = to;

        const startSelectionCell = this._selectionRenderService.attachRangeWithCoord({
            startColumn: fromColumn,
            endColumn: fromColumn,
            startRow: fromRow,
            endRow: fromRow,
        });

        if (startSelectionCell == null) {
            return;
        }

        const endSelectionCell = this._selectionRenderService.attachRangeWithCoord({
            startColumn: toColumn,
            endColumn: toColumn,
            startRow: toRow,
            endRow: toRow,
        });

        if (endSelectionCell == null) {
            return;
        }


        const { startX: startSelectionX, startY: startSelectionY } = startSelectionCell;

        const { startX: endSelectionX, startY: endSelectionY } = endSelectionCell;

        const left = startSelectionX + fromColumnOffset;
        const top = startSelectionY + fromRowOffset;

        const width = endSelectionX + toColumnOffset - left;
        const height = endSelectionY + toRowOffset - top;

        return {
            left,
            top,
            width,
            height,
        };
    }

    private _getImagePosition(imageWidth: number, imageHeight: number, scale: number): Nullable<ISheetDrawingPosition> {
        const selections = this._selectionManagerService.getSelections();
        let range: IRange = {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        };
        if (selections && selections.length > 0) {
            range = selections[selections.length - 1].range;
        }

        const rangeWithCoord = this._selectionRenderService.attachRangeWithCoord(range);
        if (rangeWithCoord == null) {
            return;
        }

        const { startColumn, startRow, startX, startY } = rangeWithCoord;


        const from = {
            column: startColumn,
            columnOffset: 0,
            row: startRow,
            rowOffset: 0,
        };

        const endSelectionCell = this._selectionRenderService.getSelectionCellByPosition(startX + imageWidth * scale, startY + imageHeight * scale);

        if (endSelectionCell == null) {
            return;
        }

        const to = {
            column: endSelectionCell.actualColumn,
            columnOffset: startX + imageWidth - endSelectionCell.startX,
            row: endSelectionCell.actualRow,
            rowOffset: startY + imageHeight - endSelectionCell.startY,
        };

        return {
            from,
            to,
        };
    }

    private _updateImageListener() {
        this._drawingManagerService.extraUpdate$.subscribe((params) => {
            const drawings: ISetDrawingCommandParam[] = [];

            if (params.length === 0) {
                return;
            }

            (params as IImageData[]).forEach((param) => {
                const { unitId, subUnitId, drawingId, drawingType, transform } = param;
                if (transform == null) {
                    return;
                }

                const sheetDrawing = this._sheetDrawingService.getDrawingItem({ unitId, subUnitId, drawingId });

                const imageDrawing = this._drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId, drawingType });

                if (sheetDrawing == null || imageDrawing == null) {
                    return;
                }

                const sheetTransform = this._transformToImagePosition(transform);

                if (sheetTransform == null) {
                    return;
                }

                const oldDrawing: IPartialDrawingCommandParam = {
                    sheetDrawingParam: { ...sheetDrawing },
                    drawingParam: { ...imageDrawing },
                };

                const newDrawing: IPartialDrawingCommandParam = {
                    sheetDrawingParam: {
                        sheetTransform: { ...sheetTransform },
                        unitId, subUnitId, drawingId,
                    },
                    drawingParam: {
                        unitId, subUnitId, drawingId, drawingType,
                        transform: { ...transform, ...this._transformImagePositionToTransform(sheetTransform) },
                    },
                };


                drawings.push({
                    newDrawing,
                    oldDrawing,
                });
            });

            if (drawings.length > 0) {
                this._commandService.executeCommand(SetSheetImageCommand.id, {
                    unitId: params[0].unitId,
                    drawings,
                } as ISetDrawingCommandParams);
            }
        });
    }

     // use transform and originSize convert to  ISheetDrawingPosition
    private _transformToImagePosition(transform: ITransformState): Nullable<ISheetDrawingPosition> {
        const { left = 0, top = 0, width = 0, height = 0 } = transform;

        // const selections = this._selectionManagerService.getSelections();
        // let range: IRange = {
        //     startRow: 0,
        //     endRow: 0,
        //     startColumn: 0,
        //     endColumn: 0,
        // };
        // if (selections && selections.length > 0) {
        //     range = selections[selections.length - 1].range;
        // }

        // const rangeWithCoord = this._selectionRenderService.attachRangeWithCoord(range);
        // if (rangeWithCoord == null) {
        //     return;
        // }

        // const { startColumn, startRow, startX, startY } = rangeWithCoord;

        const startSelectionCell = this._selectionRenderService.getSelectionCellByPosition(left, top);

        if (startSelectionCell == null) {
            return;
        }

        const from = {
            column: startSelectionCell.actualColumn,
            columnOffset: left - startSelectionCell.startX,
            row: startSelectionCell.actualRow,
            rowOffset: top - startSelectionCell.startY,
        };


        const endSelectionCell = this._selectionRenderService.getSelectionCellByPosition(left + width, top + height);


        if (endSelectionCell == null) {
            return;
        }

        const to = {
            column: endSelectionCell.actualColumn,
            columnOffset: left + width - endSelectionCell.startX,
            row: endSelectionCell.actualRow,
            rowOffset: top + height - endSelectionCell.startY,
        };

        return {
            from,
            to,
        };
    }

    private _removeImageListener() {

    }
}
