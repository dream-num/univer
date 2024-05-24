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

import type { DocumentDataModel, ICommandInfo, IDocDrawingPosition, IRange, Nullable, Workbook } from '@univerjs/core';
import { Disposable, DrawingTypeEnum, FOCUSING_COMMON_DRAWINGS, ICommandService, IContextService, IDrawingManagerService, IImageRemoteService, ImageUploadStatusType, IUniverInstanceService, LifecycleStages, LocaleService, ObjectRelativeFromH, ObjectRelativeFromV, OnLifecycle, PositionedObjectLayoutType, UniverInstanceType } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import type { IImageData } from '@univerjs/drawing';
import { getImageSize } from '@univerjs/drawing';
import { IMessageService } from '@univerjs/ui';
import { MessageType } from '@univerjs/design';
import type { IDocDrawing } from '@univerjs/Docs';
import { IDocDrawingService, TextSelectionManagerService } from '@univerjs/Docs';
import { drawingPositionToTransform, transformToDrawingPosition } from '@univerjs/docs-ui';
import { ITextSelectionRenderManager } from '@univerjs/engine-render';
import type { IInsertImageOperationParams } from '../commands/operations/insert-image.operation';
import { InsertDocImageOperation } from '../commands/operations/insert-image.operation';
import type { IInsertDrawingCommandParams, ISetDrawingCommandParams } from '../commands/commands/interfaces';
import { type ISetDrawingArrangeCommandParams, SetDocDrawingArrangeCommand } from '../commands/commands/set-drawing-arrange.command';
import { InsertDocDrawingCommand } from '../commands/commands/insert-doc-drawing.command';
import { GroupDocDrawingCommand } from '../commands/commands/group-doc-drawing.command';
import { UngroupDocDrawingCommand } from '../commands/commands/ungroup-doc-drawing.command';

const SHEET_IMAGE_WIDTH_LIMIT = 500;
const SHEET_IMAGE_HEIGHT_LIMIT = 500;

