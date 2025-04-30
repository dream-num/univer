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

import type { Nullable } from '@univerjs/core';
import type { ICanvasColorService } from './services/canvas-color.service';
import type { IRenderConfig } from './services/render-config';
import { Tools } from '@univerjs/core';
import { fixLineWidthByScale, getColor } from './basics/tools';

export interface IUniverRenderingContextOptions {
    canvasColorService?: ICanvasColorService;
}

export class UniverRenderingContext2D implements CanvasRenderingContext2D {
    __mode = 'rendering';

    private _transformCache: Nullable<DOMMatrix>;
    readonly canvas: HTMLCanvasElement;

    _context: CanvasRenderingContext2D;
    private _systemType: string;
    private _browserType: string;

    renderConfig: Readonly<IRenderConfig> = {};

    private _canvasColorService?: ICanvasColorService;

    constructor(context: CanvasRenderingContext2D, options?: IUniverRenderingContextOptions) {
        this.canvas = context.canvas;
        this._context = context;

        this._canvasColorService = options?.canvasColorService;
    }

    private _id: string;

    getId() {
        return this._id;
    }

    setId(id: string) {
        this._id = id;
    }

    isContextLost(): boolean {
        // @ts-ignore
        return this._context.isContextLost();
    }

    // globalAlpha: number;
    get globalAlpha() {
        return this._context.globalAlpha;
    }

    set globalAlpha(val: number) {
        this._context.globalAlpha = val;
    }

    // globalCompositeOperation: GlobalCompositeOperation;
    get globalCompositeOperation() {
        return this._context.globalCompositeOperation;
    }

    set globalCompositeOperation(val: GlobalCompositeOperation) {
        this._context.globalCompositeOperation = val;
    }

    get fillStyle() {
        return this._context.fillStyle;
    }

    set fillStyle(val: string | CanvasGradient | CanvasPattern) {
        this._context.fillStyle = this._canvasColorService && typeof val === 'string'
            ? this._canvasColorService.getRenderColor(val)
            : val;
    }

    // strokeStyle: string | CanvasGradient | CanvasPattern;
    get strokeStyle() {
        return this._context.strokeStyle;
    }

    set strokeStyle(val: string | CanvasGradient | CanvasPattern) {
        this._context.strokeStyle = this._canvasColorService && typeof val === 'string'
            ? this._canvasColorService.getRenderColor(val)
            : val;
    }

    // filter: string;
    get filter() {
        return this._context.filter;
    }

    set filter(val: string) {
        this._context.filter = val;
    }

    // imageSmoothingEnabled: boolean;
    get imageSmoothingEnabled() {
        return this._context.imageSmoothingEnabled;
    }

    set imageSmoothingEnabled(val: boolean) {
        this._context.imageSmoothingEnabled = val;
    }

    // imageSmoothingQuality: ImageSmoothingQuality;
    get imageSmoothingQuality() {
        return this._context.imageSmoothingQuality;
    }

    set imageSmoothingQuality(val: ImageSmoothingQuality) {
        this._context.imageSmoothingQuality = val;
    }

    // lineCap: CanvasLineCap;
    get lineCap() {
        return this._context.lineCap;
    }

    set lineCap(val: CanvasLineCap) {
        this._context.lineCap = val;
    }

    // lineDashOffset: number;
    get lineDashOffset() {
        return this._context.lineDashOffset;
    }

    set lineDashOffset(val: number) {
        this._context.lineDashOffset = val;
    }

    // lineJoin: CanvasLineJoin;
    get lineJoin() {
        return this._context.lineJoin;
    }

    set lineJoin(val: CanvasLineJoin) {
        this._context.lineJoin = val;
    }

    // lineWidth: number;
    get lineWidth() {
        return this._context.lineWidth;
    }

    set lineWidth(val: number) {
        this._context.lineWidth = val;
    }

    setLineWidthByPrecision(val: number) {
        const { scaleX, scaleY } = this._getScale();

        this._context.lineWidth = val / Math.max(scaleX, scaleY);
    }

    // miterLimit: number;
    get miterLimit() {
        return this._context.miterLimit;
    }

    set miterLimit(val: number) {
        this._context.miterLimit = val;
    }

