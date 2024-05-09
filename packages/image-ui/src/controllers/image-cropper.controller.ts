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

import type { ICommandInfo, IDrawingParam, IDrawingSearch, ISrcRect, ITransformState, Nullable } from '@univerjs/core';
import { checkIfMove, Disposable, ICommandService, IDrawingManagerService, IUniverInstanceService, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import type { IImageData } from '@univerjs/image';
import { getImageShapeKeyByDrawingSearch } from '@univerjs/image';
import type { BaseObject, Image, Scene } from '@univerjs/engine-render';
import { CURSOR_TYPE, degToRad, IRenderManagerService, Vector2 } from '@univerjs/engine-render';
import { CloseImageCropOperation, OpenImageCropOperation } from '../commands/operations/image-crop.operation';
import { ImageCropperObject } from '../views/crop/image-cropper-object';

@OnLifecycle(LifecycleStages.Rendered, ImageCropperController)
export class ImageCropperController extends Disposable {
    private _sceneListenerOnImageMap: WeakSet<Scene> = new WeakSet();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService
    ) {
        super();


        this._init();
    }

    private _init(): void {
        this._initOpenCrop();
        this._initCloseCrop();
    }

    private _initOpenCrop() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== OpenImageCropOperation.id) {
                    return;
                }

                const params = command.params as IDrawingSearch;

                if (params == null) {
                    return;
                }

                const { unitId, subUnitId, drawingId, drawingType } = params;

                const renderObject = this._renderManagerService.getRenderById(unitId);

                const scene = renderObject?.scene;

                if (scene == null) {
                    return true;
                }

                if (!this._sceneListenerOnImageMap.has(scene)) {
                    this._addListenerOnImage(scene);
                    this._sceneListenerOnImageMap.add(scene);
                }


                const imageData = this._drawingManagerService.getDrawingByParam<IImageData>({ unitId, subUnitId, drawingId, drawingType });

                if (imageData == null) {
                    return;
                }

                const imageShapeKey = getImageShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId, drawingType });

                const imageShape = scene.getObject(imageShapeKey) as Image;

                if (imageShape == null) {
                    return;
                }

                // imageShape.evented = false;
                // imageShape.hide();
                // scene.getTransformer()?.clearControls();

                const transformer = scene.getTransformer();

                transformer?.clearControls();

                const imageCropperObject = new ImageCropperObject(`${imageShapeKey}-crop`, { imageData, applyObject: imageShape });

                scene.addObject(imageCropperObject, imageShape.getLayerIndex() + 1).attachTransformerTo(imageCropperObject);
                transformer?.createControlForCopper(imageCropperObject);
                this._addHoverForImageCopper(imageCropperObject);

                imageShape.openRenderByCropper();

                transformer?.refreshControls();

                imageCropperObject.makeDirty(true);
            })
        );
    }

    private _searchCropObject(scene: Scene) {
        const objects = scene.getAllObjects();

        for (const object of objects) {
            if (object instanceof ImageCropperObject) {
                return object as ImageCropperObject;
            }
        }
    }

    private _initCloseCrop() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== CloseImageCropOperation.id) {
                    return;
                }

                const currentUnit = this._univerInstanceService.getFocusedUnit();

                if (currentUnit == null) {
                    return;
                }

                const unitId = currentUnit.getUnitId();
                const renderObject = this._renderManagerService.getRenderById(unitId);

                const scene = renderObject?.scene;

                if (scene == null) {
                    return true;
                }

                const imageCropperObject = this._searchCropObject(scene);
                if (imageCropperObject == null) {
                    return;
                }
                const imageShape = imageCropperObject.applyObject as Image;


                const transformer = scene.getTransformerByCreate();
                transformer.detachFrom(imageCropperObject);
                transformer.clearCopperControl();

                const srcRect = this._getSrcRectByTransformState(imageShape, imageCropperObject);

                const drawingParam = this._drawingManagerService.getDrawingOKey<IDrawingParam>(imageShape.oKey);
                if (drawingParam != null) {
                    const { left, top, height, width } = imageCropperObject;
                    this._drawingManagerService.extraUpdateNotification([{
                        ...drawingParam,
                        transform: {
                            ...drawingParam.transform,
                            left, top, height, width,
                        },
                        srcRect: srcRect.srcRectAngle,
                    }]);
                }
                imageShape.setSrcRect({ ...srcRect.srcRectAngle });
                imageShape.closeRenderByCropper();

                imageShape.makeDirty(true);

                imageCropperObject?.dispose();
            })
        );
    }

    private _getApplyObjectByCropObject(cropObject: ImageCropperObject): Nullable<BaseObject> {
        const applyObject = cropObject.applyObject;
        if (applyObject == null) {
            return null;
        }

        return applyObject;
    }


    private _addListenerOnImage(scene: Scene) {
        const transformer = scene.getTransformerByCreate();

        let startTransform: Nullable<ITransformState> = null;
        this.disposeWithMe(
            toDisposable(
                transformer.onChangeStartObservable.add((state) => {
                    const { objects } = state;
                    const cropObject = objects.values().next().value as ImageCropperObject;
                    if (cropObject == null || !(cropObject instanceof ImageCropperObject)) {
                        return;
                    }

                    const { left, top, height, width, angle } = cropObject;

                    startTransform = { left, top, height, width, angle };

                    transformer.clearCopperControl();
                })
            )
        );
        // this.disposeWithMe(
        //     toDisposable(
        //         transformer.onChangingObservable.add((state) => {

        //         })
        //     )
        // );
        this.disposeWithMe(
            toDisposable(
                transformer.onChangeEndObservable.add((state) => {
                    const { objects } = state;
                    const cropObject = objects.values().next().value as ImageCropperObject;
                    if (cropObject == null || !(cropObject instanceof ImageCropperObject)) {
                        return;
                    }

                    const { left, top, height, width, angle } = cropObject;

                    if (!checkIfMove({ left, top, height, width, angle }, startTransform)) {
                        return;
                    }

                    const applyObject = this._getApplyObjectByCropObject(cropObject);

                    if (applyObject == null) {
                        return;
                    }

                    const srcRect = this._getSrcRectByTransformState(applyObject, cropObject);

                    cropObject.imageData = {
                        ...cropObject.imageData,
                        srcRect: srcRect.srcRect,
                    } as IImageData;

                    transformer.createControlForCopper(cropObject);
                })
            )
        );
        this._endCropListener(scene);
    }

    private _addHoverForImageCopper(o: ImageCropperObject) {
        this.disposeWithMe(
            toDisposable(
                o.onPointerEnterObserver.add(() => {
                    o.cursor = CURSOR_TYPE.MOVE;
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

    private _endCropListener(scene: Scene) {
        const transformer = scene.getTransformerByCreate();

        this.disposeWithMe(
            toDisposable(
                transformer.onClearControlObservable.add((changeSelf) => {
                    if (changeSelf === true) {
                        this._commandService.syncExecuteCommand(CloseImageCropOperation.id);
                    }
                })
            )
        );
    }

    private _getSrcRectByTransformState(applyObject: BaseObject, imageCropperObject: ImageCropperObject) {
        const { left, top, height, width, strokeWidth, angle: copperAngle } = imageCropperObject;

        const { left: applyLeft, top: applyTop, width: applyWidth, height: applyHeight, angle: applyAngle, strokeWidth: applyStrokeWidth } = applyObject;


        const newLeft = left - applyLeft;
        const newTop = top - applyTop;

        const srcRect = {
            left: newLeft,
            top: newTop,
            right: applyWidth - newLeft - width,
            bottom: applyHeight - newTop - height,
        };

        const srcRectAngle = { ...srcRect };

        // const offsetPoint = new Vector2(0, 0);
        if (applyAngle !== 0) {
            /**
             * Calculate the offset of the center rotation to correctly position the object entering the cropping.
             */
            const cx = left + width / 2;
            const cy = top + height / 2;
            const centerPoint = new Vector2(cx, cy);

            const newCx = applyWidth / 2 + applyLeft;
            const newCy = applyHeight / 2 + applyTop;
            const newCenterPoint = new Vector2(newCx, newCy);

            const vertexPoint = new Vector2(applyLeft, applyTop);
            vertexPoint.rotateByPoint(degToRad(applyAngle), newCenterPoint);

            const applyFinalPoint = vertexPoint.clone();
            applyFinalPoint.rotateByPoint(degToRad(-applyAngle), centerPoint);


            const newAngleLeft = left - applyFinalPoint.x;
            const newAngleTop = top - applyFinalPoint.y;

            srcRectAngle.left = newAngleLeft;
            srcRectAngle.top = newAngleTop;
            srcRectAngle.right = applyWidth - newAngleLeft - width;
            srcRectAngle.bottom = applyHeight - newAngleTop - height;
        }

        return {
            srcRect,
            srcRectAngle,
        };
    }
}