@OnLifecycle(LifecycleStages.Rendered, DocDrawingUpdateController)
export class DocDrawingUpdateController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @IImageRemoteService private readonly _imageRemoteService: IImageRemoteService,
        @IDocDrawingService private readonly _sheetDrawingService: IDocDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IContextService private readonly _contextService: IContextService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._initCommandListeners();

        this._updateImageListener();

        this._updateOrderListener();

        this._groupDrawingListener();

        this._focusDrawingListener();
    }

    /**
     * Upload image to cell or float image
     */
    private _initCommandListeners() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted(async (command: ICommandInfo) => {
                if (command.id === InsertDocImageOperation.id) {
                    const params = command.params as IInsertImageOperationParams;
                    if (params.files == null) {
                        return;
                    }

                    this._imageRemoteService.setWaitCount(params.files.length);

                    params.files.forEach(async (file) => {
                        await this._insertFloatImage(file);
                    });
                }
            })
        );
    }

    private async _insertFloatImage(file: File) {
        const imageParam = await this._imageRemoteService.saveImage(file);

        if (imageParam == null) {
            return;
        }

        if (imageParam.status === ImageUploadStatusType.ERROR_EXCEED_SIZE) {
            this._messageService.show({
                type: MessageType.Error,
                content: this._localeService.t('update-status.exceedMaxSize'),
            });
        } else if (imageParam.status === ImageUploadStatusType.ERROR_IMAGE_TYPE) {
            this._messageService.show({
                type: MessageType.Error,
                content: this._localeService.t('update-status.invalidImageType'),
            });
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

        const { imageId, imageSourceType, source, base64Cache } = imageParam;

        // if (imageSourceType === ImageSourceType.UUID) {
        //     try {
        //         source = await this._imageRemoteService.getImage(imageId);
        //     } catch (error) {
        //         console.error(error);
        //     }
        // }

        const { width, height, image } = await getImageSize(base64Cache || '');

        this._imageRemoteService.addImageSourceCache(imageId, imageSourceType, image);

        let scale = 1;
        if (width > SHEET_IMAGE_WIDTH_LIMIT || height > SHEET_IMAGE_HEIGHT_LIMIT) {
            const scaleWidth = SHEET_IMAGE_WIDTH_LIMIT / width;
            const scaleHeight = SHEET_IMAGE_HEIGHT_LIMIT / height;
            scale = Math.max(scaleWidth, scaleHeight);
        }

        const docTransform = this._getImagePosition(width, height, scale);

        if (docTransform == null) {
            return;
        }

        const docDrawingParam: IDocDrawing = {
            unitId,
            subUnitId,
            drawingId: imageId,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType,
            source,
            transform: drawingPositionToTransform(docTransform, this._textSelectionRenderManager),
            docTransform,
            title: '', description: '', layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
        };

        this._commandService.executeCommand(InsertDocDrawingCommand.id, {
            unitId,
            drawings: [docDrawingParam],
        } as IInsertDrawingCommandParams);
    }

    private _getUnitInfo() {
        const documentDataModel = this._univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (documentDataModel == null) {
            return;
        }

        const unitId = documentDataModel.getUnitId();
        const subUnitId = unitId;

        return {
            unitId,
            subUnitId,
        };
    }

    private _getImagePosition(imageWidth: number, imageHeight: number, scale: number): Nullable<IDocDrawingPosition> {
        const activeTextRange = this._textSelectionManagerService.getActiveRange();
        // TODO:RANSIX calculate the position of the image in doc

        return {
            size: {
                width: imageWidth * scale,
                height: imageHeight * scale,
            },
            positionH: {
                relativeFrom: ObjectRelativeFromH.MARGIN,
                posOffset: 100,
            },
            positionV: {
                relativeFrom: ObjectRelativeFromV.PAGE,
                posOffset: 230,
            },
            angle: 0,
        };
    }

    private _updateOrderListener() {
        this._drawingManagerService.featurePluginOrderUpdate$.subscribe((params) => {
            const { unitId, subUnitId, drawingIds, arrangeType } = params;

            this._commandService.executeCommand(SetDocDrawingArrangeCommand.id, {
                unitId,
                subUnitId,
                drawingIds,
                arrangeType,
            } as ISetDrawingArrangeCommandParams);
        });
    }

    private _updateImageListener() {
        this._drawingManagerService.featurePluginUpdate$.subscribe((params) => {
            const drawings: Partial<IDocDrawing>[] = [];

            if (params.length === 0) {
                return;
            }

            (params as IImageData[]).forEach((param) => {
                const { unitId, subUnitId, drawingId, drawingType, transform } = param;
                if (transform == null) {
                    return;
                }

                const sheetDrawing = this._sheetDrawingService.getDrawingByParam({ unitId, subUnitId, drawingId });

                if (sheetDrawing == null) {
                    return;
                }

                const sheetTransform = transformToDrawingPosition({ ...sheetDrawing.transform, ...transform }, this._textSelectionRenderManager);

                if (sheetTransform == null) {
                    return;
                }

                const newDrawing: Partial<IDocDrawing> = {
                    ...param,
                    transform: { ...transform, ...drawingPositionToTransform(sheetTransform, this._textSelectionRenderManager) },
                    docTransform: { ...sheetTransform },
                };

                drawings.push(newDrawing);
            });

            if (drawings.length > 0) {
                this._commandService.executeCommand(InsertDocDrawingCommand.id, {
                    unitId: params[0].unitId,
                    drawings,
                } as ISetDrawingCommandParams);
            }
        });
    }

    private _groupDrawingListener() {
        this._drawingManagerService.featurePluginGroupUpdate$.subscribe((params) => {
            this._commandService.executeCommand(GroupDocDrawingCommand.id, params);
        });

        this._drawingManagerService.featurePluginUngroupUpdate$.subscribe((params) => {
            this._commandService.executeCommand(UngroupDocDrawingCommand.id, params);
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