    // shadowBlur: number;
    get shadowBlur() {
        return this._context.shadowBlur;
    }

    set shadowBlur(val: number) {
        this._context.shadowBlur = val;
    }

    // shadowColor: string;
    get shadowColor() {
        return this._context.shadowColor;
    }

    set shadowColor(val: string) {
        this._context.shadowColor = val;
    }

    // shadowOffsetX: number;
    get shadowOffsetX() {
        return this._context.shadowOffsetX;
    }

    set shadowOffsetX(val: number) {
        this._context.shadowOffsetX = val;
    }

    // shadowOffsetY: number;
    get shadowOffsetY() {
        return this._context.shadowOffsetY;
    }

    set shadowOffsetY(val: number) {
        this._context.shadowOffsetY = val;
    }

    // direction: CanvasDirection;
    get direction() {
        return this._context.direction;
    }

    set direction(val: CanvasDirection) {
        this._context.direction = val;
    }

    get font() {
        if (this._normalizedCachedFont) {
            return this._normalizedCachedFont;
        }
        const fontStr = this._context.font;
        this._normalizedCachedFont = fontStr;
        return fontStr;
    }

    _normalizedCachedFont: string;
    set font(val: string) {
        this._context.font = val;
        // set font called too many times, even get font from context is time consuming.
        // this.fontStyleStr = this._context.font;
        // DO NOT use val to cachedStyleStr,  Actual font string may change after set to context.
        this._normalizedCachedFont = '';
    }

    // fontKerning: CanvasFontKerning;
    get fontKerning() {
        return this._context.fontKerning;
    }

    set fontKerning(val: CanvasFontKerning) {
        this._context.fontKerning = val;
    }

    // fontStretch: CanvasFontStretch;
    get fontStretch() {
        // @ts-ignore
        return this._context.fontStretch;
    }

    set fontStretch(val: CanvasFontStretch) {
        // @ts-ignore
        this._context.fontStretch = val;
    }

    // fontVariantCaps: CanvasFontVariantCaps;
    get fontVariantCaps() {
        // @ts-ignore
        return this._context.fontVariantCaps;
    }

    set fontVariantCaps(val: CanvasFontVariantCaps) {
        // @ts-ignore
        this._context.fontVariantCaps = val;
    }

    // letterSpacing: string;
    get letterSpacing() {
        // @ts-ignore
        return this._context.letterSpacing;
    }

    set letterSpacing(val: string) {
        // @ts-ignore
        this._context.letterSpacing = val;
    }

    // textRendering: CanvasTextRendering;
    get textRendering() {
        // @ts-ignore
        return this._context.textRendering;
    }

    set textRendering(val: CanvasTextRendering) {
        // @ts-ignore
        this._context.textRendering = val;
    }

    // wordSpacing: string;
    get wordSpacing() {
        // @ts-ignore
        return this._context.wordSpacing;
    }

    set wordSpacing(val: string) {
        // @ts-ignore
        this._context.wordSpacing = val;
    }

    // textAlign: CanvasTextAlign;
    get textAlign() {
        return this._context.textAlign;
    }

    set textAlign(val: CanvasTextAlign) {
        this._context.textAlign = val;
    }

    // textBaseline: CanvasTextBaseline;
    get textBaseline() {
        return this._context.textBaseline;
    }

    set textBaseline(val: CanvasTextBaseline) {
        this._context.textBaseline = val;
    }

    /**
     * Get scale from ctx.
     * DOMMatrix.a DOMMatrix.d would affect by ctx.rotate()
     */
    protected _getScale() {
        const transform = this.getTransform();
        const { a, b, c, d } = transform;

        const scaleX = Math.sqrt(a * a + b * b);
        const scaleY = Math.sqrt(c * c + d * d);
        // const angle = Math.atan2(b, a);

        return {
            scaleX,
            scaleY,
        };
    }

    getScale() {
        return this._getScale();
    }

    getContextAttributes(): CanvasRenderingContext2DSettings {
        return this._context.getContextAttributes();
    }

    isPointInStroke(x: number, y: number): boolean;

    isPointInStroke(path: Path2D, x: number, y: number): boolean;

    isPointInStroke(...args: [any, any]) {
        return this._context.isPointInStroke(...args);
    }

