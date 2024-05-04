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

import type { ICommandInfo, IDrawingParam, ITransformState, Nullable } from '@univerjs/core';
import {
    Disposable,
    DrawingTypeEnum,
    ICommandService,
    IDrawingManagerService,
    IImageRemoteService,
    ImageSourceType,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import type { BaseObject, IImageProps, Scene } from '@univerjs/engine-render';
import { DRAWING_OBJECT_LAYER_INDEX, Image, IRenderManagerService } from '@univerjs/engine-render';
import type { IImageData } from '@univerjs/image';


@OnLifecycle(LifecycleStages.Rendered, ImageUpdateController)
export class ImageUpdateController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
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

        this._drawingRemoveListener();

        this._drawingUpdateListener();

        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        const updateCommandList: string[] = [];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    return true;
                }
            })
        );
    }

    private _drawingAddListener() {
        this.disposeWithMe(
            this._drawingManagerService.add$.subscribe((params) => {
                const sceneList: Scene[] = [];
                (params as IImageData[]).forEach((param) => {
                    const { unitId, subUnitId, drawingId, transform, zIndex } = param;

                    const renderObject = this._renderManagerService.getRenderById(unitId);

                    const scene = renderObject?.scene;

                    if (scene == null) {
                        return true;
                    }

                    if (transform == null) {
                        return true;
                    }

                    const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;

                    const imageShapeKey = `${unitId}#-#${subUnitId}#-#${drawingId}#-#${DrawingTypeEnum.DRAWING_IMAGE}`;

                    const imageShape = scene.getObject(imageShapeKey);

                    if (imageShape != null) {
                        imageShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                        return;
                    }

                    const imageConfig: IImageProps = { left, top, width, height, zIndex: zIndex || 0 };


                    const imageNativeCache = this._getImageSourceCache(param);
                    if (imageNativeCache != null) {
                        imageConfig.image = imageNativeCache;
                    } else {
                        imageConfig.url = param.source;
                    }

                    const image = new Image(imageShapeKey, imageConfig);


                    this._addImageSourceCache(param, image.getNative());

                    scene.addObject(image, DRAWING_OBJECT_LAYER_INDEX).attachTransformerTo(image);

                    if (!sceneList.includes(scene)) {
                        sceneList.push(scene);
                    }
                });

                sceneList.forEach((scene) => {
                    this._addListenerOnImage(scene);
                });
            })
        );
    }


    private _drawingRemoveListener() {
        this.disposeWithMe(
            this._drawingManagerService.remove$.subscribe((params) => {
                (params as IImageData[]).forEach((param) => {
                    const { unitId, subUnitId, drawingId } = param;

                    const renderObject = this._renderManagerService.getRenderById(unitId);

                    const scene = renderObject?.scene;

                    if (scene == null) {
                        return true;
                    }

                    const imageShapeKey = `${unitId}#-#${subUnitId}#-#${drawingId}#-#${DrawingTypeEnum.DRAWING_IMAGE}`;

                    const imageShape = scene.getObject(imageShapeKey);

                    if (imageShape != null) {
                        imageShape.dispose();
                        scene.getTransformer()?.clearSelectedObjects();
                    }
                });
            })
        );
    }


    private _drawingUpdateListener() {
        this.disposeWithMe(
            this._drawingManagerService.update$.subscribe((params) => {
                (params as IImageData[]).forEach((param) => {
                    const { unitId, subUnitId, drawingId, transform } = param;

                    const renderObject = this._renderManagerService.getRenderById(unitId);

                    const scene = renderObject?.scene;

                    if (scene == null) {
                        return true;
                    }

                    if (transform == null) {
                        return true;
                    }

                    const { left = 0, top = 0, width = 0, height = 0, angle = 0, flipX = false, flipY = false, skewX = 0, skewY = 0 } = transform;

                    const imageShapeKey = `${unitId}#-#${subUnitId}#-#${drawingId}#-#${DrawingTypeEnum.DRAWING_IMAGE}`;

                    const imageShape = scene.getObject(imageShapeKey);

                    if (imageShape == null) {
                        return true;
                    }

                    imageShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                });
            })
        );
    }

    private _checkIfMove(transform: Nullable<ITransformState>, previousTransform: Nullable<ITransformState>): boolean {
        if (previousTransform == null || transform == null) {
            return true;
        }

        const { left: leftPrev = 0, top: topPrev = 0, height: heightPrev = 0, width: widthPrev = 0, angle: anglePrev = 0 } = previousTransform;
        const { left = 0, top = 0, height = 0, width = 0, angle = 0 } = transform;

        const allWidth = width;
        const allHeight = height;

        const allWidthPrev = widthPrev;
        const allHeightPrev = heightPrev;

        return Math.abs(left - leftPrev) > 0.5 || Math.abs(top - topPrev) > 0.5 || Math.abs(allWidth - allWidthPrev) > 0.5 || Math.abs(allHeight - allHeightPrev) > 0.5 || Math.abs(angle - anglePrev) > 0.1;
    }

    private _filterUpdateParams(params: Nullable<IDrawingParam>[], startTransforms: Nullable<ITransformState[]>) {
        return params.filter((param, index) => {
            if (param == null) {
                return false;
            }
            const { transform } = param;
            return this._checkIfMove(transform, startTransforms?.[index]);
        }) as IDrawingParam[];
    }


    private _addListenerOnImage(scene: Scene) {
        const transformer = scene.getTransformerByCreate();

        let startTransforms: Nullable<ITransformState[]> = null;

        transformer.onChangeStartObservable.add((state) => {
            const { objects } = state;
            startTransforms = Array.from(objects.values()).map((object) => {
                const { left, top, height, width, angle } = object;
                return { left, top, height, width, angle };
            });
        });

        transformer.onChangingObservable.add((state) => {
            const { objects } = state;
            const params = this._getUpdateParams(objects);
            if (params.length > 0) {
                // this._drawingManagerService.batchUpdate(params.filter((param) => {
                //     if (param == null) {
                //         return false;
                //     }
                //     return true;
                // }) as IDrawingParam[]);
            }
        });

        transformer.onChangeEndObservable.add((state) => {
            const { objects } = state;
            const params = this._filterUpdateParams(this._getUpdateParams(objects), startTransforms);

            if (params.length > 0) {
                // this._drawingManagerService.batchUpdate(params);
                this._drawingManagerService.extraUpdateNotification(params);
            }
        });
    }

    private _getUpdateParams(objects: Map<string, BaseObject>): Nullable<IDrawingParam>[] {
        const params: Nullable<IDrawingParam>[] = [];
        objects.forEach((object) => {
            const { oKey, left, top, height, width, angle } = object;

            const searchParam = this._drawingManagerService.getDrawingOKey(oKey);

            if (searchParam == null) {
                params.push(null);
                return true;
            }

            const { unitId, subUnitId, drawingId } = searchParam;

            params.push({
                unitId,
                subUnitId,
                drawingId,
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                transform: {
                    left,
                    top,
                    height,
                    width,
                    angle,
                },
            });
        });

        return params;
    }

    private _imageSourceCache: Map<string, HTMLImageElement> = new Map();


    private _addImageSourceCache(imageData: IImageData, imageSource: Nullable<HTMLImageElement>) {
        const { source, imageSourceType } = imageData;
        if (imageSourceType === ImageSourceType.BASE64 || imageSource == null) {
            return;
        }

        this._imageSourceCache.set(source, imageSource);
    }

    private _getImageSourceCache(imageData: IImageData): Nullable<HTMLImageElement> {
        const { source, imageSourceType } = imageData;

        if (imageSourceType === ImageSourceType.BASE64) {
            return;
        }

        return this._imageSourceCache.get(source);
    }
}
