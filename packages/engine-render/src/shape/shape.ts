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

import type { IOffset, IScale, ISize, Nullable } from '@univerjs/core';
import type { IObjectFullState } from '../basics/interfaces';
import type { IBoundRectNoAngle, IViewportInfo, Vector2 } from '../basics/vector2';
import type { UniverRenderingContext } from '../context';
import { BASE_OBJECT_ARRAY, BaseObject, ObjectType } from '../base-object';
import { SHAPE_TYPE } from '../basics/const';
import { Canvas } from '../canvas';

export type LineJoin = 'round' | 'bevel' | 'miter';
export type LineCap = 'butt' | 'round' | 'square';
export type PaintFirst = 'fill' | 'stroke';

const BASE_OBJECT_ARRAY_Set = new Set(BASE_OBJECT_ARRAY);

function resolveRenderCachePixelRatio(ctx: UniverRenderingContext, fixedPixelRatio?: number): number {
    if (fixedPixelRatio !== undefined) {
        return fixedPixelRatio;
    }

    const transform = ctx.getTransform();
    return Math.max(Math.hypot(transform.a, transform.b), Math.hypot(transform.c, transform.d));
}

export interface IShapeProps extends IObjectFullState, ISize, IOffset, IScale {
    rotateEnabled?: boolean;
    resizeEnabled?: boolean;
    borderEnabled?: boolean;
    hoverCursor?: Nullable<string>;
    moveCursor?: string | null;
    fillRule?: string;
    globalCompositeOperation?: string;
    evented?: boolean;
    visible?: boolean;
    paintFirst?: PaintFirst;

    stroke?: Nullable<string | CanvasGradient>;
    strokeOpacity?: number;
    strokeScaleEnabled?: boolean; // strokeUniform: boolean;
    fill?: Nullable<string | CanvasGradient>;
    fillOpacity?: number;
    fillAfterStrokeEnabled?: boolean;
    hitStrokeWidth?: number | string;
    strokeLineJoin?: LineJoin;
    strokeLineCap?: LineCap;
    shadowColor?: Nullable<string>;
    shadowBlur?: number;
    shadowOffset?: Nullable<Vector2>;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowOpacity?: number;
    shadowEnabled?: boolean;
    shadowForStrokeEnabled?: boolean;
    strokeDashArray?: Nullable<number[]>;
    strokeDashOffset?: number;
    strokeMiterLimit?: number;
    strokeWidth?: number;

    parent?: IScale;
}

export const SHAPE_OBJECT_ARRAY = [
    'hoverCursor',
    'moveCursor',
    'fillRule',
    'globalCompositeOperation',
    'paintFirst',
    'stroke',
    'strokeOpacity',
    'strokeScaleEnabled',
    'fill',
    'fillOpacity',
    'fillAfterStrokeEnabled',
    'hitStrokeWidth',
    'strokeLineJoin',
    'strokeLineCap',
    'shadowColor',
    'shadowBlur',
    'shadowOffset',
    'shadowOffsetX',
    'shadowOffsetY',
    'shadowOpacity',
    'shadowEnabled',
    'shadowForStrokeEnabled',
    'strokeDashArray',
    'strokeDashOffset',
    'strokeMiterLimit',
];

export abstract class Shape<T extends IShapeProps> extends BaseObject {
    private _renderCacheCanvas: Nullable<Canvas>;
    private _renderCacheBounds: Nullable<IBoundRectNoAngle>;
    private _renderCachePixelRatio = 0;
    private _renderCacheTransformSize: Nullable<ISize>;

    private _hoverCursor: Nullable<string>;

    private _moveCursor: string | null = null;

    private _fillRule: string = 'nonzero';

    private _globalCompositeOperation: string = 'source-over';

    private _paintFirst: PaintFirst = 'fill';

    private _stroke: Nullable<string | CanvasGradient>;

    private _strokeOpacity?: number;

    private _strokeScaleEnabled: boolean = false; // strokeUniform: boolean;

    private _fill: Nullable<string | CanvasGradient>;

    private _fillOpacity?: number;

    private _fillAfterStrokeEnabled: boolean = false;

    private _hitStrokeWidth: number | string = 0;

    private _strokeLineJoin: LineJoin = 'round';

