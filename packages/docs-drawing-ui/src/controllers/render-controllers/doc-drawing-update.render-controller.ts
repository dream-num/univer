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

import type { DocumentDataModel, ICommandInfo, IDocDrawingPosition, IDrawingParam, Nullable } from '@univerjs/core';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import type { IImageIoServiceParam } from '@univerjs/drawing';
import type { Documents, Image, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { IInsertDrawingCommandParams } from '../../commands/commands/interfaces';
import type { ISetDrawingArrangeCommandParams } from '../../commands/commands/set-drawing-arrange.command';
import { BooleanNumber, Disposable, DrawingTypeEnum, FOCUSING_COMMON_DRAWINGS, ICommandService, IContextService, Inject, LocaleService, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType, WrapTextType } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { DocSelectionManagerService, DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { IDocDrawingService } from '@univerjs/docs-drawing';
import { docDrawingPositionToTransform, DocSelectionRenderService } from '@univerjs/docs-ui';
import { DRAWING_IMAGE_ALLOW_IMAGE_LIST, DRAWING_IMAGE_ALLOW_SIZE, DRAWING_IMAGE_COUNT_LIMIT, DRAWING_IMAGE_HEIGHT_LIMIT, DRAWING_IMAGE_WIDTH_LIMIT, getDrawingShapeKeyByDrawingSearch, getImageSize, IDrawingManagerService, IImageIoService, ImageUploadStatusType } from '@univerjs/drawing';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';

import { ILocalFileService, IMessageService } from '@univerjs/ui';
import { debounceTime } from 'rxjs';
import { GroupDocDrawingCommand } from '../../commands/commands/group-doc-drawing.command';
import { InsertDocDrawingCommand } from '../../commands/commands/insert-doc-drawing.command';
import { SetDocDrawingArrangeCommand } from '../../commands/commands/set-drawing-arrange.command';
import { UngroupDocDrawingCommand } from '../../commands/commands/ungroup-doc-drawing.command';
import { DocRefreshDrawingsService } from '../../services/doc-refresh-drawings.service';

export class DocDrawingUpdateRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocSelectionManagerService) private readonly _docSelectionManagerService: DocSelectionManagerService,
        @IRenderManagerService private readonly _renderManagerSrv: IRenderManagerService,
        @IImageIoService private readonly _imageIoService: IImageIoService,
        @IDocDrawingService private readonly _docDrawingService: IDocDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IContextService private readonly _contextService: IContextService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(DocSelectionRenderService) private readonly _docSelectionRenderService: DocSelectionRenderService,
        @Inject(DocRefreshDrawingsService) private readonly _docRefreshDrawingsService: DocRefreshDrawingsService,
        @ILocalFileService private readonly _fileOpenerService: ILocalFileService
    ) {
        super();

        this._updateOrderListener();
        this._groupDrawingListener();
        this._focusDrawingListener();
        this._transformDrawingListener();
        this._editAreaChangeListener();
    }

    async insertDocImage(): Promise<boolean> {
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

        await this._insertFloatImages(files);
        return true;
    }

    // eslint-disable-next-line max-lines-per-function
    private async _insertFloatImages(files: File[]) {
        let imageParams: Nullable<IImageIoServiceParam>[] = [];

        try {
            imageParams = await Promise.all(files.map((file) => this._imageIoService.saveImage(file)));
        } catch (error) {
            const type = (error as Error).message;
            let content = '';

            switch (type) {
                case ImageUploadStatusType.ERROR_EXCEED_SIZE:
                    content = this._localeService.t('update-status.exceedMaxSize', String(DRAWING_IMAGE_ALLOW_SIZE / (1024 * 1024)));
                    break;
                case ImageUploadStatusType.ERROR_IMAGE_TYPE:
                    content = this._localeService.t('update-status.invalidImageType');
                    break;
                case ImageUploadStatusType.ERROR_IMAGE:
                    content = this._localeService.t('update-status.invalidImage');
                    break;
                default:
                    break;
            }

            this._messageService.show({
                type: MessageType.Error,
                content,
            });
        }

        if (imageParams.length === 0) {
            return;
        }

        const { unitId } = this._context;
        const docDrawingParams: IDocDrawing[] = [];

        for (const imageParam of imageParams) {
            if (imageParam == null) {
                continue;
            }
            const { imageId, imageSourceType, source, base64Cache } = imageParam;
            const { width, height, image } = await getImageSize(base64Cache || '');

            this._imageIoService.addImageSourceCache(imageId, imageSourceType, image);

            let scale = 1;
            if (width > DRAWING_IMAGE_WIDTH_LIMIT || height > DRAWING_IMAGE_HEIGHT_LIMIT) {
                const scaleWidth = DRAWING_IMAGE_WIDTH_LIMIT / width;
                const scaleHeight = DRAWING_IMAGE_HEIGHT_LIMIT / height;
                scale = Math.min(scaleWidth, scaleHeight);
            }

            const docTransform = this._getImagePosition(width * scale, height * scale);

            if (docTransform == null) {
                return;
            }

            const docDrawingParam: IDocDrawing = {
                unitId,
                subUnitId: unitId,
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

            const isInHeaderFooter = this._isInsertInHeaderFooter();

            if (isInHeaderFooter) {
                docDrawingParam.isMultiTransform = BooleanNumber.TRUE;
                docDrawingParam.transforms = docDrawingParam.transform ? [docDrawingParam.transform] : null;
            }

            docDrawingParams.push(docDrawingParam);
        }

        this._commandService.executeCommand(InsertDocDrawingCommand.id, {
            unitId,
            drawings: docDrawingParams,
        } as IInsertDrawingCommandParams);
    }

    private _isInsertInHeaderFooter() {
        const { unitId } = this._context;
        const viewModel = this._renderManagerSrv.getRenderById(unitId)
            ?.with(DocSkeletonManagerService)
            .getViewModel();

        const editArea = viewModel?.getEditArea();

        return editArea === DocumentEditArea.HEADER || editArea === DocumentEditArea.FOOTER;
    }

    private _getImagePosition(
        imageWidth: number,
        imageHeight: number
    ): Nullable<IDocDrawingPosition> {
        const activeTextRange = this._docSelectionRenderService.getActiveTextRange();
        // TODO: NO need to get the cursor position, because the insert image is inline.
        const position = activeTextRange?.getAbsolutePosition() || {
            left: 0,
            top: 0,
        };

        return {
            size: {
                width: imageWidth,
                height: imageHeight,
            },
            positionH: {
                relativeFrom: ObjectRelativeFromH.PAGE,
                posOffset: position.left,
            },
            positionV: {
                relativeFrom: ObjectRelativeFromV.PARAGRAPH,
                posOffset: 0,
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

    private _groupDrawingListener() {
        this._drawingManagerService.featurePluginGroupUpdate$.subscribe((params) => {
            this._commandService.executeCommand(GroupDocDrawingCommand.id, params);
        });

        this._drawingManagerService.featurePluginUngroupUpdate$.subscribe((params) => {
            this._commandService.executeCommand(UngroupDocDrawingCommand.id, params);
        });
    }

    private _getCurrentSceneAndTransformer() {
        const { scene, mainComponent } = this._context;

        if (scene == null || mainComponent == null) {
            return;
        }

        const transformer = scene.getTransformerByCreate();

        const { docsLeft, docsTop } = (mainComponent as Documents).getOffsetConfig();

        return { scene, transformer, docsLeft, docsTop };
    }

    private _transformDrawingListener() {
        const res = this._getCurrentSceneAndTransformer();
        if (res && res.transformer) {
            this.disposeWithMe(res.transformer.changeEnd$.pipe(debounceTime(30)).subscribe((params) => {
                this._docSelectionManagerService.refreshSelection();
            }));
        } else {
            throw new Error('transformer is not init');
        }
    }

    private _focusDrawingListener() {
        this.disposeWithMe(
            this._drawingManagerService.focus$.subscribe((params) => {
                const { transformer, docsLeft, docsTop } = this._getCurrentSceneAndTransformer() ?? {};
                if (params == null || params.length === 0) {
                    this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
                    this._docDrawingService.focusDrawing([]);

                    if (transformer) {
                        transformer.resetProps({
                            zeroTop: 0,
                            zeroLeft: 0,
                        });
                    }
                } else {
                    this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);
                    this._docDrawingService.focusDrawing(params);
                    this._setDrawingSelections(params);
                    const prevSegmentId = this._docSelectionRenderService.getSegment();
                    const segmentId = this._findSegmentIdByDrawingId(params[0].drawingId);

                    // Change segmentId when click drawing in different segment.
                    if (prevSegmentId !== segmentId) {
                        this._docSelectionRenderService.setSegment(segmentId);
                    }

                    if (transformer) {
                        transformer.resetProps({
                            zeroTop: docsTop,
                            zeroLeft: docsLeft,
                        });
                    }
                }
            })
        );
    }

    private _findSegmentIdByDrawingId(drawingId: string) {
        const { unit: DocDataModel } = this._context;

        const { body, headers = {}, footers = {} } = DocDataModel.getSnapshot();

        const bodyCustomBlocks = body?.customBlocks ?? [];

        if (bodyCustomBlocks.some((b) => b.blockId === drawingId)) {
            return '';
        }

        for (const headerId of Object.keys(headers)) {
            if (headers[headerId].body.customBlocks?.some((b) => b.blockId === drawingId)) {
                return headerId;
            }
        }

        for (const footerId of Object.keys(footers)) {
            if (footers[footerId].body.customBlocks?.some((b) => b.blockId === drawingId)) {
                return footerId;
            }
        }

        return '';
    }

    // Update drawings edit status and opacity. You can not edit header footer images when you are editing body. and vice verse.
    private _updateDrawingsEditStatus() {
        const { unit: docDataModel, scene, unitId } = this._context;
        const viewModel = this._renderManagerSrv
            .getRenderById(unitId)
            ?.with(DocSkeletonManagerService)
            .getViewModel();

        if (viewModel == null || docDataModel == null) {
            return;
        }

        const snapshot = docDataModel.getSnapshot();
        const { drawings = {} } = snapshot;
        const isEditBody = viewModel.getEditArea() === DocumentEditArea.BODY;

        for (const key of Object.keys(drawings)) {
            const drawing = drawings[key];
            const objectKey = getDrawingShapeKeyByDrawingSearch({ unitId, drawingId: drawing.drawingId, subUnitId: unitId });
            const drawingShapes = scene.fuzzyMathObjects(objectKey, true);

            if (drawingShapes.length) {
                for (const shape of drawingShapes) {
                    scene.detachTransformerFrom(shape);
                    try {
                        (shape as Image).setOpacity(0.5);
                    } catch (e) {
                    }
                    if (
                        (isEditBody && drawing.isMultiTransform !== BooleanNumber.TRUE)
                        || (!isEditBody && drawing.isMultiTransform === BooleanNumber.TRUE)
                    ) {
                        if (drawing.allowTransform !== false) {
                            scene.attachTransformerTo(shape);
                        }

                        try {
                            (shape as Image).setOpacity(1);
                        } catch (e) {
                        }
                    }
                }
            }
        }
    }

    private _editAreaChangeListener() {
        const { unitId } = this._context;
        const viewModel = this._renderManagerSrv
            .getRenderById(unitId)
            ?.with(DocSkeletonManagerService)
            .getViewModel();

        if (viewModel == null) {
            return;
        }

        this._updateDrawingsEditStatus();

        this.disposeWithMe(
            viewModel.editAreaChange$.subscribe(() => {
                this._updateDrawingsEditStatus();
            })
        );

        this._docRefreshDrawingsService.refreshDrawings$.subscribe((skeleton) => {
            if (skeleton == null) {
                return;
            }

            // To wait the image is rendered.
            queueMicrotask(() => {
                this._updateDrawingsEditStatus();
            });
        });

        this.disposeWithMe(
            this._commandService.onCommandExecuted(async (command: ICommandInfo) => {
                if (command.id === RichTextEditingMutation.id) {
                    // To wait the image is rendered.
                    queueMicrotask(() => {
                        this._updateDrawingsEditStatus();
                    });
                }
            })
        );
    }

    private _setDrawingSelections(params: IDrawingParam[]) {
        const { unit } = this._context;
        const customBlocks = unit.getSnapshot().body?.customBlocks ?? [];
        const ranges = params.map((item) => {
            const id = item.drawingId;
            const block = customBlocks.find((b) => b.blockId === id);
            if (block) {
                return block.startIndex;
            }
            return null;
        }).filter((e) => e !== null).map((offset) => ({ startOffset: offset, endOffset: offset + 1 }));
        this._docSelectionManagerService.replaceDocRanges(ranges);
    }
}
