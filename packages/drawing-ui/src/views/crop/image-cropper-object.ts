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

import type { ISrcRect, ITransformState, Nullable, PresetGeometryType } from '@univerjs/core';
import type { Engine, IShapeProps, IViewportInfo, Scene, UniverRenderingContext, Vector2 } from '@univerjs/engine-render';
import { Canvas, Rect, Shape } from '@univerjs/engine-render';

export interface IImageCropperObjectProps extends IShapeProps {
    /**
     * 20.1.8.55 srcRect (Source Rectangle)
     */
    srcRect?: Nullable<ISrcRect>;

    /**
     * 20.1.9.18 prstGeom (Preset geometry)
     */
    prstGeom?: Nullable<PresetGeometryType>;
    applyTransform?: ITransformState;
    dragPadding?: number;
}

enum ImageCropperObjectType {
    RECT,
    PATH,
}

export class ImageCropperObject<T extends IImageCropperObjectProps = IImageCropperObjectProps> extends Shape<T> {
    private _srcRect: Nullable<ISrcRect>;
    private _prstGeom: Nullable<PresetGeometryType>;
    private _applyTransform: Nullable<ITransformState>;

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

        if (props?.srcRect) {
            this._srcRect = props.srcRect;
        }

        if (props?.prstGeom) {
            this._prstGeom = props.prstGeom;
        }

        if (props?.applyTransform) {
            this._applyTransform = props.applyTransform;
        }

        if (props?.dragPadding) {
            this._dragPadding = props.dragPadding;
        }

        this._applyProps();
    }

    refreshSrcRect(value: Nullable<ISrcRect>, transform: Nullable<ITransformState>) {
        this._srcRect = value;
        this._applyTransform = transform;
        this._applyProps();
    }

    get srcRect() {
        return this._srcRect;
    }

    override dispose() {
        super.dispose();
        this._cacheCanvas?.dispose();
        this._srcRect = null;
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

    override render(mainCtx: UniverRenderingContext, bounds?: IViewportInfo) {
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
        // const { left, top, width, height, angle } = applyObject;
        const scene = this.getScene() as Scene;

        const engine = scene.getEngine() as Engine;

        const { width: engineWidth, height: engineHeight } = engine;

        this._initialCacheCanvas();

        // if (this._dirty) {
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
        // } else {
        //     this._applyCache(ctx);
        // }
    }

    private _clipForApplyObject(cacheCtx: UniverRenderingContext) {
        let objectType = ImageCropperObjectType.RECT;

        if (this._prstGeom != null) {
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
        if (this._applyTransform == null) {
            return;
        }

        let cropLeft = 0;
        let cropTop = 0;
        let cropRight = 0;
        let cropBottom = 0;

        const { left: applyLeft = 0, top: applyTop = 0, width: applyWidth = 0, height: applyHeight = 0, angle } = this._applyTransform;

        if (this._srcRect != null) {
            const { left = 0, top = 0, right = 0, bottom = 0 } = this._srcRect;
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
        const scene = this.getScene();
        if (scene == null) return;

        this._cacheCanvas = new Canvas();
        const engine = scene.getEngine() as Engine;
        this._cacheCanvas.setSize(engine.width, engine.height);

        engine.onTransformChange$.subscribeEvent(() => {
            this._cacheCanvas?.setSize(engine.width, engine.height);
            this.makeDirty(true);
        });
    }
}
