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

import { Disposable } from '@univerjs/core';
import type { UniverRenderingContext } from '../../../context';
import { createCanvasElement } from '../../../basics/tools';
import { FontCache } from '../../docs/layout/shaping-engine/font-cache';

const MAX_ENTRIES = 128;
const MAX_PIXELS = 512 * 1024;
const MAX_STROKE_PIXELS = 128 * 1024;

interface IStrokePath {
    points: Array<[number, number]>;
    closed: boolean;
    unsupported: boolean;
}

interface IStrokeBitmap {
    canvas: HTMLCanvasElement;
    pixels: number;
    offsetX?: number;
    offsetY?: number;
}

const TEXT_PROPERTIES = [
    'lang',
    'font',
    'textAlign',
    'textBaseline',
    'direction',
    'fontKerning',
    'fontStretch',
    'fontVariantCaps',
    'letterSpacing',
    'wordSpacing',
    'textRendering',
] as const;

/** Rasterize at a stable local origin, retaining the native physical resolution and antialiasing. */
export class RenderPrimitiveCache extends Disposable {
    private readonly _bitmaps = new Map<string, IStrokeBitmap>();
    private _contexts = new WeakMap<CanvasRenderingContext2D, CanvasRenderingContext2D>();
    private _pixels = 0;
    private _fontRevision = -1;
    private _fonts?: FontFaceSet;

    draw(ctx: UniverRenderingContext, draw: () => void): void {
        const original = ctx._context;
        const colorSpace = original?.getContextAttributes?.()?.colorSpace;
        if (ctx.__mode === 'printing' || !original || typeof document === 'undefined'
            || (colorSpace && colorSpace !== 'srgb')) {
            draw();
            return;
        }
        ctx._context = this._getContext(original);
        try {
            draw();
        } finally {
            ctx._context = original;
        }
    }

    clear(): void {
        for (const bitmap of this._bitmaps.values()) {
            bitmap.canvas.width = 0;
            bitmap.canvas.height = 0;
        }
        this._bitmaps.clear();
        this._contexts = new WeakMap();
        this._pixels = 0;
    }

    override dispose(): void {
        this.clear();
        super.dispose();
    }

    private _getContext(native: CanvasRenderingContext2D): CanvasRenderingContext2D {
        const existing = this._contexts.get(native);
        if (existing) {
            return existing;
        }
        const path: IStrokePath = { points: [], closed: false, unsupported: false };
        const methods = new Map<PropertyKey, (...args: unknown[]) => unknown>();
        const proxy = new Proxy(native, {
            get: (target, key) => {
                const value: unknown = Reflect.get(target, key, target);
                if (typeof value !== 'function') {
                    return value;
                }
                const cached = methods.get(key);
                if (cached) {
                    return cached;
                }
                let method = (...args: unknown[]) => Reflect.apply(value, target, args);
                if (key === 'beginPath') {
                    method = () => {
                        path.points.length = 0;
                        path.closed = false;
                        path.unsupported = false;
                        target.beginPath();
                    };
                } else if (key === 'moveTo' || key === 'lineTo') {
                    method = (...args) => {
                        if (key === 'moveTo' && path.points.length) {
                            path.unsupported = true;
                        }
                        path.points.push([args[0] as number, args[1] as number]);
                        Reflect.apply(value, target, args);
                    };
                } else if (key === 'closePath') {
                    method = () => {
                        if (path.points.length < 2) {
                            path.unsupported = true;
                        }
                        path.closed = true;
                        target.closePath();
                    };
                } else if (key === 'stroke') {
                    method = (...args) => this._stroke(target, path, args);
                } else if (key === 'fillText') {
                    method = (...args) => this._fillText(target, args);
                } else if (['translate', 'scale', 'rotate', 'transform', 'setTransform', 'resetTransform', 'restore'].includes(String(key))) {
                    method = (...args) => {
                        if (path.points.length) {
                            path.unsupported = true;
                        }
                        Reflect.apply(value, target, args);
                    };
                } else if (['arc', 'arcTo', 'ellipse', 'rect', 'roundRect', 'bezierCurveTo', 'quadraticCurveTo'].includes(String(key))) {
                    method = (...args) => {
                        path.unsupported = true;
                        Reflect.apply(value, target, args);
                    };
                }
                methods.set(key, method);
                return method;
            },
            set: (target, key, value) => Reflect.set(target, key, value, target),
        });
        this._contexts.set(native, proxy);
        return proxy;
    }

