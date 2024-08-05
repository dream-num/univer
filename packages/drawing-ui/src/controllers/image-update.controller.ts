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

import type { ICommandInfo, Nullable } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    Inject,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import type { Image, Scene } from '@univerjs/engine-render';
import { CURSOR_TYPE, IRenderManagerService } from '@univerjs/engine-render';
import type { IDrawingSearch, IImageData } from '@univerjs/drawing';
import { DrawingTypeEnum, getDrawingShapeKeyByDrawingSearch, IDrawingManagerService, IImageIoService } from '@univerjs/drawing';
import { IDialogService } from '@univerjs/ui';
import { COMPONENT_IMAGE_VIEWER } from '../views/image-viewer/component-name';
import { ImageResetSizeOperation } from '../commands/operations/image-reset-size.operation';
import { DrawingRenderService } from '../services/drawing-render.service';
import { getCurrentUnitInfo } from './utils';

const IMAGE_VIEWER_DROPDOWN_PADDING = 50;

@OnLifecycle(LifecycleStages.Rendered, ImageUpdateController)
export class ImageUpdateController extends Disposable {
    private _imageInsertCache: Set<string> = new Set();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IDialogService private readonly _dialogService: IDialogService,
        @IImageIoService private readonly _imageIoService: IImageIoService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(DrawingRenderService) private readonly _drawingRenderService: DrawingRenderService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        super.dispose();

