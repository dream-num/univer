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

import type { ICommandInfo, IDrawingManagerParam } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    IDrawingManagerService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import type { IImageProps, Scene } from '@univerjs/engine-render';
import { Image, IRenderManagerService } from '@univerjs/engine-render';

import { IImageManagerService } from '../services/image-manager.service';

const IMAGE_DEFAULT_LAYER_INDEX = 11;
const IMAGE_BEHIND_TEXT_LAYER_INDEX = 1;

@OnLifecycle(LifecycleStages.Rendered, ImageLoadController)
export class ImageLoadController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IImageManagerService private readonly _imageManagerService: IImageManagerService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService
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
                this._drawingManagerService.andOrUpdate$.subscribe((params) => {
                    const sceneList: Scene[] = [];
                    params.forEach((param) => {
                        const { unitId, subUnitId, drawingId, drawing } = param;

                        const renderObject = this._renderManagerService.getRenderById(unitId);

                        const scene = renderObject?.scene;

                        if (scene == null) {
                            return true;
                        }

                        const searchParam = { unitId, subUnitId, imageId: drawingId };


                        const imageParam = this._imageManagerService.getImageByParam(searchParam);

                        if (imageParam == null) {
                            return true;
                        }

                        const imageModel = imageParam.imageModel;


                        const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = drawing;

                        const imageShapeKey = `${unitId}-${subUnitId}-${drawingId}`;

                        const imageShape = scene.getObject(imageShapeKey);

                        if (imageShape != null) {
                            imageShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                            return;
                        }

                        // this._imageRenderService.add(imageShapeKey, searchParam);

                        imageModel.setKey(imageShapeKey);

                        const imageConfig: IImageProps = {
                            left, top, width, height, zIndex: 11, isTransformer: true };


                        const imageNativeCache = this._imageManagerService.getImageSourceCache(imageModel);
                        if (imageNativeCache != null) {
                            imageConfig.image = imageNativeCache;
                        } else {
                            imageConfig.url = imageModel.source;
                        }

                        const image = new Image(imageShapeKey, imageConfig);


                        this._imageManagerService.addImageSourceCache(imageModel, image.getNative());

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
                        scene.closeTransformer();
                    });
                })
            )
        );
    }

    private _addListenerOnImage(scene: Scene) {
        scene.getTransformer()?.onChangingObservable.add((state) => {
            const { objects } = state;

            // const { docsLeft, docsTop } = documents;
            const params: IDrawingManagerParam[] = [];
            objects.forEach((object) => {
                const { oKey, left, top, height, width } = object;

                const searchParam = this._imageManagerService.getImageByOKey(oKey);

                if (searchParam == null) {
                    return true;
                }

                const { unitId, subUnitId, imageId } = searchParam;

                params.push({
                    unitId,
                    subUnitId,
                    drawingId: imageId,
                    drawing: {
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

            this._drawingManagerService.pluginUpdateRefresh(params);
        });
    }
}