    private _strokeLineCap: LineCap = 'round';

    private _shadowColor: Nullable<string>;

    private _shadowBlur: number = 0;

    private _shadowOffset: Nullable<Vector2>;

    private _shadowOffsetX: number = 0;

    private _shadowOffsetY: number = 0;

    private _shadowOpacity: number = 0;

    private _shadowEnabled: boolean = false;

    private _shadowForStrokeEnabled: boolean = false;

    private _strokeDashArray: Nullable<number[]>;

    private _strokeDashOffset: number = 0;

    private _strokeMiterLimit: number = 0;

    private _type: SHAPE_TYPE = SHAPE_TYPE.RECT;

    override objectType = ObjectType.SHAPE;

    constructor(key?: string, props?: T) {
        super(key);

        this._initialProps(props);
    }

    get hoverCursor() {
        return this._hoverCursor;
    }

    get moveCursor() {
        return this._moveCursor;
    }

    get fillRule() {
        return this._fillRule;
    }

    get globalCompositeOperation() {
        return this._globalCompositeOperation;
    }

    get paintFirst() {
        return this._paintFirst;
    }

    get stroke() {
        return this._stroke;
    }

    get strokeOpacity() {
        return this._strokeOpacity;
    }

    get strokeScaleEnabled() {
        return this._strokeScaleEnabled;
    }

    get fill() {
        return this._fill;
    }

    get fillOpacity() {
        return this._fillOpacity;
    }

    get fillAfterStrokeEnabled() {
        return this._fillAfterStrokeEnabled;
    }

    get hitStrokeWidth() {
        return this._hitStrokeWidth;
    }

    get strokeLineJoin() {
        return this._strokeLineJoin;
    }

    get strokeLineCap() {
        return this._strokeLineCap;
    }

    get shadowColor() {
        return this._shadowColor;
    }

    get shadowBlur() {
        return this._shadowBlur;
    }

    get shadowOffset() {
        return this._shadowOffset;
    }

    get shadowOffsetX() {
        return this._shadowOffsetX;
    }

    get shadowOffsetY() {
        return this._shadowOffsetY;
    }

    get shadowOpacity() {
        return this._shadowOpacity;
    }

    get shadowEnabled() {
        return this._shadowEnabled;
    }

    get shadowForStrokeEnabled() {
        return this._shadowForStrokeEnabled;
    }

    get strokeDashArray() {
        return this._strokeDashArray;
    }

    get strokeDashOffset() {
        return this._strokeDashOffset;
    }

    get strokeMiterLimit() {
        return this._strokeMiterLimit;
    }

    static drawWith(ctx: UniverRenderingContext, props: IShapeProps) {
        /** abstract */
    }

    protected static _renderPaintInOrder(ctx: UniverRenderingContext, props: IShapeProps) {
        if (props.paintFirst === 'stroke') {
            this._renderStroke(ctx, props);
            this._renderFill(ctx, props);
        } else {
            this._renderFill(ctx, props);
            this._renderStroke(ctx, props);
        }
    }

    /**
     * @private
     * @param {UniverRenderingContext} ctx SheetContext to render on
     */
    private static _renderFill(ctx: UniverRenderingContext, props: IShapeProps) {
        if (!props.fill) {
            return;
        }

        ctx.save();
        this._setFillStyles(ctx, props);
        ctx.globalAlpha *= props.fillOpacity ?? 1;
        if (props.fillRule === 'evenodd') {
            ctx.fill('evenodd');
        } else {
            ctx.fill();
        }
        ctx.restore();
    }

    /**
     * @private
     * @param {UniverRenderingContext} ctx SheetContext to render on
     */
    private static _renderStroke(ctx: UniverRenderingContext, props: IShapeProps) {
        const { stroke, strokeWidth } = props;

        // let { scaleX, scaleY } = props;
        // const { scaleX = 1, scaleY = 1 } = ctx.getScale();
        if (!stroke || strokeWidth === undefined || !Number.isFinite(strokeWidth) || strokeWidth <= 0) {
            return;
        }

        ctx.save();
        // if (strokeScaleEnabled === false) {
        //     scaleX = scaleX === 0 ? 1 : scaleX;
        //     scaleY = scaleY === 0 ? 1 : scaleY;
        //     ctx.scale(1 / scaleX, 1 / scaleY);
        // }
        // this._setLineDash(ctx);
        this._setStrokeStyles(ctx, props);
        ctx.globalAlpha *= props.strokeOpacity ?? 1;

        ctx.stroke();
        ctx.restore();
    }

