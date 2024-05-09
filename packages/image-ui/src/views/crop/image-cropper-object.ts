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

import type { IKeyValue, ITransformState, Nullable } from '@univerjs/core';
import type { BaseObject, Engine, IShapeProps, IViewportBound, Scene, UniverRenderingContext, Vector2 } from '@univerjs/engine-render';
import { Canvas, degToRad, Rect, Shape, Transform } from '@univerjs/engine-render';
import type { IImageData } from '@univerjs/image';


export interface IImageCropperObjectProps extends IShapeProps {
    applyObject: BaseObject;
    imageData?: IImageData;
    dragPadding?: number;
}

enum ImageCropperObjectType {
    RECT,
    PATH,
}

export class ImageCropperObject<T extends IImageCropperObjectProps = IImageCropperObjectProps> extends Shape<T> {
    private _applyObject: Nullable<BaseObject>;

    private _imageData: Nullable<IImageData>;

    private _dragPadding = 8;

    private _cacheCanvas: Nullable<Canvas>;

    constructor(key?: string, props?: T) {
        if (props == null) {
            props = {} as T;
        }
        props.transformerConfig = {
            keepRatio: false,
            isCropper: true,
            anchorFill: 'rgb(0, 0, 0)',
            anchorStroke: 'rgb(255, 255, 255)',
            anchorSize: 24,
        };

        super(key, props);

        if (props?.applyObject) {
            this._applyObject = props.applyObject;
        }

        if (props?.imageData) {
            this._imageData = props.imageData;
        }

        if (props?.dragPadding) {
            this._dragPadding = props.dragPadding;
        }

        this._applyProps();
    }

    get applyObject() {
        return this._applyObject;
    }

    set applyObject(value: Nullable<BaseObject>) {
        this._applyObject = value;
        this._applyProps();
    }

    get imageData() {
        return this._imageData;
    }

    set imageData(value: Nullable<IImageData>) {
        this._imageData = value;
        this._applyProps();
    }

    get srcRect() {
        return this._imageData?.srcRect;
    }

    override dispose() {
        super.dispose();
        this._cacheCanvas?.dispose();
        this._applyObject = null;
        this._imageData = null;
    }

    override isHit(coord: Vector2) {
        const oCoord = this.getInverseCoord(coord);
        if (
            oCoord.x >= -this.strokeWidth / 2 &&
            oCoord.x <= this.width + this.strokeWidth / 2 &&
            oCoord.y >= -this.strokeWidth / 2 &&
            oCoord.y <= this.height + this.strokeWidth / 2 &&
            !this._inSurround(oCoord)
        ) {
            return true;
        }
        return false;
    }

    private _inSurround(oCoord: Vector2) {
        const padding = this._dragPadding;
        if (
            oCoord.x >= padding - this.strokeWidth / 2 &&
            oCoord.x <= this.width + this.strokeWidth / 2 - padding &&
            oCoord.y >= padding - this.strokeWidth / 2 &&
            oCoord.y <= this.height + this.strokeWidth / 2 - padding
        ) {
            return true;
        }

        return false;
    }

    override render(mainCtx: UniverRenderingContext, bounds?: IViewportBound) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        mainCtx.save();
        this._draw(mainCtx);
        mainCtx.restore();
        this.makeDirty(false);
        return this;
    }

    protected override _draw(ctx: UniverRenderingContext) {
        const applyObject = this._applyObject;
        if (!applyObject) {
            return;
        }

        // const { left, top, width, height, angle } = applyObject;

        const scene = applyObject.getScene() as Scene;


        const engine = scene.getEngine() as Engine;

        const { width: engineWidth, height: engineHeight } = engine;

        this._initialCacheCanvas();

        if (this._dirty) {
            this._cacheCanvas?.clear();
            const cacheCtx = this._cacheCanvas?.getContext();
            if (cacheCtx == null) {
                return;
            }

            cacheCtx.save();

            Rect.drawWith(cacheCtx, {
                left: 0,
                top: 0,
                width: engineWidth,
                height: engineHeight,
                fill: 'rgba(0, 0, 0, 0.5)',
            });

            cacheCtx.setTransform(ctx.getTransform());
            this._clipForApplyObject(cacheCtx);
            this._applyCache(ctx);
            cacheCtx.restore();
        } else {
            this._applyCache(ctx);
        }
    }

    private _clipForApplyObject(cacheCtx: UniverRenderingContext) {
        let objectType = ImageCropperObjectType.RECT;
        const imageData = this._imageData;
        if (imageData != null && imageData.prstGeom != null) {
            objectType = ImageCropperObjectType.PATH;
        }
        cacheCtx.globalCompositeOperation = 'destination-out';
        cacheCtx.beginPath();

        if (objectType === ImageCropperObjectType.RECT) {
            const m = this.transform.getMatrix();
            cacheCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            cacheCtx.rect(0, 0, this.width, this.height);
            cacheCtx.fill();
        } else {
            // const path = new Path2D(imageData.prstGeom);
            // cacheCtx.fill(path);
        }
    }

    private _applyProps() {
        if (this._applyObject == null) {
            return;
        }
        const imageData = this._imageData;
        let cropLeft = 0;
        let cropTop = 0;
        let cropRight = 0;
        let cropBottom = 0;

        const { left: applyLeft, top: applyTop, width: applyWidth, height: applyHeight, angle, strokeWidth: applyStrokeWidth } = this._applyObject;

        if (imageData != null && imageData.srcRect != null) {
            const { left = 0, top = 0, right = 0, bottom = 0 } = imageData.srcRect;
            cropLeft = left;
            cropTop = top;
            cropRight = right;
            cropBottom = bottom;
        }

        const left = applyLeft + cropLeft;
        const top = applyTop + cropTop;

        this.transformByState({
            left,
            top,
            width: applyLeft + applyWidth - cropRight - left,
            height: applyTop + applyHeight - cropBottom - top,
            angle,
        });
    }

    private _applyCache(ctx?: UniverRenderingContext) {
        if (!ctx || this._cacheCanvas == null) {
            return;
        }
        const cacheCtx = this._cacheCanvas.getContext();
        cacheCtx.save();
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(this._cacheCanvas.getCanvasEle(), 0, 0);
        ctx.restore();
        cacheCtx.restore();
    }

    private _initialCacheCanvas() {
        if (this._cacheCanvas != null) {
            return;
        }
        this._cacheCanvas = new Canvas();
        const engine = this.getScene().getEngine() as Engine;
        this._cacheCanvas.setSize(engine.width, engine.height);

        this.getScene().getEngine().onTransformChangeObservable.add(() => {
            this._cacheCanvas?.setSize(engine.width, engine.height);
            this.makeDirty(true);
        });
    }
}