    private _stroke(native: CanvasRenderingContext2D, path: IStrokePath, args: unknown[]): void {
        const m = native.getTransform();
        if (args.length || path.unsupported || path.points.length !== 2 || m.a !== m.d || m.a <= 0 || m.b || m.c
            || native.shadowBlur || native.shadowOffsetX || native.shadowOffsetY
            || !['rgba(0, 0, 0, 0)', 'transparent', '#00000000'].includes(native.shadowColor)
            || (native.filter && native.filter !== 'none') || typeof native.strokeStyle !== 'string'
            || !['source-over', 'destination-out'].includes(native.globalCompositeOperation)) {
            Reflect.apply(native.stroke, native, args);
            return;
        }
        const x0 = path.points[0][0] * m.a + m.e;
        const y0 = path.points[0][1] * m.d + m.f;
        const x1 = path.points[1][0] * m.a + m.e;
        const y1 = path.points[1][1] * m.d + m.f;
        const padding = Math.ceil(native.lineWidth * m.a / 2) + 2;
        const left = Math.floor(Math.min(x0, x1)) - padding;
        const top = Math.floor(Math.min(y0, y1)) - padding;
        const width = Math.ceil(Math.max(x0, x1)) - left + padding;
        const height = Math.ceil(Math.max(y0, y1)) - top + padding;
        if (!Number.isFinite(width * height) || width * height > MAX_STROKE_PIXELS) {
            native.stroke();
            return;
        }
        const localX0 = x0 - left;
        const localY0 = y0 - top;
        const localX1 = x1 - left;
        const localY1 = y1 - top;
        const dash = native.getLineDash();
        const key = JSON.stringify([
            Math.round(localX0 * 1e6) / 1e6,
            Math.round(localY0 * 1e6) / 1e6,
            Math.round(localX1 * 1e6) / 1e6,
            Math.round(localY1 * 1e6) / 1e6,
            width,
            height,
            native.lineWidth * m.a,
            native.strokeStyle,
            native.lineCap,
            native.lineJoin,
            native.miterLimit,
            dash.map((value) => value * m.a),
            native.lineDashOffset * m.a,
            path.closed,
        ]);
        let bitmap = this._bitmaps.get(key);
        if (!bitmap) {
            const canvas = createCanvasElement();
            canvas.width = width;
            canvas.height = height;
            const paint = canvas.getContext('2d');
            if (!paint) {
                native.stroke();
                return;
            }
            paint.setTransform(m.a, 0, 0, m.d, 0, 0);
            paint.lineWidth = native.lineWidth;
            paint.strokeStyle = native.strokeStyle;
            paint.lineCap = native.lineCap;
            paint.lineJoin = native.lineJoin;
            paint.miterLimit = native.miterLimit;
            paint.setLineDash(dash);
            paint.lineDashOffset = native.lineDashOffset;
            paint.beginPath();
            paint.moveTo(localX0 / m.a, localY0 / m.d);
            paint.lineTo(localX1 / m.a, localY1 / m.d);
            if (path.closed) {
                paint.closePath();
            }
            paint.stroke();
            bitmap = { canvas, pixels: width * height };
            this._trim(bitmap.pixels);
            this._bitmaps.set(key, bitmap);
            this._pixels += bitmap.pixels;
        }
        const smoothing = native.imageSmoothingEnabled;
        native.setTransform(1, 0, 0, 1, 0, 0);
        native.imageSmoothingEnabled = false;
        try {
            native.drawImage(bitmap.canvas, left, top);
        } finally {
            native.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
            native.imageSmoothingEnabled = smoothing;
        }
    }

