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

import type { ICommandInfo, IFloatingObjectManagerParam } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    IFloatingObjectManagerService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import type { Scene } from '@univerjs/engine-render';
import { IRenderManagerService, Picture } from '@univerjs/engine-render';

import { IImageManagerService } from '../services/image-manager.service';
import { IImageRenderService } from '../services/image-render.service';

const IMAGE_DEFAULT_LAYER_INDEX = 11;
const IMAGE_BEHIND_TEXT_LAYER_INDEX = 1;

@OnLifecycle(LifecycleStages.Rendered, ImageLoadController)
export class ImageLoadController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IImageManagerService private readonly _imageManagerService: IImageManagerService,
        @IImageRenderService private readonly _imageRenderService: IImageRenderService,
        @IFloatingObjectManagerService private readonly _floatingObjectManagerService: IFloatingObjectManagerService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        super.dispose();
    }

    private _initialize() {
        this._floatingObjectListener();

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


    private _floatingObjectListener() {
        this.disposeWithMe(
            toDisposable(
                this._floatingObjectManagerService.andOrUpdate$.subscribe((params) => {
                    const sceneList: Scene[] = [];
                    params.forEach((param) => {
                        const { unitId, subUnitId, floatingObjectId, floatingObject, behindText } = param;

                        const renderObject = this._renderManagerService.getRenderById(unitId);

                        const scene = renderObject?.scene;

                        if (scene == null) {
                            return true;
                        }

                        const searchParam = {
                            unitId,
                            subUnitId,
                            imageId: floatingObjectId,
                        };

                        const imageModel = this._imageManagerService.getImageByParam(searchParam)?.imageModel;

                        if (imageModel == null) {
                            return true;
                        }

                        const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = floatingObject;

                        const imageShapeKey = `${unitId}_${subUnitId}_${floatingObjectId}`;

                        const imageShape = scene.getObject(imageShapeKey);

                        if (imageShape != null) {
                            imageShape.transformByState({
                                left,
                                top,
                                width,
                                height,
                                angle,
                                flipX,
                                flipY,
                                skewX,
                                skewY,
                            });
                            return;
                        }

                        this._imageRenderService.add(imageShapeKey, searchParam);

                        const image = new Picture(imageShapeKey, {
                            url: imageModel.getUrl(),
                            left,
                            top,
                            width,
                            height,
                            zIndex: 11,
                            isTransformer: true,
                        });

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
            const params: IFloatingObjectManagerParam[] = [];
            objects.forEach((object) => {
                const { oKey, left, top, height, width } = object;

                const searchParam = this._imageRenderService.get(oKey);

                if (searchParam == null) {
                    return true;
                }

                const { unitId, subUnitId, imageId } = searchParam;

                params.push({
                    unitId,
                    subUnitId,
                    floatingObjectId: imageId,
                    floatingObject: {
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

            this._floatingObjectManagerService.pluginUpdateRefresh(params);
        });
    }
}
