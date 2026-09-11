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
import type { Scene } from '@univerjs/engine-render';
import type { ICloseImageCropOperationParams, IOpenImageCropOperationBySrcRectParams } from '../../commands/operations/image-crop.operation';
import type { LocaleKey } from '../../locale/types';
import {
    checkIfMove,
    Disposable,
    DisposableCollection,
    ICommandService,
    Inject,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceType,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import {
    getDrawingShapeKeyByDrawingSearch,
    IDrawingManagerService,
    SetDrawingSelectedOperation,
} from '@univerjs/drawing';
import { CURSOR_TYPE, Image, IRenderManagerService, precisionTo } from '@univerjs/engine-render';
import { ILayoutService, IMessageService, IShortcutService, KeyCode } from '@univerjs/ui';
import { BehaviorSubject, of, switchMap } from 'rxjs';
import {
    AutoImageCropOperation,
    CloseImageCropOperation,
    CropType,
    OpenImageCropOperation,
} from '../../commands/operations/image-crop.operation';
import { getImageCropRect } from '../../utils/image-crop-transform';
import { ImageCropperObject } from '../../views/crop/image-cropper-object';

const MOBILE_CROP_ANCHOR_HIT_SIZE = 44;

interface IImageCropSnapshot {
    transform: ITransformState;
    srcRect: Nullable<ISrcRect>;
}

interface IImageCropSession {
    scene: Scene;
    imageShape: Image;
    imageCropperObject: ImageCropperObject;
}

export class MobileImageCropperController extends Disposable {
    private _sceneListenerOnImageMap: WeakSet<Scene> = new WeakSet();
    private readonly _cropShortcutDisposables = new DisposableCollection();
    private readonly _cropSnapshots = new WeakMap<ImageCropperObject, IImageCropSnapshot>();
    private _pendingCropSnapshot: Nullable<IImageCropSnapshot> = null;
    private _activeCropSession: Nullable<IImageCropSession> = null;
    private readonly _cropping$ = new BehaviorSubject(false);
    readonly cropping$ = this._cropping$.asObservable();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IMessageService private readonly _messageService: IMessageService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @ILayoutService private readonly _layoutService: ILayoutService
    ) {
        super();

        this.disposeWithMe(this._cropShortcutDisposables);
        this.disposeWithMe({ dispose: () => this._cropping$.complete() });
        this._init();
    }

    private _init(): void {
        this._initOpenCrop();
        this._initCloseCrop();
        this._initAutoCrop();
    }

    private _initAutoCrop(): void {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== AutoImageCropOperation.id) {
                    return;
                }

                const params = command.params as IOpenImageCropOperationBySrcRectParams;
                if (params == null) {
                    return;
                }

                const drawingParams = this._drawingManagerService.getFocusDrawings();
                if (drawingParams.length !== 1) {
                    return;
                }

                const { cropType } = params;
                const { unitId, subUnitId, drawingId } = drawingParams[0];
                const scene = this._renderManagerService.getRenderUnitById(unitId)?.scene;

                if (scene == null) {
                    return true;
                }

                if (this._searchCropObject(scene) != null) {
                    this._commandService.syncExecuteCommand(CloseImageCropOperation.id, { isAuto: true });
                }

                const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
                const imageShape = scene.getObject(imageShapeKey);

                if (!(imageShape instanceof Image)) {
                    this._messageService.show({
                        type: MessageType.Error,
                        content: this._localeService.t<LocaleKey>('drawing-ui.image-cropper.error'),
                    });
                    return;
                }

                this._pendingCropSnapshot = this._captureCropSnapshot(imageShape);
                try {
                    this._updateCropperObject(cropType, imageShape);
                    this._commandService.syncExecuteCommand(OpenImageCropOperation.id, { unitId, subUnitId, drawingId });
                } finally {
                    this._pendingCropSnapshot = null;
                }
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

    private _updateCropperObject(cropType: CropType, imageShape: Image): void {
        const { left, top, width, height } = imageShape.calculateTransformWithSrcRect();

        let newSrcRect: Nullable<ISrcRect>;
        switch (cropType) {
            case CropType.R1_1:
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 1, 1);
                break;
            case CropType.R16_9:
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 16, 9);
                break;
            case CropType.R9_16:
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 9, 16);
                break;
            case CropType.R5_4:
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 5, 4);
                break;
            case CropType.R4_5:
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 4, 5);
                break;
            case CropType.R4_3:
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 4, 3);
                break;
            case CropType.R3_4:
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 3, 4);
                break;
            case CropType.R3_2:
                newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 3, 2);
                break;
            case CropType.R2_3:
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

    private _initOpenCrop(): void {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== OpenImageCropOperation.id) {
                    return;
                }

                const params = command.params as IDrawingSearch;
                if (params == null) {
                    return;
                }

                if (this._activeCropSession != null) {
                    this._commandService.syncExecuteCommand(CloseImageCropOperation.id, { isAuto: true });
                }

                const { unitId, subUnitId, drawingId } = params;
                const scene = this._renderManagerService.getRenderUnitById(unitId)?.scene;

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
                if (!(imageShape instanceof Image)) {
                    this._messageService.show({
                        type: MessageType.Error,
                        content: this._localeService.t<LocaleKey>('drawing-ui.image-cropper.error'),
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
                imageCropperObject.transformerConfig = {
                    ...imageCropperObject.transformerConfig,
                    cropAnchorHitSize: MOBILE_CROP_ANCHOR_HIT_SIZE,
                };
                this._cropSnapshots.set(imageCropperObject, this._pendingCropSnapshot ?? this._captureCropSnapshot(imageShape));
                this._pendingCropSnapshot = null;

                scene.addObject(imageCropperObject, imageShape.getLayerIndex() + 1).attachTransformerTo(imageCropperObject);
                this._activeCropSession = { scene, imageShape, imageCropperObject };
                this._cropping$.next(true);
                transformer?.createControlForCopper(imageCropperObject);
                this._addHoverForImageCopper(imageCropperObject);

                imageShape.openRenderByCropper();
                transformer?.refreshControls();
                imageCropperObject.makeDirty(true);

                this._registerCropShortcuts(imageCropperObject);
                this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, [{ unitId, subUnitId, drawingId }]);
                this._layoutService.focus();
            })
        );
    }

    private _searchCropObject(scene: Scene): ImageCropperObject | undefined {
        for (const object of scene.getAllObjectsByOrder()) {
            if (object instanceof ImageCropperObject) {
                return object;
            }
        }
    }

    private _initCloseCrop(): void {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== CloseImageCropOperation.id) {
                    return;
                }

                const cropSession = this._activeCropSession;
                if (cropSession == null) {
                    return;
                }

                this._activeCropSession = null;
                const { scene, imageShape, imageCropperObject } = cropSession;
                const transformer = scene.getTransformerByCreate();
                transformer.detachFrom(imageCropperObject);
                transformer.clearCopperControl();

                const params = command.params as ICloseImageCropOperationParams | undefined;
                if (params?.isCancel) {
                    this._restoreCropSnapshot(imageShape, imageCropperObject);
                } else {
                    const srcRect = getImageCropRect(imageShape, imageCropperObject);
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
                }

                imageShape.closeRenderByCropper();
                imageShape.makeDirty(true);
                transformer.refreshControls();

                this._cropSnapshots.delete(imageCropperObject);
                imageCropperObject.dispose();
                this._cropping$.next(false);
                this._cropShortcutDisposables.dispose();
            })
        );

        const sheetUnit$ = this._univerInstanceService
            .getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .pipe(switchMap((workbook) => workbook ? workbook.activeSheet$ : of(null)));

        this.disposeWithMe(sheetUnit$.subscribe(() => {
            if (this._activeCropSession != null) {
                this._commandService.syncExecuteCommand(CloseImageCropOperation.id);
            }
        }));
    }

    private _getApplyObjectByCropObject(cropObject: ImageCropperObject): Nullable<Image> {
        const applyOKey = cropObject.oKey.slice(0, cropObject.oKey.length - 5);
        const scene = cropObject.getScene();
        if (!scene) {
            return null;
        }

        return scene.getObject(applyOKey) as Image ?? null;
    }

    private _captureCropSnapshot(imageShape: Image): IImageCropSnapshot {
        return {
            transform: imageShape.getState(),
            srcRect: imageShape.srcRect == null ? imageShape.srcRect : { ...imageShape.srcRect },
        };
    }

    private _restoreCropSnapshot(imageShape: Image, imageCropperObject: ImageCropperObject): void {
        const snapshot = this._cropSnapshots.get(imageCropperObject);
        if (snapshot) {
            imageShape.transformByStateCloseCropper(snapshot.transform);
            imageShape.setSrcRect(snapshot.srcRect);
        }
    }

    private _registerCropShortcuts(imageCropperObject: ImageCropperObject): void {
        this._cropShortcutDisposables.dispose();
        this._cropShortcutDisposables.add(imageCropperObject.onDispose$.subscribeEvent(() => {
            this._activeCropSession = null;
            this._cropping$.next(false);
            this._cropShortcutDisposables.dispose();
        }));
        this._cropShortcutDisposables.add(this._shortcutService.registerShortcut({
            id: CloseImageCropOperation.id,
            binding: KeyCode.ENTER,
            priority: 1000,
        }));
        this._cropShortcutDisposables.add(this._shortcutService.registerShortcut({
            id: CloseImageCropOperation.id,
            binding: KeyCode.ESC,
            priority: 1000,
            staticParameters: { isCancel: true },
        }));
    }

    private _addListenerOnImage(scene: Scene): void {
        const transformer = scene.getTransformerByCreate();
        let startTransform: Nullable<ITransformState> = null;

        this.disposeWithMe(
            transformer.changeStart$.subscribe((state) => {
                const cropObject = state.objects.values().next().value as ImageCropperObject;
                if (!(cropObject instanceof ImageCropperObject)) {
                    return;
                }

                const { left, top, height, width, angle } = cropObject;
                startTransform = { left, top, height, width, angle };
                transformer.clearCopperControl();
            })
        );

        this.disposeWithMe(
            transformer.changeEnd$.subscribe((state) => {
                const cropObject = state.objects.values().next().value as ImageCropperObject;
                if (!(cropObject instanceof ImageCropperObject)) {
                    return;
                }

                const { left, top, height, width, angle } = cropObject;
                if (!checkIfMove({ left, top, height, width, angle }, startTransform)) {
                    transformer.createControlForCopper(cropObject);
                    return;
                }

                const applyObject = this._getApplyObjectByCropObject(cropObject);
                if (applyObject == null) {
                    return;
                }

                const srcRect = getImageCropRect(applyObject, cropObject);
                cropObject.refreshSrcRect(srcRect.srcRect, applyObject.getState());
                transformer.createControlForCopper(cropObject);
            })
        );
        this._endCropListener(scene);
    }

    private _addHoverForImageCopper(cropper: ImageCropperObject): void {
        this.disposeWithMe(cropper.onPointerEnter$.subscribeEvent(() => {
            cropper.cursor = CURSOR_TYPE.MOVE;
        }));
        this.disposeWithMe(cropper.onPointerLeave$.subscribeEvent(() => {
            cropper.cursor = CURSOR_TYPE.DEFAULT;
        }));
    }

    private _endCropListener(scene: Scene): void {
        const transformer = scene.getTransformerByCreate();
        this.disposeWithMe(
            transformer.clearControl$.subscribe((changeSelf) => {
                if (changeSelf === true) {
                    this._commandService.syncExecuteCommand(CloseImageCropOperation.id);
                }
            })
        );
    }
}