    // private static _getObjectScaling() {
    //     return { scaleX: 1, scaleY: 1 };
    // }

    private static _removeShadow(ctx: UniverRenderingContext) { }

    private static _setFillStyles(ctx: UniverRenderingContext, props: IShapeProps) {
        ctx.fillStyle = props.fill!;
    }

    private static _setStrokeStyles(ctx: UniverRenderingContext, props: IShapeProps) {
        const { strokeWidth, strokeLineCap, strokeDashOffset, strokeLineJoin, strokeMiterLimit, stroke } = props;
        ctx.lineWidth = strokeWidth!;
        ctx.lineCap = strokeLineCap!;
        ctx.lineDashOffset = strokeDashOffset!;
        ctx.lineJoin = strokeLineJoin!;
        ctx.miterLimit = strokeMiterLimit!;
        ctx.strokeStyle = stroke!;
    }

    override render(mainCtx: UniverRenderingContext, bounds?: IViewportInfo) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        // Temporarily ignore the on-demand display of elements within a group：this.isInGroup
        if (this.isRender(bounds)) {
            const { top, left, bottom, right } = bounds!.viewBound;

            if (
                this.width + this.strokeWidth + this.left < left ||
                right < this.left ||
                this.height + this.strokeWidth + this.top < top ||
                bottom < this.top
            ) {
                return this;
            }
        }