    createConicGradient(startAngle: number, x: number, y: number): CanvasGradient {
        return this._context.createConicGradient(startAngle, x, y);
    }

    roundRect(
        x: number,
        y: number,
        w: number,
        h: number,
        radii?: number | DOMPointInit | Array<number | DOMPointInit>
    ): void {
        this._context.roundRect(x, y, w, h, radii);
    }

    roundRectByPrecision(
        x: number,
        y: number,
        w: number,
        h: number,
        radii?: number | DOMPointInit | Array<number | DOMPointInit>
    ): void {
        const { scaleX, scaleY } = this._getScale();
        x = fixLineWidthByScale(x, scaleX);
        y = fixLineWidthByScale(y, scaleY);
        w = fixLineWidthByScale(w, scaleX);
        h = fixLineWidthByScale(h, scaleY);

        this.roundRect(x, y, w, h, radii);
    }

    getTransform() {
        const m = this._transformCache || this._context.getTransform();
        return m;
    }

    resetTransform() {
        this._transformCache = null;
        this._context.resetTransform();
    }

    drawFocusIfNeeded(element: Element): void;
    drawFocusIfNeeded(path: Path2D, element: Element): void;
    drawFocusIfNeeded(...args: [any]) {
        return this._context.drawFocusIfNeeded(...args);
    }

    /**
     * reset canvas context transform
     * @method
     */
    reset() {
        this._transformCache = null;
        this._context.reset();
    }

