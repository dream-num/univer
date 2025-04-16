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

import type { IAccessor, IRange, Nullable, Workbook } from '@univerjs/core';
import type { IImageData, IImageIoServiceParam } from '@univerjs/drawing';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { ISheetLocationBase, WorkbookSelectionModel } from '@univerjs/sheets';
import type { ISheetDrawing, ISheetDrawingPosition } from '@univerjs/sheets-drawing';
import type { IInsertDrawingCommandParams, ISetDrawingCommandParams } from '../commands/commands/interfaces';
import type { ISetDrawingArrangeCommandParams } from '../commands/commands/set-drawing-arrange.command';
import { BooleanNumber, BuildTextUtils, createDocumentModelWithStyle, Disposable, DrawingTypeEnum, FOCUSING_COMMON_DRAWINGS, generateRandomId, ICommandService, IContextService, ImageSourceType, Inject, Injector, LocaleService, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType, WrapTextType } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { docDrawingPositionToTransform } from '@univerjs/docs-ui';
import { DRAWING_IMAGE_ALLOW_IMAGE_LIST, DRAWING_IMAGE_ALLOW_SIZE, DRAWING_IMAGE_COUNT_LIMIT, DRAWING_IMAGE_HEIGHT_LIMIT, DRAWING_IMAGE_WIDTH_LIMIT, getImageSize, IDrawingManagerService, IImageIoService, ImageUploadStatusType, SetDrawingSelectedOperation } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SetRangeValuesCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { ISheetDrawingService } from '@univerjs/sheets-drawing';
import { attachRangeWithCoord, ISheetSelectionRenderService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { ILocalFileService, IMessageService } from '@univerjs/ui';
import { drawingPositionToTransform, transformToDrawingPosition } from '../basics/transform-position';
import { GroupSheetDrawingCommand } from '../commands/commands/group-sheet-drawing.command';
import { InsertSheetDrawingCommand } from '../commands/commands/insert-sheet-drawing.command';
import { SetDrawingArrangeCommand } from '../commands/commands/set-drawing-arrange.command';
import { SetSheetDrawingCommand } from '../commands/commands/set-sheet-drawing.command';
import { UngroupSheetDrawingCommand } from '../commands/commands/ungroup-sheet-drawing.command';

/**
 * Calculate the bounding box after rotation
 * @param {number} width  Width
 * @param {number} height Height
 * @param {number} angleDegrees Rotation angle in degrees (0-360)
 * @returns {{ rotatedWidth: number; rotatedHeight: number }} Rotated width and height
 */
function rotatedBoundingBox(width: number, height: number, angleDegrees: number): { rotatedWidth: number; rotatedHeight: number } {
    const angle = angleDegrees * Math.PI / 180; // Convert angle to radians
    const rotatedWidth = Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle));
    const rotatedHeight = Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle));
    return { rotatedWidth, rotatedHeight };
}

/**
 * Get the size of the drawing within the cell
 * @param {IAccessor} accessor Accessor
 * @param {ISheetLocationBase} location Cell location
 * @param {number} originImageWidth Original image width
 * @param {number} originImageHeight Original image height
 * @param {number} angle Rotation angle in degrees (0-360)
 * @returns {{ width: number; height: number }} Drawing size
 */
export function getDrawingSizeByCell(
    accessor: IAccessor,
    location: ISheetLocationBase,
    originImageWidth: number,
    originImageHeight: number,
    angle: number
) {
    const { rotatedHeight, rotatedWidth } = rotatedBoundingBox(originImageWidth, originImageHeight, angle);
    const renderManagerService = accessor.get(IRenderManagerService);
    const currentRender = renderManagerService.getRenderById(location.unitId);
    if (!currentRender) {
        return false;
    }
    const skeletonManagerService = currentRender.with(SheetSkeletonManagerService);
    const skeleton = skeletonManagerService.getSkeletonParam(location.subUnitId)?.skeleton;
    if (skeleton == null) {
        return false;
    }
    const cellInfo = skeleton.getCellByIndex(location.row, location.col);

    const cellWidth = cellInfo.mergeInfo.endX - cellInfo.mergeInfo.startX - 2;
    const cellHeight = cellInfo.mergeInfo.endY - cellInfo.mergeInfo.startY - 2;
    const imageRatio = rotatedWidth / rotatedHeight;
    const imageWidth = Math.ceil(Math.min(cellWidth, cellHeight * imageRatio));
    const scale = imageWidth / rotatedWidth;
    const realScale = !(scale) || Number.isNaN(scale) ? 0.001 : scale;

    return {
        width: originImageWidth * realScale,
        height: originImageHeight * realScale,
    };
}

export class SheetDrawingUpdateController extends Disposable implements IRenderModule {
    private readonly _workbookSelections: WorkbookSelectionModel;
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
        @Inject(SheetsSelectionsService) selectionManagerService: SheetsSelectionsService,
        @Inject(Injector) private readonly _injector: Injector
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

