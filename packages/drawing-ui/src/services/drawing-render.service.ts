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

import type { IDrawingSearch } from '@univerjs/core';
import type { IDocFloatDomData, IImageData } from '@univerjs/drawing';
import type { IImageProps, IRectProps, Scene } from '@univerjs/engine-render';
import { DrawingTypeEnum } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch, IDrawingManagerService, IImageIoService, ImageSourceType } from '@univerjs/drawing';
import { DRAWING_OBJECT_LAYER_INDEX, Image, Rect } from '@univerjs/engine-render';
import { IGalleryService } from '@univerjs/ui';
import { insertGroupObject } from '../controllers/utils';

// const IMAGE_VIEWER_DROPDOWN_PADDING = 50;

export class DrawingRenderService {
    constructor(
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IImageIoService private readonly _imageIoService: IImageIoService,
        @IGalleryService private readonly _galleryService: IGalleryService
    ) { }

    // eslint-disable-next-line max-lines-per-function
    async renderImages(imageParam: IImageData, scene: Scene) {
        const {
            transform: singleTransform,
            drawingType,
            source,
            imageSourceType,
            srcRect,
            prstGeom,
            groupId,
            unitId,
            subUnitId,
            drawingId,
            isMultiTransform,
            transforms: multiTransforms,
        } = imageParam;
        if (drawingType !== DrawingTypeEnum.DRAWING_IMAGE) {
            return;
        }

        if (!this._drawingManagerService.getDrawingVisible()) {
            return;
        }

        if (singleTransform == null) {
            return;
        }

        const transforms = isMultiTransform && multiTransforms ? multiTransforms : [singleTransform];

        const images = [];
        for (const transform of transforms) {
            const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;
            const index = transforms.indexOf(transform);
            const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId }, isMultiTransform ? index : undefined);
            const imageShape = scene.getObject(imageShapeKey);

            if (imageShape != null) {
                imageShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                continue;
            }

            const orders = this._drawingManagerService.getDrawingOrder(unitId, subUnitId);
            const zIndex = orders.indexOf(drawingId);
            const imageConfig: IImageProps = { ...transform, zIndex: zIndex === -1 ? (orders.length - 1) : zIndex };
            const imageNativeCache = this._imageIoService.getImageSourceCache(source, imageSourceType);

            let shouldBeCache = false;
            if (imageNativeCache != null) {
                imageConfig.image = imageNativeCache;
            } else {
                if (imageSourceType === ImageSourceType.UUID) {
                    try {
                        imageConfig.url = await this._imageIoService.getImage(source);
                    } catch (error) {
                        console.error(error);
                        continue;
                    }
                } else {
                    imageConfig.url = source;
                }
                shouldBeCache = true;
            }

            if (scene.getObject(imageShapeKey)) {
                // The image maybe already added  in the time we are getting  the source of the image
                continue;
            }

            imageConfig.printable = true;
            const image = new Image(imageShapeKey, imageConfig);
            if (shouldBeCache) {
                this._imageIoService.addImageSourceCache(source, imageSourceType, image.getNative());
            }

            if (!this._drawingManagerService.getDrawingVisible()) {
                continue;
            }

            scene.addObject(image, DRAWING_OBJECT_LAYER_INDEX);
            if (this._drawingManagerService.getDrawingEditable()) {
                scene.attachTransformerTo(image);
            }

            groupId && insertGroupObject({ drawingId: groupId, unitId, subUnitId }, image, scene, this._drawingManagerService);

            if (prstGeom != null) {
                image.setPrstGeom(prstGeom);
            }
            if (srcRect != null) {
                image.setSrcRect(srcRect);
            }

            images.push(image);
        }

        return images;
    }

    renderFloatDom(param: IDocFloatDomData, scene: Scene) {
        const {
            transform: singleTransform,
            drawingType,
            groupId,
            unitId,
            subUnitId,
            drawingId,
            isMultiTransform,
            transforms: multiTransforms,
        } = param;
        if (drawingType !== DrawingTypeEnum.DRAWING_DOM) {
            return;
        }

        if (!this._drawingManagerService.getDrawingVisible()) {
            return;
        }

        if (singleTransform == null) {
            return;
        }

        const transforms = isMultiTransform && multiTransforms ? multiTransforms : [singleTransform];

        const rects = [];
        for (const transform of transforms) {
            const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;
            const index = transforms.indexOf(transform);
            const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId }, isMultiTransform ? index : undefined);
            const imageShape = scene.getObject(imageShapeKey);

            if (imageShape != null) {
                imageShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
                continue;
            }

            const orders = this._drawingManagerService.getDrawingOrder(unitId, subUnitId);
            const zIndex = orders.indexOf(drawingId);
            const rectConfig: IRectProps = { ...transform, zIndex: zIndex === -1 ? (orders.length - 1) : zIndex };

            if (scene.getObject(imageShapeKey)) {
                // The image maybe already added  in the time we are getting  the source of the image
                continue;
            }

            rectConfig.printable = false;
            const rect = new Rect(imageShapeKey, rectConfig);

            if (!this._drawingManagerService.getDrawingVisible()) {
                continue;
            }

            scene.addObject(rect, DRAWING_OBJECT_LAYER_INDEX);
            if (this._drawingManagerService.getDrawingEditable() && param.allowTransform !== false) {
                scene.attachTransformerTo(rect);
            }

            groupId && insertGroupObject({ drawingId: groupId, unitId, subUnitId }, rect, scene, this._drawingManagerService);
            rects.push(rect);
        }

        return rects;
    }

    renderDrawing(param: IDrawingSearch, scene: Scene) {
        const drawingParam = this._drawingManagerService.getDrawingByParam(param);
        if (drawingParam == null) {
            return;
        }

        switch (drawingParam.drawingType) {
            case DrawingTypeEnum.DRAWING_IMAGE:
                return this.renderImages(drawingParam as IImageData, scene);
            default:
        }
    }

    previewImage(key: string, src: string, width: number, height: number) {
        // const dialogId = `${key}-viewer-dialog`;

        // const screenWidth = window.innerWidth - IMAGE_VIEWER_DROPDOWN_PADDING;
        // const screenHeight = window.innerHeight - IMAGE_VIEWER_DROPDOWN_PADDING;

        // const adjustSize = this._adjustImageSize(width, height, screenWidth, screenHeight);
        this._galleryService.open({
            images: [src],
            onOpenChange: (open) => {
                if (!open) {
                    this._galleryService.close();
                }
            },
        });
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
