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

import { DRAWING_OBJECT_LAYER_INDEX, Image, IRenderManagerService } from '@univerjs/engine-render';
import {
    Disposable,
    ICommandService,
    IDrawingManagerService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import type { IImageManagerBaseParam } from '@univerjs/image';
import { IImageManagerService } from '@univerjs/image';
import type { IImageProps, Scene } from '@univerjs/engine-render';


@OnLifecycle(LifecycleStages.Rendered, ImageUpdateController)
export class ImageUpdateController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IImageManagerService private readonly _imageManagerService: IImageManagerService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        super.dispose();
    }

    private _initialize() {
        this._addListener();
    }


    private _addListener() {
        this.disposeWithMe(
            this._imageManagerService.and$.subscribe((params) => {
                const sceneList: Scene[] = [];
                params.forEach((param) => {
                    const { unitId, subUnitId, imageId, transform, imageModel } = param;

                    const renderObject = this._renderManagerService.getRenderById(unitId);

                    const scene = renderObject?.scene;

                    if (scene == null) {
                        return true;
                    }

                    const searchParam = { unitId, subUnitId, imageId };


                    const imageParam = this._imageManagerService.getImageByParam(searchParam);

                    if (imageParam == null || transform == null) {
                        return true;
                    }


                    const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;

                    const imageShapeKey = `${unitId}-${subUnitId}-${imageId}`;

                    const imageShape = scene.getObject(imageShapeKey);

                    if (imageShape != null) {
                        imageShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                        return;
                    }

                        // this._imageRenderService.add(imageShapeKey, searchParam);

                    imageModel.setKey(imageShapeKey);

                    const imageConfig: IImageProps = { left, top, width, height, zIndex: 11 };


                    const imageNativeCache = this._imageManagerService.getImageSourceCache(imageModel);
                    if (imageNativeCache != null) {
                        imageConfig.image = imageNativeCache;
                    } else {
                        imageConfig.url = imageModel.source;
                    }

                    const image = new Image(imageShapeKey, imageConfig);


                    this._imageManagerService.addImageSourceCache(imageModel, image.getNative());

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

    private _addListenerOnImage(scene: Scene) {
        scene.getTransformer()?.onChangingObservable.add((state) => {
            const { objects } = state;

            // const { docsLeft, docsTop } = documents;
            const params: IImageManagerBaseParam[] = [];
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
                    imageId,
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

            this._imageManagerService.batchUpdate(params);
        });
    }

    private _removeListener() {
        this.disposeWithMe(
            this._imageManagerService.remove$.subscribe((params) => {

            })
        );
    }

    private _updateListener() {
        this.disposeWithMe(
            this._imageManagerService.update$.subscribe((params) => {

            })
        );
    }
}