    /**
     * arc function.
     * @method
     */
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterClockwise?: boolean) {
        this._context.arc(x, y, Math.max(0, radius), startAngle, endAngle, counterClockwise);
    }

    /**
     * arc function.
     * @method
     */
    arcByPrecision(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterClockwise?: boolean) {
        const { scaleX, scaleY } = this._getScale();
        x = fixLineWidthByScale(x, scaleX);
        y = fixLineWidthByScale(y, scaleY);

        this.arc(x, y, radius, startAngle, endAngle, counterClockwise);
    }

    /**
     * arcTo function.
     * @method
     *
     */
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
        this._context.arcTo(x1, y1, x2, y2, radius);
    }

    /**
     * arcTo function.
     * @method
     *
     */
    arcToByPrecision(x1: number, y1: number, x2: number, y2: number, radius: number) {
        const { scaleX, scaleY } = this._getScale();
        x1 = fixLineWidthByScale(x1, scaleX);
        y1 = fixLineWidthByScale(y1, scaleY);
        x2 = fixLineWidthByScale(x2, scaleX);
        y2 = fixLineWidthByScale(y2, scaleY);

        this.arcTo(x1, y1, x2, y2, radius);
    }

    /**
     * beginPath function.
     * @method
     */
    beginPath() {
        this._context.beginPath();
    }

    /**
     * bezierCurveTo function.
     * @method
     */
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {
        this._context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    }

    /**
     * bezierCurveTo function precision.
     * @method
     */
    bezierCurveToByPrecision(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {
        const { scaleX, scaleY } = this._getScale();
        x = fixLineWidthByScale(x, scaleX);
        y = fixLineWidthByScale(y, scaleY);
        cp1x = fixLineWidthByScale(cp1x, scaleX);
        cp1y = fixLineWidthByScale(cp1y, scaleY);
        cp2x = fixLineWidthByScale(cp2x, scaleX);
        cp2y = fixLineWidthByScale(cp2y, scaleY);

        this.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    }

    /**
     * clearRect function.
     * @method
     */
    clearRect(x: number, y: number, width: number, height: number) {
        this._context.clearRect(x, y, width, height);
    }

    /**
     * clearRect function.
     * @method
     */
    clearRectByPrecision(x: number, y: number, width: number, height: number) {
        const { scaleX, scaleY } = this._getScale();
        x = fixLineWidthByScale(x, scaleX);
        y = fixLineWidthByScale(y, scaleY);
        width = fixLineWidthByScale(width, scaleX);
        height = fixLineWidthByScale(height, scaleY);

        this.clearRect(x, y, width, height);
    }

    /**
     * clip function.
     * @method
     */
    clip(): void;

    clip(path: Path2D): void;

    clip(fillRule?: CanvasFillRule): void;

    clip(path: Path2D, fillRule?: CanvasFillRule): void;

    clip(...args: any[]) {
        this._context.clip(...args);
    }

    /**
     * closePath function.
     * @method
     */
    closePath() {
        this._context.closePath();
    }

    getSystemType() {
        if (!this._systemType) {
            this._systemType = Tools.getSystemType();
        }
        return this._systemType;
    }

    getBrowserType() {
        if (!this._browserType) {
            this._browserType = Tools.getBrowserType();
        }
        return this._browserType;
    }

    /**
     * Chrome hardware acceleration causes canvas stroke to fail to draw lines on Mac.
     */
    closePathByEnv() {
        const system = this.getSystemType();
        const isMac = system === 'Mac';
        const browser = this.getBrowserType();
        const isChrome = browser === 'Chrome';

        if (isMac && isChrome) {
            return;
        }

        this._context.closePath();
    }

    /**
     * createImageData function.
     * @method
     */
    createImageData(width: number, height: number, settings?: ImageDataSettings): ImageData;

    createImageData(imagedata: ImageData): ImageData;

    createImageData(...args: any[]) {
        if (args.length === 0) {
            throw new Error('arguments is zero');
        }
        if (args.length === 1) {
            return this._context.createImageData(args[0]);
        }
        if (args.length === 2) {
            return this._context.createImageData(args[0], args[1]);
        }
        return this._context.createImageData(args[0], args[1], args[1]);
    }

    /**
     * createLinearGradient function.
     * @method
     */
    createLinearGradient(x0: number, y0: number, x1: number, y1: number) {
        return this._context.createLinearGradient(x0, y0, x1, y1);
    }

    /**
     * createPattern function.
     * @method
     */
    createPattern(image: CanvasImageSource, repetition: string | null) {
        return this._context.createPattern(image, repetition);
    }

    /**
     * createRadialGradient function.
     * @method
     */
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) {
        return this._context.createRadialGradient(x0, y0, r0, x1, y1, r1);
    }

    /**
     * drawImage function.
     * @method
     */
    drawImage(
        image: CanvasImageSource,

        sx: number,

        sy: number,

        sWidth?: number,

        sHeight?: number,

        dx?: number,

        dy?: number,

        dWidth?: number,

        dHeight?: number
    ): void;

    drawImage(...args: any[]) {
        // this._context.drawImage(...arguments);

        const a = args;

        const _context = this._context;

        if (a.length === 3) {
            _context.drawImage(args[0], args[1], args[2]);
        } else if (a.length === 5) {
            _context.drawImage(args[0], args[1], args[2], args[3], args[4]);
        } else if (a.length === 9) {
            _context.drawImage(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
        }
    }

    /**
     * ellipse function.
     * @method
     */
    ellipse(
        x: number,

        y: number,

        radiusX: number,

        radiusY: number,

        rotation: number,

        startAngle: number,

        endAngle: number,

        counterclockwise?: boolean
    ) {
        this._context.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise);
    }

    /**
     * isPointInPath function.
     * @method
     */
    isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean;

    isPointInPath(path: Path2D, x: number, y: number, fillRule?: CanvasFillRule): boolean;

    isPointInPath(...args: [any, any, any]) {
        return this._context.isPointInPath(...args);
    }

    /**
     * fill function.
     * @method
     */
    fill(fillRule?: CanvasFillRule): void;

    fill(path: Path2D, fillRule?: CanvasFillRule): void;

    fill(...args: [any]) {
        // this._context.fill();

        this._context.fill(...args);
    }

    /**
     * fillRect function.
     * @method
     */
    fillRect(x: number, y: number, width: number, height: number) {
        this._context.fillRect(x, y, width, height);
    }

    /**
     * fillRect function precision.
     * @method
     */
    fillRectByPrecision(x: number, y: number, width: number, height: number) {
        const { scaleX, scaleY } = this._getScale();
        x = fixLineWidthByScale(x, scaleX);
        y = fixLineWidthByScale(y, scaleY);
        width = fixLineWidthByScale(width, scaleX);
        height = fixLineWidthByScale(height, scaleY);

        this.fillRect(x, y, width, height);
    }

    /**
     * strokeRect function.
     * @method
     */
    strokeRect(x: number, y: number, width: number, height: number) {
        this._context.strokeRect(x, y, width, height);
    }

    /**
     * strokeRect function precision.
     * @method
     */
    strokeRectPrecision(x: number, y: number, width: number, height: number) {
        const { scaleX, scaleY } = this._getScale();
        x = fixLineWidthByScale(x, scaleX);
        y = fixLineWidthByScale(y, scaleY);
        width = fixLineWidthByScale(width, scaleX);
        height = fixLineWidthByScale(height, scaleY);

        this.strokeRect(x, y, width, height);
    }

    /**
     * fillText function.
     * @method
     */
    fillText(text: string, x: number, y: number, maxWidth?: number) {
        // const { scaleX, scaleY } = this._getScale();
        // x = fixLineWidthByScale(x, scaleX);
        // y = fixLineWidthByScale(y, scaleY);

        if (maxWidth) {
            // maxWidth = fixLineWidthByScale(maxWidth, scaleX);

            this._context.fillText(text, x, y, maxWidth);
        } else {
            this._context.fillText(text, x, y);
        }
    }

    /**
     * fillText function.
     * @method
     */
    fillTextPrecision(text: string, x: number, y: number, maxWidth?: number) {
        const { scaleX, scaleY } = this._getScale();
        x = fixLineWidthByScale(x, scaleX);
        y = fixLineWidthByScale(y, scaleY);

        if (maxWidth) {
            maxWidth = fixLineWidthByScale(maxWidth, scaleX);

            this._context.fillText(text, x, y, maxWidth);
        } else {
            this._context.fillText(text, x, y);
        }
    }

    /**
     * measureText function.
     * @method
     */
    measureText(text: string) {
        return this._context.measureText(text);
    }

    /**
     * getImageData function.
     * @method
     */
    getImageData(sx: number, sy: number, sw: number, sh: number) {
        return this._context.getImageData(sx, sy, sw, sh);
    }

    /**
     * lineTo function.
     * @method
     */
    lineTo(x: number, y: number) {
        this._context.lineTo(x, y);
    }

    /**
     * lineTo function precision.
     * @method
     */
    lineToByPrecision(x: number, y: number) {
        const { scaleX, scaleY } = this._getScale();
        x = fixLineWidthByScale(x, scaleX);
        y = fixLineWidthByScale(y, scaleY);

        this.lineTo(x, y);
    }

    /**
     * moveTo function.
     * @method
     */
    moveTo(x: number, y: number) {
        this._context.moveTo(x, y);
    }

    /**
     * moveTo function precision.
     * @method
     */
    moveToByPrecision(x: number, y: number) {
        const { scaleX, scaleY } = this._getScale();
        x = fixLineWidthByScale(x, scaleX);
        y = fixLineWidthByScale(y, scaleY);
        this.moveTo(x, y);
    }

    moveToByPrecisionLog(x: number, y: number) {
        const { scaleX, scaleY } = this._getScale();
        const afterX = fixLineWidthByScale(x, scaleX);
        const afterY = fixLineWidthByScale(y, scaleY);
        this.moveTo(afterX, afterY);
    }

    /**
     * rect function.
     * @method
     */
    rect(x: number, y: number, width: number, height: number) {
        this._context.rect(x, y, width, height);
    }

    /**
     * rect function.
     * @method
     */
    rectByPrecision(x: number, y: number, width: number, height: number) {
        const { scaleX, scaleY } = this._getScale();
        x = fixLineWidthByScale(x, scaleX);
        y = fixLineWidthByScale(y, scaleY);
        width = fixLineWidthByScale(width, scaleX);
        height = fixLineWidthByScale(height, scaleY);

        this.rect(x, y, width, height);
    }

    /**
     * putImageData function.
     * @method
     */
    putImageData(imageData: ImageData, dx: number, dy: number) {
        this._context.putImageData(imageData, dx, dy);
    }

    /**
     * quadraticCurveTo function.
     * @method
     */
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
        this._context.quadraticCurveTo(cpx, cpy, x, y);
    }

    /**
     * restore function.
     * @method
     */
    restore() {
        this._transformCache = null;
        this._normalizedCachedFont = '';
        this._context.restore();
    }

    /**
     * rotate function.
     * @method
     */
    rotate(angle: number) {
        this._transformCache = null;
        this._context.rotate(angle);
    }

    /**
     * save function.
     * @method
     */
    save() {
        this._context.save();
    }

    /**
     * scale function.
     * @method
     */
    scale(x: number, y: number) {
        this._transformCache = null;
        this._context.scale(x, y);
    }

    /**
     * setLineDash function.
     * @method
     */
    setLineDash(segments: number[]) {
        // works for Chrome and IE11

        if (this._context.setLineDash) {
            this._context.setLineDash(segments);
        } else if ('mozDash' in this._context) {
            // verified that this works in firefox
            (<any> this._context.mozDash) = segments;
        } else if ('webkitLineDash' in this._context) {
            // does not currently work for Safari

            (<any> this._context.webkitLineDash) = segments;
        }

        // no support for IE9 and IE10
    }

    /**
     * getLineDash function.
     * @method
     */
    getLineDash() {
        return this._context.getLineDash();
    }

    /**
     * setTransform function.
     * @method
     */
    setTransform(transform?: DOMMatrix2DInit): void;

    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;

    setTransform(...args: [any]) {
        this._transformCache = null;
        this._normalizedCachedFont = '';
        this._context.setTransform(...args);
    }

    /**
     * stroke function.
     * @method
     */
    stroke(path2d?: Path2D) {
        if (path2d) {
            this._context.stroke(path2d);
        } else {
            this._context.stroke();
        }
    }

    /**
     * strokeText function.
     * @method
     */
    strokeText(text: string, x: number, y: number, maxWidth?: number) {
        this._context.strokeText(text, x, y, maxWidth);
    }

    /**
     * strokeText function precision.
     * @method
     */
    strokeTextByPrecision(text: string, x: number, y: number, maxWidth?: number) {
        const { scaleX, scaleY } = this._getScale();
        x = fixLineWidthByScale(x, scaleX);
        y = fixLineWidthByScale(y, scaleY);

        if (maxWidth) {
            maxWidth = fixLineWidthByScale(maxWidth, scaleX);
        }
        this.strokeText(text, x, y, maxWidth);
    }

    /**
     * transform function.
     * @method
     */
    transform(a: number, b: number, c: number, d: number, e: number, f: number) {
        this._transformCache = null;
        this._context.transform(a, b, c, d, e, f);
    }

    /**
     * translate function.
     * @method
     */
    translate(x: number, y: number) {
        this._transformCache = null;
        this._context.translate(x, y);
    }

    translateWithPrecision(x: number, y: number) {
        const { scaleX, scaleY } = this._getScale();
        x = fixLineWidthByScale(x, scaleX);
        y = fixLineWidthByScale(y, scaleY);
        this._transformCache = null;
        this._context.translate(x, y);
    }

    translateWithPrecisionRatio(x: number, y: number) {
        this._transformCache = null;
        const { scaleX, scaleY } = this._getScale();
        this._context.translate(x / scaleX, y / scaleY);
    }

    clearRectForTexture(x: number, y: number, width: number, height: number) {
        this.clearRectByPrecision(x, y, width, height);
    }

    setGlobalCompositeOperation(val: GlobalCompositeOperation) {
        this._context.globalCompositeOperation = val;
    }
}

export class UniverRenderingContext extends UniverRenderingContext2D { }

export class UniverPrintingContext extends UniverRenderingContext2D {
    override __mode = 'printing';

    override clearRect(x: number, y: number, width: number, height: number): void {
        const { scaleX, scaleY } = this._getScale();
        x = fixLineWidthByScale(x, scaleX);
        y = fixLineWidthByScale(y, scaleY);
        width = fixLineWidthByScale(width, scaleX);
        height = fixLineWidthByScale(height, scaleY);

        this._context.save();
        this._context.fillStyle = getColor([255, 255, 255]);
        this._context.fillRect(x, y, width, height);
        this._context.restore();
    }

    override clearRectForTexture(x: number, y: number, width: number, height: number) {
        // empty
    }

    override setGlobalCompositeOperation(val: GlobalCompositeOperation) {
        // empty
    }
}