    private _fillText(native: CanvasRenderingContext2D, args: unknown[]): void {
        const m = native.getTransform();
        const fallback = () => Reflect.apply(native.fillText, native, args);
        if (args.length !== 3 || typeof args[0] !== 'string' || m.a !== m.d || m.a <= 0 || m.b || m.c
            || native.shadowBlur || native.shadowOffsetX || native.shadowOffsetY
            || !['rgba(0, 0, 0, 0)', 'transparent', '#00000000'].includes(native.shadowColor)
            || (native.filter && native.filter !== 'none') || typeof native.fillStyle !== 'string'
            || native.globalCompositeOperation !== 'source-over' || !document.fonts
            || native.canvas.ownerDocument !== document
            || !['ltr', 'rtl', 'inherit'].includes(native.direction)
            || document.fonts.status === 'loading') {
            fallback();
            return;
        }
        if (!this._fonts) {
            const fonts = document.fonts;
            this._fonts = fonts;
            const clear = () => this.clear();
            fonts.addEventListener('loadingdone', clear);
            fonts.addEventListener('loadingerror', clear);
            this.disposeWithMe({ dispose: () => {
                fonts.removeEventListener('loadingdone', clear);
                fonts.removeEventListener('loadingerror', clear);
            } });
        }
        if (this._fontRevision !== FontCache.metricsRevision) {
            this.clear();
            this._fontRevision = FontCache.metricsRevision;
        }
        const text = args[0];
        const px = (args[1] as number) * m.a + m.e;
        const py = (args[2] as number) * m.d + m.f;
        const ix = Math.floor(px);
        const iy = Math.floor(py);
        const values = TEXT_PROPERTIES.map((property) => Reflect.get(native, property));
        const language = native.canvas.closest('[lang]')?.getAttribute('lang') ?? document.documentElement.lang;
        if (native.direction === 'inherit' && !['ltr', 'rtl'].includes(native.canvas.dir)) {
            fallback();
            return;
        }
        const direction = native.direction === 'inherit' ? (native.canvas.dir as 'ltr' | 'rtl') : native.direction;
        const key = JSON.stringify([
            'text',
            text,
            native.fillStyle,
            m.a,
            values,
            direction,
            language,
            Math.round((px - ix) * 1e6) / 1e6,
            Math.round((py - iy) * 1e6) / 1e6,
        ]);
        let bitmap = this._bitmaps.get(key);
        if (!bitmap) {
            const metrics = native.measureText(text);
            const left = Math.floor(px - metrics.actualBoundingBoxLeft * m.a) - 2;
            const top = Math.floor(py - metrics.actualBoundingBoxAscent * m.d) - 2;
            const width = Math.ceil(px + metrics.actualBoundingBoxRight * m.a) - left + 2;
            const height = Math.ceil(py + metrics.actualBoundingBoxDescent * m.d) - top + 2;
            if (!Number.isFinite(width * height) || width <= 0 || height <= 0 || width * height > MAX_STROKE_PIXELS) {
                fallback();
                return;
            }
            const canvas = createCanvasElement();
            canvas.width = width;
            canvas.height = height;
            canvas.dir = direction;
            canvas.lang = language;
            const paint = canvas.getContext('2d');
            if (!paint) {
                fallback();
                return;
            }
            TEXT_PROPERTIES.forEach((property, index) => {
                if (values[index] !== undefined) {
                    Reflect.set(paint, property, values[index]);
                }
            });
            paint.direction = direction;
            paint.fillStyle = native.fillStyle;
            paint.setTransform(m.a, 0, 0, m.d, px - left, py - top);
            paint.fillText(text, 0, 0);
            bitmap = { canvas, pixels: width * height, offsetX: left - ix, offsetY: top - iy };
            this._trim(bitmap.pixels);
            this._bitmaps.set(key, bitmap);
            this._pixels += bitmap.pixels;
        }
        native.save();
        try {
            native.setTransform(1, 0, 0, 1, 0, 0);
            native.imageSmoothingEnabled = false;
            native.drawImage(bitmap.canvas, ix + bitmap.offsetX!, iy + bitmap.offsetY!);
        } finally {
            native.restore();
        }
    }

    private _trim(incoming: number): void {
        while (this._bitmaps.size >= MAX_ENTRIES || this._pixels + incoming > MAX_PIXELS) {
            const key = this._bitmaps.keys().next().value;
            if (key === undefined) {
                break;
            }
            const bitmap = this._bitmaps.get(key)!;
            this._pixels -= bitmap.pixels;
            bitmap.canvas.width = 0;
            bitmap.canvas.height = 0;
            this._bitmaps.delete(key);
        }
    }
}