        this._imageInsertCache.clear();
    }

    private _initialize() {
        this._recoveryImages();

        this._drawingAddListener();

        this._commandExecutedListener();

        this._imageUpdateListener();
    }

    private _recoveryImages() {
        const drawingList = this._drawingManagerService.drawingManagerData;
        const info = getCurrentUnitInfo(this._currentUniverService);
        if (info == null) {
            return;
        }

        const { unitId: currentUnitId, subUnitId: currentSubUnitId, current } = info;

        if (current.type === UniverInstanceType.UNIVER_DOC) {
            return;
        }

        Object.keys(drawingList).forEach((unitId) => {
            Object.keys(drawingList[unitId]).forEach((subUnitId) => {
                const drawingMap = drawingList[unitId][subUnitId].data;
                if (drawingMap == null || unitId !== currentUnitId || subUnitId !== currentSubUnitId) {
                    return;
                }
                Object.keys(drawingMap).forEach((drawingId) => {
                    const drawing = drawingMap[drawingId];
                    if (drawing) {
                        this._insertImages([{ unitId, subUnitId, drawingId }]);
                    }
                });
            });
        });
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === ImageResetSizeOperation.id) {
                    const params = command.params as IDrawingSearch[];
                    if (params == null) {
                        return;
                    }
                    this._resetImageSize(params);
                }
            })
        );
    }

    private _getSceneAndTransformerByDrawingSearch(unitId: Nullable<string>) {
        if (unitId == null) {
            return;
        }

        const renderObject = this._renderManagerService.getRenderById(unitId);

        const scene = renderObject?.scene;

        if (scene == null) {
            return null;
        }

        const transformer = scene.getTransformerByCreate();

        return { scene, transformer };
    }

    private _resetImageSize(params: IDrawingSearch[]) {
        const updateParams: IImageData[] = [];
        const sceneList: Scene[] = [];

        params.forEach((param) => {
            const { unitId, subUnitId, drawingId } = param;

            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

            if (renderObject == null) {
                return;
            }
            const { scene } = renderObject;

            const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

            const imageShape = scene.getObject(imageShapeKey);

            if (imageShape == null) {
                return true;
            }

            const imageData = this._drawingManagerService.getDrawingByParam(param);

            if (imageData == null) {
                return true;
            }

            if (imageData.drawingType !== DrawingTypeEnum.DRAWING_IMAGE) {
                return;
            }

            (imageShape as Image).resetSize();

            const { width, height } = (imageShape as Image).getNativeSize();

            if (sceneList.includes(scene) === false) {
                sceneList.push(scene);
            }

            updateParams.push({
                ...imageData,
                transform: {
                    ...imageData.transform,
                    height,
                    width,
                    angle: 0,
                },
                srcRect: null,
                prstGeom: null,
            } as IImageData);
        });

        this._drawingManagerService.featurePluginUpdateNotification(updateParams);

        sceneList.forEach((scene) => {
            const transformer = scene.getTransformerByCreate();
            transformer.refreshControls().changeNotification();
        });

        this._drawingManagerService.focusDrawing(params);
    }

    private _drawingAddListener() {
        this.disposeWithMe(
            this._drawingManagerService.add$.subscribe((params) => {
                this._insertImages(params);
            })
        );
    }

    private _insertImages(params: IDrawingSearch[]) {
        (params).forEach(async (param) => {
            const { unitId, subUnitId, drawingId } = param;
            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
            const currentSubUnitId = getCurrentUnitInfo(this._currentUniverService)?.subUnitId;

            if (renderObject == null || currentSubUnitId !== subUnitId) {
                return;
            }

            const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

            if (this._imageInsertCache.has(drawingShapeKey)) {
                return;
            }

            this._imageInsertCache.add(drawingShapeKey);

            const imageParam = this._drawingManagerService.getDrawingByParam(param) as IImageData;
            if (imageParam == null) {
                return;
            }

            const images = await this._drawingRenderService.renderImages(imageParam, renderObject.scene);

            if (images == null || images.length === 0) {
                return;
            }

            for (const image of images) {
                this._addHoverForImage(image);
                this._addDialogForImage(image);
            }
        });
    }

    private _imageUpdateListener() {
        this.disposeWithMe(
            this._drawingManagerService.update$.subscribe((params) => {
                (params).forEach((param) => {
                    const { unitId, subUnitId, drawingId } = param;

                    const drawingParam = this._drawingManagerService.getDrawingByParam(param) as IImageData;

                    if (drawingParam == null) {
                        return;
                    }

                    const { transform, drawingType, srcRect, prstGeom, source, imageSourceType } = drawingParam;

                    if (drawingType !== DrawingTypeEnum.DRAWING_IMAGE) {
                        return;
                    }

                    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

                    if (renderObject == null) {
                        return;
                    }
                    const { scene, transformer } = renderObject;

                    if (transform == null) {
                        return true;
                    }

                    const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

                    const imageShape = scene.getObject(drawingShapeKey) as Image;

                    if (imageShape == null) {
                        return true;
                    }

                    imageShape.setSrcRect(srcRect);
                    imageShape.setPrstGeom(prstGeom);
                    // if (source != null && source.length > 0 && (imageSourceType === ImageSourceType.BASE64 || imageSourceType === ImageSourceType.URL)) {
                    //     imageShape.changeSource(source);
                    // }
                });
            })
        );
    }

    private _addHoverForImage(o: Image) {
        this.disposeWithMe(
            toDisposable(
                o.onPointerEnter$.subscribeEvent(() => {
                    o.cursor = CURSOR_TYPE.GRAB;
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                o.onPointerLeave$.subscribeEvent(() => {
                    o.cursor = CURSOR_TYPE.DEFAULT;
                })
            )
        );
    }

    private _addDialogForImage(o: Image) {
        this.disposeWithMe(
            toDisposable(
                o.onDblclick$.subscribeEvent(() => {
                    const dialogId = `${o.oKey}-viewer-dialog`;

                    const nativeSize = o.getNativeSize();
                    const screenWidth = window.innerWidth - IMAGE_VIEWER_DROPDOWN_PADDING;
                    const screenHeight = window.innerHeight - IMAGE_VIEWER_DROPDOWN_PADDING;

                    const adjustSize = this._adjustImageSize(nativeSize.width, nativeSize.height, screenWidth, screenHeight);

                    const dialog = this._dialogService.open({
                        width: adjustSize.width,
                        id: dialogId,
                        style: { margin: '0', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
                        children: {
                            label: {
                                name: COMPONENT_IMAGE_VIEWER,
                                props: {
                                    src: o.getNative()?.src,
                                    width: adjustSize.width,
                                    height: adjustSize.height,
                                },
                            },
                        },
                        destroyOnClose: true,
                        draggable: false,
                        onClose: () => {
                            this._dialogService.close(dialogId);
                            dialog.dispose();
                        },
                    });
                })
            )
        );
    }

    private _adjustImageSize(nativeWidth: number, nativeHeight: number, screenWidth: number, screenHeight: number) {
        // Use native size if the image is smaller than the screen
        if (nativeWidth <= screenWidth && nativeHeight <= screenHeight) {
            return {
                width: nativeWidth,
                height: nativeHeight,
            };
        }

        // Calculate scale ratios
        const widthRatio = screenWidth / nativeWidth;
        const heightRatio = screenHeight / nativeHeight;
        const scale = Math.min(widthRatio, heightRatio); // Choose the smaller ratio to ensure the image fits within the screen

        // Return new dimensions
        return {
            width: Math.floor(nativeWidth * scale),
            height: Math.floor(nativeHeight * scale),
        };
    }
}
