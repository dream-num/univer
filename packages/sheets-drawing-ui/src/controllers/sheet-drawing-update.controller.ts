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

import type { IRange, Nullable, Workbook } from '@univerjs/core';
import type { IImageData, IImageIoServiceParam } from '@univerjs/drawing';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { WorkbookSelections } from '@univerjs/sheets';
import type { ISheetDrawing, ISheetDrawingPosition } from '@univerjs/sheets-drawing';
import type { IInsertDrawingCommandParams, ISetDrawingCommandParams } from '../commands/commands/interfaces';
import type { ISetDrawingArrangeCommandParams } from '../commands/commands/set-drawing-arrange.command';
import { Disposable, FOCUSING_COMMON_DRAWINGS, ICommandService, IContextService, Inject, LocaleService } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { DRAWING_IMAGE_ALLOW_IMAGE_LIST, DRAWING_IMAGE_ALLOW_SIZE, DRAWING_IMAGE_COUNT_LIMIT, DRAWING_IMAGE_HEIGHT_LIMIT, DRAWING_IMAGE_WIDTH_LIMIT, DrawingTypeEnum, getImageSize, IDrawingManagerService, IImageIoService, ImageUploadStatusType } from '@univerjs/drawing';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { ISheetDrawingService } from '@univerjs/sheets-drawing';
import { attachRangeWithCoord, ISheetSelectionRenderService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { ILocalFileService, IMessageService } from '@univerjs/ui';
import { drawingPositionToTransform, transformToDrawingPosition } from '../basics/transform-position';
import { GroupSheetDrawingCommand } from '../commands/commands/group-sheet-drawing.command';
import { InsertSheetDrawingCommand } from '../commands/commands/insert-sheet-drawing.command';
import { SetDrawingArrangeCommand } from '../commands/commands/set-drawing-arrange.command';
import { SetSheetDrawingCommand } from '../commands/commands/set-sheet-drawing.command';
import { UngroupSheetDrawingCommand } from '../commands/commands/ungroup-sheet-drawing.command';

export class SheetDrawingUpdateController extends Disposable implements IRenderModule {
    private readonly _workbookSelections: WorkbookSelections;
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _skeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @ISheetSelectionRenderService private readonly _selectionRenderService: ISheetSelectionRenderService,
        @IImageIoService private readonly _imageIoService: IImageIoService,
        @ILocalFileService private readonly _fileOpenerService: ILocalFileService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IContextService private readonly _contextService: IContextService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(SheetsSelectionsService) selectionManagerService: SheetsSelectionsService
    ) {
        super();

        this._workbookSelections = selectionManagerService.getWorkbookSelections(this._context.unitId);

        this._updateImageListener();
        this._updateOrderListener();
        this._groupDrawingListener();
        this._focusDrawingListener();
    }

    async insertFloatImage(): Promise<boolean> {
        const files = await this._fileOpenerService.openFile({
            multiple: true,
            accept: DRAWING_IMAGE_ALLOW_IMAGE_LIST.map((image) => `.${image.replace('image/', '')}`).join(','),
        });

        const fileLength = files.length;
        if (fileLength > DRAWING_IMAGE_COUNT_LIMIT) {
            this._messageService.show({
                type: MessageType.Error,
                content: this._localeService.t('update-status.exceedMaxCount', String(DRAWING_IMAGE_COUNT_LIMIT)),
            });
            return false;
        } else if (fileLength === 0) {
            return false;
        }

        files.forEach(async (file) => await this._insertFloatImage(file));
        return true;
    }

    private async _insertFloatImage(file: File) {
        let imageParam: Nullable<IImageIoServiceParam>;

        try {
            imageParam = await this._imageIoService.saveImage(file);
        } catch (error) {
            const type = (error as Error).message;
            if (type === ImageUploadStatusType.ERROR_EXCEED_SIZE) {
                this._messageService.show({
                    type: MessageType.Error,
                    content: this._localeService.t('update-status.exceedMaxSize', String(DRAWING_IMAGE_ALLOW_SIZE / (1024 * 1024))),
                });
            } else if (type === ImageUploadStatusType.ERROR_IMAGE_TYPE) {
                this._messageService.show({
                    type: MessageType.Error,
                    content: this._localeService.t('update-status.invalidImageType'),
                });
            } else if (type === ImageUploadStatusType.ERROR_IMAGE) {
                this._messageService.show({
                    type: MessageType.Error,
                    content: this._localeService.t('update-status.invalidImage'),
                });
            }
        }

        if (imageParam == null) {
            return;
        }

        const info = this._getUnitInfo();
        const { unitId, subUnitId } = info;
        const { imageId, imageSourceType, source, base64Cache } = imageParam;
        const { width, height, image } = await getImageSize(base64Cache || '');
        const { width: sceneWidth, height: sceneHeight } = this._context.scene;

        this._imageIoService.addImageSourceCache(source, imageSourceType, image);

        let scale = 1;
        if (width > DRAWING_IMAGE_WIDTH_LIMIT || height > DRAWING_IMAGE_HEIGHT_LIMIT) {
            const scaleWidth = DRAWING_IMAGE_WIDTH_LIMIT / width;
            const scaleHeight = DRAWING_IMAGE_HEIGHT_LIMIT / height;
            scale = Math.max(scaleWidth, scaleHeight);
        }

        const sheetTransform = this._getImagePosition(width * scale, height * scale, sceneWidth, sceneHeight);

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
            transform: drawingPositionToTransform(sheetTransform, this._selectionRenderService, this._skeletonManagerService),
            sheetTransform,
        };

        this._commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId,
            drawings: [sheetDrawingParam],
        } as IInsertDrawingCommandParams);
    }

    private _getUnitInfo() {
        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        return {
            unitId,
            subUnitId,
        };
    }

    private _getImagePosition(imageWidth: number, imageHeight: number, sceneWidth: number, sceneHeight: number): Nullable<ISheetDrawingPosition> {
        const selections = this._workbookSelections.getCurrentSelections();
        let range: IRange = {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        };
        if (selections && selections.length > 0) {
            range = selections[selections.length - 1].range;
        }

        const rangeWithCoord = attachRangeWithCoord(this._skeletonManagerService.getCurrent()!.skeleton, range);
        if (rangeWithCoord == null) {
            return;
        }

        let { startColumn, startRow, startX, startY } = rangeWithCoord;

        let isChangeStart = false;
        if (startX + imageWidth > sceneWidth) {
            startX = sceneWidth - imageWidth;

            if (startX < 0) {
                startX = 0;
                imageWidth = sceneWidth;
            }

            isChangeStart = true;
        }

        if (startY + imageHeight > sceneHeight) {
            startY = sceneHeight - imageHeight;

            if (startY < 0) {
                startY = 0;
                imageHeight = sceneHeight;
            }

            isChangeStart = true;
        }

        if (isChangeStart) {
            const newCoord = this._selectionRenderService.getCellWithCoordByOffset(startX, startY);
            if (newCoord == null) {
                return;
            }
            startX = newCoord.startX;
            startY = newCoord.startY;
            startColumn = newCoord.actualColumn;
            startRow = newCoord.actualRow;
        }

        const from = {
            column: startColumn,
            columnOffset: 0,
            row: startRow,
            rowOffset: 0,
        };

        const endSelectionCell = this._selectionRenderService.getCellWithCoordByOffset(startX + imageWidth, startY + imageHeight);

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

                if (sheetDrawing == null || sheetDrawing.unitId !== this._context.unitId) {
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
                    ...param,
                    transform: { ...sheetDrawing.transform, ...transform, ...drawingPositionToTransform(sheetTransform, this._selectionRenderService, this._skeletonManagerService) },
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
            const { unitId, subUnitId, drawingId } = params[0].parent;
            this._drawingManagerService.focusDrawing([{ unitId, subUnitId, drawingId }]);
        });

        this._drawingManagerService.featurePluginUngroupUpdate$.subscribe((params) => {
            this._commandService.executeCommand(UngroupSheetDrawingCommand.id, params);
        });
    }

    private _focusDrawingListener() {
        this.disposeWithMe(
            this._drawingManagerService.focus$.subscribe((params) => {
                if (params == null || params.length === 0) {
                    this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
                    this._sheetDrawingService.focusDrawing([]);
                } else {
                    this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);
                    this._sheetDrawingService.focusDrawing(params);
                }
            })
        );
    }
}
