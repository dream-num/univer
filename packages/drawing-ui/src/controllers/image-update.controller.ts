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

import type { ICommandInfo, IDrawingSearch, Nullable } from '@univerjs/core';
import {
    Disposable,
    DrawingTypeEnum,
    ICommandService,
    IDrawingManagerService,
    IImageRemoteService,
    ImageSourceType,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import type { IImageProps, Scene } from '@univerjs/engine-render';
import { CURSOR_TYPE, DRAWING_OBJECT_LAYER_INDEX, Image, IRenderManagerService } from '@univerjs/engine-render';
import type { IImageData } from '@univerjs/drawing';
import { getDrawingShapeKeyByDrawingSearch } from '@univerjs/drawing';
import { IDialogService } from '@univerjs/ui';
import { COMPONENT_IMAGE_VIEWER } from '../views/image-viewer/component-name';
import { ImageResetSizeOperation } from '../commands/operations/image-reset-size.operation';

const IMAGE_VIEWER_DROPDOWN_PADDING = 50;

@OnLifecycle(LifecycleStages.Ready, ImageUpdateController)
export class ImageUpdateController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IDialogService private readonly _dialogService: IDialogService,
        @IImageRemoteService private readonly _imageRemoteService: IImageRemoteService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        super.dispose();
    }

    private _initialize() {
        this._drawingAddListener();

        this._commandExecutedListener();

        this._imageUpdateListener();
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
            const { scene, transformer } = renderObject;

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
            } as IImageData);
        });

        this._drawingManagerService.featurePluginUpdateNotification(updateParams);

        sceneList.forEach((scene) => {
            const transformer = scene.getTransformerByCreate();
            transformer.refreshControls();
        });
    }

    private _drawingAddListener() {
        this.disposeWithMe(
            this._drawingManagerService.add$.subscribe((params) => {
                (params).forEach(async (param) => {
                    const { unitId, subUnitId, drawingId } = param;

                    const imageParam = this._drawingManagerService.getDrawingByParam(param) as IImageData;

                    if (imageParam == null) {
                        return;
                    }

                    const { transform, drawingType, source, imageSourceType } = imageParam;

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

                    const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;

                    const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

                    const imageShape = scene.getObject(imageShapeKey);

                    if (imageShape != null) {
                        imageShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                        return;
                    }

                    const imageConfig: IImageProps = { left, top, width, height, zIndex: this._drawingManagerService.getDrawingOrder(unitId, subUnitId).length - 1 };

                    const imageNativeCache = this._imageRemoteService.getImageSourceCache(source, imageSourceType);

                    let shouldBeCache = false;
                    if (imageNativeCache != null) {
                        imageConfig.image = imageNativeCache;
                    } else {
                        if (imageSourceType === ImageSourceType.UUID) {
                            try {
                                imageConfig.url = await this._imageRemoteService.getImage(source);
                            } catch (error) {
                                console.error(error);
                                return;
                            }
                        } else {
                            imageConfig.url = source;
                        }

                        shouldBeCache = true;
                    }

                    const image = new Image(imageShapeKey, imageConfig);

                    if (shouldBeCache) {
                        this._imageRemoteService.addImageSourceCache(source, imageSourceType, image.getNative());
                    }

                    scene.addObject(image, DRAWING_OBJECT_LAYER_INDEX).attachTransformerTo(image);

                    this._addHoverForImage(image);
                    this._addDialogForImage(image);
                });
            })
        );
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
                o.onPointerEnterObserver.add(() => {
                    o.cursor = CURSOR_TYPE.GRAB;
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                o.onPointerLeaveObserver.add(() => {
                    o.cursor = CURSOR_TYPE.DEFAULT;
                })
            )
        );
    }

    private _addDialogForImage(o: Image) {
        this.disposeWithMe(
            toDisposable(
                o.onDblclickObserver.add(() => {
                    const dialogId = `${o.oKey}-viewer-dialog`;

                    const nativeSize = o.getNativeSize();
                    const screenWidth = window.innerWidth - IMAGE_VIEWER_DROPDOWN_PADDING;
                    const screenHeight = window.innerHeight - IMAGE_VIEWER_DROPDOWN_PADDING;

                    const adjustSize = this._adjustImageSize(nativeSize.width, nativeSize.height, screenWidth, screenHeight);

                    const dialog = this._dialogService.open({
                        width: adjustSize.width,
                        id: dialogId,
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