        const m = this.transform.getMatrix();
        mainCtx.save();
        mainCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        this._draw(mainCtx, bounds);
        mainCtx.restore();
        this.makeDirty(false);
        return this;
    }

    /**
     * if BASE_OBJECT_ARRAY_Set.has(key) not exist, then this[_key] = props[key],
     * @param props
     */
    setProps(props?: T): Shape<T> {
        if (!props) {
            return this;
        }

        const themeKeys = Object.keys(props);
        if (themeKeys.length === 0) {
            return this;
        }
        themeKeys.forEach((key) => {
            if ((props as Record<string, any>)[key] === undefined) {
                return true;
            }

            if (!BASE_OBJECT_ARRAY_Set.has(key)) {
                (this as Record<string, any>)[`_${key}`] = (props as Record<string, any>)[key];
            }
        });
        this.makeDirty(true);
        return this;
    }

    getPropByKey<K extends keyof T>(key: K): T[K] {
        return (this as Record<string, any>)[`_${String(key)}`] as T[K];
    }

    override toJson() {
        const props: Record<string, any> = {};
        SHAPE_OBJECT_ARRAY.forEach((key) => {
            if (this[key as keyof Shape<T>]) {
                props[key] = this[key as keyof Shape<T>];
            }
        });
        return {
            ...super.toJson(),
            ...props,
        };
    }

    override transformByState(option: IObjectFullState): this | undefined {
        const previousWidth = this.width;
        const previousHeight = this.height;
        const cachedSize = this._renderCacheTransformSize;
        const hasReusableCache = Boolean(
            this._renderCacheCanvas &&
            this._renderCacheBounds &&
            cachedSize?.width === this.width &&
            cachedSize.height === this.height
        );

        const result = super.transformByState(option);
        const geometryChanged = previousWidth !== this.width || previousHeight !== this.height;
        if (hasReusableCache && !geometryChanged) {
            // Translation and rotation only change the outer transform; the cached local pixels
            // remain valid. Keep filters and 3D effects out of the per-frame drag path.
            this.makeDirty(false);
        } else if (geometryChanged) {
            this._releaseRenderCache();
        }
        return result;
    }

    override translate(x?: number | string, y?: number | string): this {
        const cachedSize = this._renderCacheTransformSize;
        const hasReusableCache = Boolean(
            this._renderCacheCanvas &&
            this._renderCacheBounds &&
            cachedSize?.width === this.width &&
            cachedSize.height === this.height
        );

        super.translate(x, y);
        if (hasReusableCache) {
            this.makeDirty(false);
        }
        return this;
    }

    protected _renderWithCache(
        ctx: UniverRenderingContext,
        bounds: IBoundRectNoAngle,
        draw: (cacheContext: UniverRenderingContext) => void,
        fixedPixelRatio?: number
    ): void {
        const pixelRatio = resolveRenderCachePixelRatio(ctx, fixedPixelRatio);
        if (pixelRatio <= Number.EPSILON) {
            return;
        }

        const width = Math.ceil((bounds.right - bounds.left) * pixelRatio) / pixelRatio;
        const height = Math.ceil((bounds.bottom - bounds.top) * pixelRatio) / pixelRatio;
        if (width <= 0 || height <= 0) {
            return;
        }

        const cacheBoundsChanged =
            this._renderCacheBounds?.left !== bounds.left ||
            this._renderCacheBounds?.top !== bounds.top ||
            this._renderCacheBounds?.right !== bounds.right ||
            this._renderCacheBounds?.bottom !== bounds.bottom;
        const cacheSizeChanged =
            this._renderCacheCanvas?.getWidth() !== width ||
            this._renderCacheCanvas?.getHeight() !== height ||
            this._renderCachePixelRatio !== pixelRatio;

        if (!this._renderCacheCanvas) {
            this._renderCacheCanvas = new Canvas({
                colorService: this.getEngine()?.canvasColorService,
                width,
                height,
                pixelRatio,
            });
        } else if (cacheSizeChanged) {
            this._renderCacheCanvas.setSize(width, height, pixelRatio);
        }

        if (this.isDirty() || cacheBoundsChanged || cacheSizeChanged) {
            const cacheContext = this._renderCacheCanvas.getContext();
            this._renderCacheCanvas.clear();
            cacheContext.save();
            cacheContext.translate(-bounds.left, -bounds.top);
            draw(cacheContext);
            cacheContext.restore();
            this._renderCacheBounds = { ...bounds };
            this._renderCachePixelRatio = pixelRatio;
            this._renderCacheTransformSize = { width: this.width, height: this.height };
        }

        ctx.drawImage(
            this._renderCacheCanvas.getCanvasEle(),
            bounds.left,
            bounds.top,
            width,
            height
        );
    }

    protected _releaseRenderCache(): void {
        this._renderCacheCanvas?.dispose();
        this._renderCacheCanvas = null;
        this._renderCacheBounds = null;
        this._renderCachePixelRatio = 0;
        this._renderCacheTransformSize = null;
    }

    protected _draw(ctx: UniverRenderingContext, bounds?: IViewportInfo) {
        /** abstract */
    }

    private _initialProps(props?: T) {
        if (!props) {
            return;
        }

        const themeKeys = Object.keys(props);
        if (themeKeys.length === 0) {
            return;
        }

        const transformState: IObjectFullState = {};
        let hasTransformState = false;

        const hasRotateEnabled = props?.rotateEnabled !== undefined;
        const hasResizeEnabled = props?.resizeEnabled !== undefined;
        const hasBorderEnabled = props?.borderEnabled !== undefined;

        if (hasRotateEnabled || hasResizeEnabled || hasBorderEnabled) {
            const transformerConfig = this.transformerConfig || {};
            if (hasRotateEnabled) {
                transformerConfig.rotateEnabled = props?.rotateEnabled;
            }
            if (hasResizeEnabled) {
                transformerConfig.resizeEnabled = props?.resizeEnabled;
            }
            if (hasBorderEnabled) {
                transformerConfig.borderEnabled = props?.borderEnabled;
            }
            this.transformerConfig = { ...transformerConfig };
        }

        themeKeys.forEach((key) => {
            if ((props as Record<string, any>)[key] === undefined) {
                return true;
            }

            if (BASE_OBJECT_ARRAY_Set.has(key)) {
                transformState[key as keyof IObjectFullState] = (props as Record<string, any>)[key];
                hasTransformState = true;
            } else {
                (this as Record<string, any>)[`_${key}`] = (props as Record<string, any>)[key];
            }
        });

        if (hasTransformState) {
            this.transformByState(transformState);
        }

        this.makeDirty(true);
    }

    override dispose(): void {
        this._releaseRenderCache();
        super.dispose();
    }
}
