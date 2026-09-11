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

import type { ICommandInfo, IDrawingSearch, Nullable } from '@univerjs/core';
import type { IImageData } from '@univerjs/drawing';
import type { Image, Scene } from '@univerjs/engine-render';
import {
    Disposable,
    DrawingTypeEnum,
    ICommandService,
    ImageSourceType,
    Inject,
    IUniverInstanceService,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch, IDrawingManagerService, SetDrawingSelectedOperation } from '@univerjs/drawing';
import { CURSOR_TYPE, IRenderManagerService } from '@univerjs/engine-render';
import { bufferTime, combineLatest, filter, map } from 'rxjs';
import { ImageResetSizeOperation } from '../../commands/operations/image-reset-size.operation';
import { DrawingRenderService, ensureDrawingRenderLayer } from '../../services/drawing-render.service';
import { MobileImagePreviewButton } from '../../views/image-preview/mobile-image-preview-button';
import { getCurrentUnitInfo } from '../utils';
import { MobileImageCropperController } from './image-cropper.controller';

export class MobileImageUpdateController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(DrawingRenderService) private readonly _drawingRenderService: DrawingRenderService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(MobileImageCropperController) private readonly _imageCropperController: MobileImageCropperController
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._drawingAddListener();
        this._commandExecutedListener();
        this._imageUpdateListener();
    }

    private _commandExecutedListener(): void {
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

        const renderObject = this._renderManagerService.getRenderUnitById(unitId);
        const scene = renderObject?.scene;

        if (scene == null) {
            return null;
        }

        return { scene, transformer: scene.getTransformerByCreate() };
    }

    private _resetImageSize(params: IDrawingSearch[]): void {
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

            if (!sceneList.includes(scene)) {
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
            scene.getTransformerByCreate().refreshControls().changeNotification();
        });

        this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, params);
    }

    private _drawingAddListener(): void {
        this.disposeWithMe(
            this._drawingManagerService.add$
                .pipe(
                    bufferTime(33),
                    filter((batches) => batches.length > 0),
                    map((batches) => batches.flat()),
                    map((items) => {
                        const map = new Map<string, IDrawingSearch>();
                        for (const item of items) {
                            map.set(`${item.unitId}|${item.subUnitId}|${item.drawingId}`, item);
                        }
                        return [...map.values()];
                    }),
                    filter((items) => items.length > 0)
                )
                .subscribe((uniqueParams) => {
                    this._insertImages(uniqueParams);
                })
        );
    }

    private _insertImages(params: IDrawingSearch[]): void {
        params.forEach(async (param) => {
            const { unitId, subUnitId } = param;
            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
            const currentSubUnitId = getCurrentUnitInfo(this._currentUniverService, unitId)?.subUnitId;

            if (renderObject == null || currentSubUnitId !== subUnitId) {
                return;
            }

            const imageParam = this._drawingManagerService.getDrawingByParam(param) as IImageData;
            if (imageParam == null) {
                return;
            }

            const images = await this._drawingRenderService.renderImages(imageParam, renderObject.scene);
            const currentImageParam = this._drawingManagerService.getDrawingByParam(param) as IImageData;
            if (currentImageParam) {
                this._drawingManagerService.refreshTransform([currentImageParam]);
            }

            if (images == null || images.length === 0) {
                return;
            }

            for (const image of images) {
                this._addHoverForImage(image);
                this._addDialogForImage(image, param);
            }
        });
    }

    private _imageUpdateListener(): void {
        this.disposeWithMe(
            this._drawingManagerService.update$.subscribe((params) => {
                params.forEach((param) => {
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

                    const { scene } = renderObject;
                    if (transform == null) {
                        return true;
                    }

                    const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
                    const imageShape = scene.getObject(drawingShapeKey) as Image;
                    if (imageShape == null) {
                        return true;
                    }

                    const { left = 0, top = 0, width = 0, height = 0, angle = 0, flipX = false, flipY = false, skewX = 0, skewY = 0 } = transform;

                    imageShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                    (imageShape as Image & { setClipBounds?: (clipBounds?: unknown) => void }).setClipBounds?.((transform as { clipBounds?: unknown }).clipBounds);
                    ensureDrawingRenderLayer(scene, imageShape, drawingParam);
                    imageShape.setSrcRect(srcRect);
                    imageShape.setPrstGeom(prstGeom);
                    if (source != null && source.length > 0 && (imageSourceType === ImageSourceType.BASE64 || imageSourceType === ImageSourceType.URL)) {
                        imageShape.changeSource(source);
                    }
                });
            })
        );
    }

    private _addHoverForImage(image: Image): void {
        this.disposeWithMe(toDisposable(image.onPointerEnter$.subscribeEvent(() => {
            image.cursor = CURSOR_TYPE.GRAB;
        })));
        this.disposeWithMe(toDisposable(image.onPointerLeave$.subscribeEvent(() => {
            image.cursor = CURSOR_TYPE.DEFAULT;
        })));
    }

    private _addDialogForImage(image: Image, param: IDrawingSearch): void {
        const preview = () => {
            const native = image.getNative();
            if (native) {
                this._drawingRenderService.previewImage(
                    `${image.oKey}-viewer-dialog`,
                    native.src,
                    image.getNativeSize().width,
                    image.getNativeSize().height
                );
            }
        };
        const scene = image.getScene();
        if (scene) {
            const button = new MobileImagePreviewButton(image, scene, this._themeService, preview);
            const registration = this.disposeWithMe(() => button.dispose());
            button.disposeWithMe(() => registration.dispose());
            button.disposeWithMe(combineLatest([
                this._drawingManagerService.focus$,
                this._imageCropperController.cropping$,
            ]).subscribe(([drawings, cropping]) => {
                button.setPreviewEnabled(!cropping && !drawings.some((drawing) =>
                    drawing.unitId === param.unitId && drawing.subUnitId === param.subUnitId && drawing.drawingId === param.drawingId));
            }));
        }

        this.disposeWithMe(toDisposable(image.onDblclick$.subscribeEvent(preview)));
    }
}
