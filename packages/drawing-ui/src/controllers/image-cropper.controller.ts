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

import type { ICommandInfo, IDrawingSearch, ISrcRect, ITransformState, Nullable, Workbook } from '@univerjs/core';
import type { IImageData } from '@univerjs/drawing';
import type { BaseObject, Scene } from '@univerjs/engine-render';
import type { IOpenImageCropOperationBySrcRectParams } from '../commands/operations/image-crop.operation';
import { checkIfMove, Disposable, ICommandService, Inject, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { getDrawingShapeKeyByDrawingSearch, IDrawingManagerService, SetDrawingSelectedOperation } from '@univerjs/drawing';
import { CURSOR_TYPE, degToRad, Image, IRenderManagerService, precisionTo, Vector2 } from '@univerjs/engine-render';
import { IMessageService } from '@univerjs/ui';
import { of, switchMap } from 'rxjs';
import { AutoImageCropOperation, CloseImageCropOperation, CropType, OpenImageCropOperation } from '../commands/operations/image-crop.operation';
import { ImageCropperObject } from '../views/crop/image-cropper-object';

export class ImageCropperController extends Disposable {
    private _sceneListenerOnImageMap: WeakSet<Scene> = new WeakSet();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._initOpenCrop();
        this._initCloseCrop();
        this._initAutoCrop();
    }

    private _initAutoCrop() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== AutoImageCropOperation.id) {
                    return;
                }

                const params = command.params as IOpenImageCropOperationBySrcRectParams;

                if (params == null) {
                    return;
                }

                const { cropType } = params;

                const drawingParams = this._drawingManagerService.getFocusDrawings();

                if (drawingParams.length !== 1) {
                    return;
                }

                const drawingParam = drawingParams[0];

                const { unitId, subUnitId, drawingId } = drawingParam;

                const renderObject = this._renderManagerService.getRenderById(unitId);

                const scene = renderObject?.scene;

                if (scene == null) {
                    return true;
                }

                const imageCropperObject = this._searchCropObject(scene);
                if (imageCropperObject != null) {
                    this._commandService.syncExecuteCommand(CloseImageCropOperation.id, { isAuto: true });
                }

                const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

                const imageShape = scene.getObject(imageShapeKey);

                if (!(imageShape instanceof Image)) {
                    this._messageService.show({
                        type: MessageType.Error,
                        content: this._localeService.t('image-cropper.error'),
                    });
                    return;
                }

                if (imageShape == null) {
                    return;
                }

                this._updateCropperObject(cropType, imageShape);

                this._commandService.executeCommand(OpenImageCropOperation.id, { unitId, subUnitId, drawingId });
            })
        );
    }

    private _calculateSrcRectByRatio(left: number, top: number, width: number, height: number, numerator: number, denominator: number) {
        const srcRatio = width / height;
        const ratio = numerator / denominator;

        let newWidth = width;
        let newHeight = height;

        if (srcRatio > ratio) {
            newWidth = height * ratio;
        } else {
            newHeight = width / ratio;
        }

        const newLeft = (width - newWidth) / 2;
        const newTop = (height - newHeight) / 2;

        return {
            left: precisionTo(newLeft, 1),
            top: precisionTo(newTop, 1),
            right: precisionTo(width - (newLeft + newWidth), 1),
            bottom: precisionTo(height - (newTop + newHeight), 1),
        };
    }

    private _updateCropperObject(cropType: CropType, imageShape: Image) {
        const { left, top, width, height } = imageShape.calculateTransformWithSrcRect();

        let newSrcRect: Nullable<ISrcRect>;
        switch (cropType) {
            case CropType.R1_1:
                // 1:1
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 1, 1);
                break;
            case CropType.R16_9:
                // 16:9
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 16, 9);
                break;
            case CropType.R9_16:
                // 9:16
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 9, 16);
                break;
            case CropType.R5_4:
                // 5:4
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 5, 4);
                break;
            case CropType.R4_5:
                // 4:5
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 4, 5);
                break;
            case CropType.R4_3:
                // 4:3
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 4, 3);
                break;
            case CropType.R3_4:
                // 3:4
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 3, 4);
                break;
            case CropType.R3_2:
                // 3:2
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 3, 2);
                break;
            case CropType.R2_3:
                // 2:3
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 2, 3);
                break;
            case CropType.FREE:
            default:
                break;
        }

        if (newSrcRect == null) {
            return;
        }

        imageShape.setSrcRect(newSrcRect);

        const { left: newLeft = 0, top: newTop = 0, bottom: newBottom = 0, right: newRight = 0 } = newSrcRect;
        imageShape.transformByStateCloseCropper({
            left: left + newLeft,
            top: top + newTop,
            width: width - newRight - newLeft,
            height: height - newBottom - newTop,
        });
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

                const { unitId, subUnitId, drawingId } = params;

                const renderObject = this._renderManagerService.getRenderById(unitId);

                const scene = renderObject?.scene;

                if (scene == null) {
                    return true;
                }

                if (!this._sceneListenerOnImageMap.has(scene)) {
                    this._addListenerOnImage(scene);
                    this._sceneListenerOnImageMap.add(scene);
                }

                const imageData = this._drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId });

                if (imageData == null) {
                    return;
                }

                const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

                const imageShape = scene.getObject(imageShapeKey);

                if (imageShape == null) {
                    return;
                }

                if (!(imageShape instanceof Image)) {
                    this._messageService.show({
                        type: MessageType.Error,
                        content: this._localeService.t('image-cropper.error'),
                    });
                    return;
                }
                const transformer = scene.getTransformer();

                transformer?.clearControls();

                const imageCropperObject = new ImageCropperObject(`${imageShapeKey}-crop`, {
                    srcRect: imageShape.srcRect,
                    prstGeom: imageShape.prstGeom,
                    applyTransform: imageShape.calculateTransformWithSrcRect(),
                });

                scene.addObject(imageCropperObject, imageShape.getLayerIndex() + 1).attachTransformerTo(imageCropperObject);
                transformer?.createControlForCopper(imageCropperObject);
                this._addHoverForImageCopper(imageCropperObject);

                imageShape.openRenderByCropper();
                transformer?.refreshControls();
                imageCropperObject.makeDirty(true);

                this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, [{ unitId, subUnitId, drawingId }]);
            })
        );
    }

    private _searchCropObject(scene: Scene) {
        const objects = scene.getAllObjectsByOrder();

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
                const imageShape = this._getApplyObjectByCropObject(imageCropperObject);
                if (imageShape == null) {
                    return;
                }

                const transformer = scene.getTransformerByCreate();
                transformer.detachFrom(imageCropperObject);
                transformer.clearCopperControl();

                const srcRect = this._getSrcRectByTransformState(imageShape, imageCropperObject);

                const drawingParam = this._drawingManagerService.getDrawingOKey(imageShape.oKey);
                if (drawingParam != null) {
                    const { left, top, height, width } = imageCropperObject;
                    this._drawingManagerService.featurePluginUpdateNotification([{
                        ...drawingParam,
                        transform: {
                            ...drawingParam.transform,
                            left,
                            top,
                            height,
                            width,
                        },
                        srcRect: srcRect.srcRectAngle,
                    }] as IImageData[]);
                }
                imageShape.setSrcRect({ ...srcRect.srcRectAngle });
                imageShape.closeRenderByCropper();

                imageShape.makeDirty(true);

                imageCropperObject?.dispose();
            })
        );

        const sheetUnit$ = this._univerInstanceService
            .getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .pipe(
                switchMap((workbook) => workbook ? workbook.activeSheet$ : of(null))
            );

        this.disposeWithMe(sheetUnit$.subscribe(() => {
            this._commandService.syncExecuteCommand(CloseImageCropOperation.id);
        }));
    }

    private _getApplyObjectByCropObject(cropObject: ImageCropperObject): Nullable<Image> {
        const cropOKey = cropObject.oKey;
        const applyOKey = cropOKey.slice(0, cropOKey.length - 5);
        const scene = cropObject.getScene();
        if (!scene) return null;
        const applyObject = scene.getObject(applyOKey) as Image;
        if (applyObject == null) {
            return null;
        }

        return applyObject;
    }

    private _addListenerOnImage(scene: Scene) {
        const transformer = scene.getTransformerByCreate();

        let startTransform: Nullable<ITransformState> = null;
        this.disposeWithMe(
            transformer.changeStart$.subscribe((state) => {
                const { objects } = state;
                const cropObject = objects.values().next().value as ImageCropperObject;
                if (cropObject == null || !(cropObject instanceof ImageCropperObject)) {
                    return;
                }

                const { left, top, height, width, angle } = cropObject;

                startTransform = { left, top, height, width, angle };

                transformer.clearCopperControl();
            })
        );

        this.disposeWithMe(
            transformer.changeEnd$.subscribe((state) => {
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

                cropObject.refreshSrcRect(srcRect.srcRect, applyObject.getState());

                // cropObject.imageData = {
                //     ...cropObject.imageData,
                //     srcRect: srcRect.srcRect,
                // } as IImageData;

                transformer.createControlForCopper(cropObject);
            })
        );
        this._endCropListener(scene);
    }

    private _addHoverForImageCopper(o: ImageCropperObject) {
        this.disposeWithMe(
            o.onPointerEnter$.subscribeEvent(() => {
                o.cursor = CURSOR_TYPE.MOVE;
            })
        );

        this.disposeWithMe(
            o.onPointerLeave$.subscribeEvent(() => {
                o.cursor = CURSOR_TYPE.DEFAULT;
            })
        );
    }

    private _endCropListener(scene: Scene) {
        const transformer = scene.getTransformerByCreate();

        this.disposeWithMe(
            transformer.clearControl$.subscribe((changeSelf) => {
                if (changeSelf === true) {
                    this._commandService.syncExecuteCommand(CloseImageCropOperation.id);
                }
            })
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
