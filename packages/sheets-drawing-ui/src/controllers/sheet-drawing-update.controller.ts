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
import type { IImageData } from '@univerjs/drawing';
import { getImageSize } from '@univerjs/drawing';
import type { ISheetDrawing, ISheetDrawingPosition } from '@univerjs/sheets';
import { ISheetDrawingService, SelectionManagerService } from '@univerjs/sheets';
import { ISelectionRenderService } from '@univerjs/sheets-ui';
import type { IInsertImageOperationParams } from '../commands/operations/insert-image.operation';
import { InsertCellImageOperation, InsertFloatImageOperation } from '../commands/operations/insert-image.operation';
import { InsertSheetDrawingCommand } from '../commands/commands/insert-sheet-drawing.command';
import type { IInsertDrawingCommandParams, ISetDrawingCommandParams } from '../commands/commands/interfaces';
import { SetSheetDrawingCommand } from '../commands/commands/set-sheet-drawing.command';
import type { ISetDrawingArrangeCommandParams } from '../commands/commands/set-drawing-arrange.command';
import { SetDrawingArrangeCommand } from '../commands/commands/set-drawing-arrange.command';
import { GroupSheetDrawingCommand } from '../commands/commands/group-sheet-drawing.command';
import { UngroupSheetDrawingCommand } from '../commands/commands/ungroup-sheet-drawing.command';
import { transformDrawingPositionToTransform, transformToDrawingPosition } from './utils';

const SHEET_IMAGE_WIDTH_LIMIT = 500;
const SHEET_IMAGE_HEIGHT_LIMIT = 500;

@OnLifecycle(LifecycleStages.Rendered, SheetDrawingUpdateController)
export class SheetDrawingUpdateController extends Disposable {
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

        this._updateOrderListener();

        this._groupDrawingListener();
    }

    /**
     * Upload image to cell or float image
     */
    private _initCommandListeners() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted(async (command: ICommandInfo) => {
                if (command.id === InsertCellImageOperation.id || command.id === InsertFloatImageOperation.id) {
                    const params = command.params as IInsertImageOperationParams;
                    if (params.files == null) {
                        return;
                    }

                    if (command.id === InsertCellImageOperation.id) {
                        params.files.forEach(async (file) => {
                            await this._insertCellImage(file);
                        });
                    } else {
                        params.files.forEach(async (file) => {
                            await this._insertFloatImage(file);
                        });
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
            scale = Math.max(scaleWidth, scaleHeight);
        }

        const sheetTransform = this._getImagePosition(width, height, scale);

        if (sheetTransform == null) {
            return;
        }

        const sheetDrawingParam: ISheetDrawing = {
            unitId,
            subUnitId,
            drawingId: imageId,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType,
            source,
            transform: transformDrawingPositionToTransform(sheetTransform, this._selectionRenderService),
            sheetTransform,
        };

        this._commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId,
            drawings: [sheetDrawingParam],
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
            columnOffset: startX + imageWidth * scale - endSelectionCell.startX,
            row: endSelectionCell.actualRow,
            rowOffset: startY + imageHeight * scale - endSelectionCell.startY,
        };

        return {
            from,
            to,
        };
    }

    private _updateOrderListener() {
        this._drawingManagerService.featurePluginOrderUpdate$.subscribe((params) => {
            const { unitId, subUnitId, drawingIds, arrangeType } = params;

            this._commandService.executeCommand(SetDrawingArrangeCommand.id, {
                unitId,
                subUnitId,
                drawingIds,
                arrangeType,
            } as ISetDrawingArrangeCommandParams);
        });
    }

    private _updateImageListener() {
        this._drawingManagerService.featurePluginUpdate$.subscribe((params) => {
            const drawings: Partial<ISheetDrawing>[] = [];

            if (params.length === 0) {
                return;
            }

            (params as IImageData[]).forEach((param) => {
                const { unitId, subUnitId, drawingId, drawingType, transform } = param;
                if (transform == null) {
                    return;
                }

                const sheetDrawing = this._sheetDrawingService.getDrawingByParam({ unitId, subUnitId, drawingId });

                // const imageDrawing = this._drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId });

                if (sheetDrawing == null) {
                    return;
                }

                const sheetTransform = transformToDrawingPosition({ ...sheetDrawing.transform, ...transform }, this._selectionRenderService);

                if (sheetTransform == null) {
                    return;
                }

                // const oldDrawing: Partial<ISheetDrawing> = {
                //     ...sheetDrawing,
                // };

                const newDrawing: Partial<ISheetDrawing> = {
                    unitId, subUnitId, drawingId, drawingType,
                    transform: { ...transform, ...transformDrawingPositionToTransform(sheetTransform, this._selectionRenderService) },
                    sheetTransform: { ...sheetTransform },
                };

                drawings.push(newDrawing);
            });

            if (drawings.length > 0) {
                this._commandService.executeCommand(SetSheetDrawingCommand.id, {
                    unitId: params[0].unitId,
                    drawings,
                } as ISetDrawingCommandParams);
            }
        });
    }

    private _groupDrawingListener() {
        this._drawingManagerService.featurePluginGroupUpdate$.subscribe((params) => {
            this._commandService.executeCommand(GroupSheetDrawingCommand.id, params);
        });

        this._drawingManagerService.featurePluginUngroupUpdate$.subscribe((params) => {
            this._commandService.executeCommand(UngroupSheetDrawingCommand.id, params);
        });
    }
}
