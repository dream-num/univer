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

import type { ICommandInfo, IDrawingParam, Nullable } from '@univerjs/core';
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
import type { IImageProps, Scene } from '@univerjs/engine-render';
import { Image, IRenderManagerService } from '@univerjs/engine-render';
import type { IImageData } from '../models/image-model-interface';

const IMAGE_DEFAULT_LAYER_INDEX = 11;
const IMAGE_BEHIND_TEXT_LAYER_INDEX = 1;

@OnLifecycle(LifecycleStages.Rendered, ImageLoadController)
export class ImageLoadController extends Disposable {
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
        this._drawingListener();

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

    private _drawingListener() {
        this.disposeWithMe(
            toDisposable(
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

                        // const searchParam = { unitId, subUnitId, imageId: drawingId };


                        // const imageParam = this._imageManagerService.getImageByParam(searchParam);

                        // if (imageParam == null) {
                        //     return true;
                        // }

                        // const imageModel = imageParam.imageModel;


                        const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;

                        const imageShapeKey = `${unitId}-${subUnitId}-${drawingId}`;

                        const imageShape = scene.getObject(imageShapeKey);

                        if (imageShape != null) {
                            imageShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                            return;
                        }

                        // this._imageRenderService.add(imageShapeKey, searchParam);

                        // imageModel.setKey(imageShapeKey);

                        const imageConfig: IImageProps = { left, top, width, height, zIndex: zIndex || 0 };


                        const imageNativeCache = this._getImageSourceCache(param);
                        if (imageNativeCache != null) {
                            imageConfig.image = imageNativeCache;
                        } else {
                            imageConfig.url = param.source;
                        }

                        const image = new Image(imageShapeKey, imageConfig);


                        this._addImageSourceCache(param, image.getNative());

                        if (!scene.getTransformer()) {
                            scene.openTransformer();
                        }

                        scene.addObject(image, behindText ? IMAGE_BEHIND_TEXT_LAYER_INDEX : IMAGE_DEFAULT_LAYER_INDEX);

                        if (!sceneList.includes(scene)) {
                            sceneList.push(scene);
                        }
                    });

                    sceneList.forEach((scene) => {
                        this._addListenerOnImage(scene);
                    });
                })
            )
        );
    }

    private _addListenerOnImage(scene: Scene) {
        scene.getTransformer()?.onChangingObservable.add((state) => {
            const { objects } = state;

            // const { docsLeft, docsTop } = documents;
            const params: IDrawingParam[] = [];
            objects.forEach((object) => {
                const { oKey, left, top, height, width } = object;

                const searchParam = this._drawingManagerService.getDrawingOKey(oKey);

                if (searchParam == null) {
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
                    },
                });

                // const cache = pageMarginCache.get(oKey);
                // const marginLeft = cache?.marginLeft || 0;
                // const marginTop = cache?.marginTop || 0;

                // console.log('onChangingObservable', top, docsTop, marginTop, top - docsTop - marginTop);

                // docsSkeleton?.getViewModel().updateDrawing(oKey, {
                //     left: left - docsLeft - marginLeft,
                //     top: top - docsTop - marginTop,
                //     height,
                //     width,
                // });
            });

            this._drawingManagerService.updateNotification(params);
        });
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