        files.forEach(async (file) => await this.insertFloatImageByFile(file));
        return true;
    }

    async insertCellImage(): Promise<boolean> {
        const files = await this._fileOpenerService.openFile({
            multiple: false,
            accept: DRAWING_IMAGE_ALLOW_IMAGE_LIST.map((image) => `.${image.replace('image/', '')}`).join(','),
        });
        const file = files[0];
        if (file) {
            await this._insertCellImage(file);
            return true;
        }
        return false;
    }

    insertCellImageByFile(file: File, location?: ISheetLocationBase) {
        return this._insertCellImage(file, location);
    }

    async insertFloatImageByFile(file: File) {
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

        return this._commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId,
            drawings: [sheetDrawingParam],
        } as IInsertDrawingCommandParams);
    }

    // eslint-disable-next-line max-lines-per-function
    private async _insertCellImage(file: File, location?: ISheetLocationBase) {
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
            return false;
        }

        const { imageId, imageSourceType, source, base64Cache } = imageParam;
        const { width, height, image } = await getImageSize(base64Cache || '');
        this._imageIoService.addImageSourceCache(source, imageSourceType, image);
        const selection = this._workbookSelections.getCurrentLastSelection();
        if (!selection) {
            return false;
        }
        const docDataModel = createDocumentModelWithStyle('', {});

        const imageSize = getDrawingSizeByCell(
            this._injector,
            {
                unitId: this._context.unitId,
                subUnitId: this._context.unit.getActiveSheet().getSheetId(),
                row: selection.primary.actualRow,
                col: selection.primary.actualColumn,
            },
            width,
            height,
            0
        );
        if (!imageSize) {
            return false;
        }
        const docTransform = {
            size: {
                width: imageSize.width,
                height: imageSize.height,
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
        };
        const docDrawingParam = {
            unitId: docDataModel.getUnitId(),
            subUnitId: docDataModel.getUnitId(),
            drawingId: imageId,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType,
            source,
            transform: docDrawingPositionToTransform(docTransform),
            docTransform,
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

            return this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, {
                value: {
                    [location?.row ?? selection.primary.actualRow]: {
                        [location?.col ?? selection.primary.actualColumn]: {
                            p: (docDataModel.getSnapshot()),
                            t: 1,
                        },
                    },
                },
                unitId: location?.unitId,
                subUnitId: location?.subUnitId,
            });
        }

        return false;
    }

    // eslint-disable-next-line max-lines-per-function
    async insertCellImageByUrl(url: string, location?: ISheetLocationBase) {
        const { width, height, image } = await getImageSize(url || '');
        this._imageIoService.addImageSourceCache(url, ImageSourceType.URL, image);
        const selection = this._workbookSelections.getCurrentLastSelection();
        if (!selection) {
            return false;
        }
        const docDataModel = createDocumentModelWithStyle('', {});

        const imageSize = getDrawingSizeByCell(
            this._injector,
            {
                unitId: this._context.unitId,
                subUnitId: this._context.unit.getActiveSheet().getSheetId(),
                row: selection.primary.actualRow,
                col: selection.primary.actualColumn,
            },
            width,
            height,
            0
        );
        if (!imageSize) {
            return false;
        }
        const docTransform = {
            size: {
                width: imageSize.width,
                height: imageSize.height,
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
        };
        const docDrawingParam = {
            unitId: docDataModel.getUnitId(),
            subUnitId: docDataModel.getUnitId(),
            drawingId: generateRandomId(),
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.URL,
            source: url,
            transform: docDrawingPositionToTransform(docTransform),
            docTransform,
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
            return this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, {
                value: {
                    [location?.row ?? selection.primary.actualRow]: {
                        [location?.col ?? selection.primary.actualColumn]: {
                            p: (docDataModel.getSnapshot()),
                            t: 1,
                        },
                    },
                },
                unitId: location?.unitId,
                subUnitId: location?.subUnitId,
            });
        }

        return false;
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
        this.disposeWithMe(this._drawingManagerService.featurePluginOrderUpdate$.subscribe((params) => {
            const { unitId, subUnitId, drawingIds, arrangeType } = params;

            this._commandService.executeCommand(SetDrawingArrangeCommand.id, {
                unitId,
                subUnitId,
                drawingIds,
                arrangeType,
            } as ISetDrawingArrangeCommandParams);
        }));
    }

    private _updateImageListener() {
        this.disposeWithMe(this._drawingManagerService.featurePluginUpdate$.subscribe((params) => {
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
        }));
    }

    private _groupDrawingListener() {
        this.disposeWithMe(this._drawingManagerService.featurePluginGroupUpdate$.subscribe((params) => {
            this._commandService.executeCommand(GroupSheetDrawingCommand.id, params);
            const { unitId, subUnitId, drawingId } = params[0].parent;
            this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, [{ unitId, subUnitId, drawingId }]);
        }));

        this.disposeWithMe(this._drawingManagerService.featurePluginUngroupUpdate$.subscribe((params) => {
            this._commandService.executeCommand(UngroupSheetDrawingCommand.id, params);
        }));
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
