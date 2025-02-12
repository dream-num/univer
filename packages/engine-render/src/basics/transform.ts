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

import type { ITransformState } from '@univerjs/core';

import { degToRad, precisionTo, radToDeg } from './tools';
import { Vector2 } from './vector2';
import type { IRect } from './interfaces';

export const INITIAL_MATRIX: number[] = [1, 0, 0, 1, 0, 0];

export class Transform {
    dirty = false;

    private _m: number[];

    constructor(m = INITIAL_MATRIX) {
        this._m = (m && m.slice()) || INITIAL_MATRIX;
    }

    static create(m = INITIAL_MATRIX) {
        return new this(m);
    }

    reset() {
        this._m[0] = 1;
        this._m[1] = 0;
        this._m[2] = 0;
        this._m[3] = 1;
        this._m[4] = 0;
        this._m[5] = 0;
    }

    /**
     * Copy universheet.Transform object
     * @method
     * @name universheet.Transform#copy
     * @returns {universheet.Transform}
     * @example
     * const tr = shape.getTransform().copy()
     */
    copy() {
        return new Transform(this._m);
    }

    copyInto(tr: Transform) {
        tr._m[0] = this._m[0];
        tr._m[1] = this._m[1];
        tr._m[2] = this._m[2];
        tr._m[3] = this._m[3];
        tr._m[4] = this._m[4];
        tr._m[5] = this._m[5];
    }

    /**
     * Transform point
     * @method
     * @name universheet.Transform#point
     * @param {object} point 2D point(x, y)
     * @returns {object} 2D point(x, y)
     */
    applyPoint(point: Vector2, ignoreOffset: boolean = false): Vector2 {
        const m = this._m;
        const xNew = m[0] * point.x + m[2] * point.y;
        const yNew = m[1] * point.x + m[3] * point.y;

        if (ignoreOffset) {
            return new Vector2(xNew, yNew);
        }

        return new Vector2(xNew + m[4], yNew + m[5]);
    }

    /**
     * Apply translation
     * @method
     * @name universheet.Transform#translate
     * @param {number} x
     * @param {number} y
     * @returns {universheet.Transform}
     */
    translate(x: number, y: number) {
        this._m[4] += this._m[0] * x + this._m[2] * y;
        this._m[5] += this._m[1] * x + this._m[3] * y;
        return this;
    }

    /**
     * Apply scale
     * @method
     * @name universheet.Transform#scale
     * @param {number} sx
     * @param {number} sy
     * @returns {universheet.Transform}
     */
    scale(sx: number, sy: number) {
        this._m[0] *= sx;
        this._m[1] *= sx;
        this._m[2] *= sy;
        this._m[3] *= sy;
        // this._m[4] *= sx;
        // this._m[5] *= sy;
        return this;
    }

    /**
     * Apply rotation
     * @method
     * @name universheet.Transform#rotate
     * @param {number} Degree  Angle in Degree
     * @returns {universheet.Transform}
     */
    rotate(deg: number) {
        const rad = degToRad(deg);
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const m11 = this._m[0] * c + this._m[2] * s;
        const m12 = this._m[1] * c + this._m[3] * s;
        const m21 = this._m[0] * -s + this._m[2] * c;
        const m22 = this._m[1] * -s + this._m[3] * c;
        this._m[0] = m11;
        this._m[1] = m12;
        this._m[2] = m21;
        this._m[3] = m22;
        return this;
    }

    /**
     * Returns the translation
     * @method
     * @name universheet.Transform#getTranslation
     * @returns {object} 2D point(x, y)
     */
    getTranslation() {
        return {
            x: this._m[4],
            y: this._m[5],
        };
    }

    /**
     * Apply skew
     * @method
     * @name universheet.Transform#skew
     * @param {number} sx
     * @param {number} sy
     * @returns {universheet.Transform}
     */
    skew(sx: number, sy: number) {
        const m11 = this._m[0] + this._m[2] * sy;
        const m12 = this._m[1] + this._m[3] * sy;
        const m21 = this._m[2] + this._m[0] * sx;
        const m22 = this._m[3] + this._m[1] * sx;
        this._m[0] = m11;
        this._m[1] = m12;
        this._m[2] = m21;
        this._m[3] = m22;
        return this;
    }

    /**
     * Transform multiplication
     * @method
     * @name universheet.Transform#multiply
     * @param {universheet.Transform} matrix
     * @returns {universheet.Transform}
     */
    multiply(matrix: Transform) {
        const m11 = this._m[0] * matrix._m[0] + this._m[2] * matrix._m[1];
        const m12 = this._m[1] * matrix._m[0] + this._m[3] * matrix._m[1];

        const m21 = this._m[0] * matrix._m[2] + this._m[2] * matrix._m[3];
        const m22 = this._m[1] * matrix._m[2] + this._m[3] * matrix._m[3];

        const dx = this._m[0] * matrix._m[4] + this._m[2] * matrix._m[5] + this._m[4];
        const dy = this._m[1] * matrix._m[4] + this._m[3] * matrix._m[5] + this._m[5];

        this._m[0] = m11;
        this._m[1] = m12;
        this._m[2] = m21;
        this._m[3] = m22;
        this._m[4] = dx;
        this._m[5] = dy;
        return this;
    }

    /**
     * Invert the matrix
     * @method
     * @name universheet.Transform#invert
     * @returns {universheet.Transform}
     */
    invert() {
        const d = 1 / (this._m[0] * this._m[3] - this._m[1] * this._m[2]);
        const m0 = this._m[3] * d;
        const m1 = -this._m[1] * d;
        const m2 = -this._m[2] * d;
        const m3 = this._m[0] * d;
        const m4 = d * (this._m[2] * this._m[5] - this._m[3] * this._m[4]);
        const m5 = d * (this._m[1] * this._m[4] - this._m[0] * this._m[5]);
        this._m[0] = m0;
        this._m[1] = m1;
        this._m[2] = m2;
        this._m[3] = m3;
        this._m[4] = m4;
        this._m[5] = m5;
        return this;
    }

    /**
     * return matrix
     * @method
     * @name universheet.Transform#getMatrix
     */
    getMatrix() {
        return this._m;
    }

    /**
     * return matrix
     * @method
     * @name universheet.Transform#getMatrix
     */
    getMatrixByAccurate(accurate = 3) {
        return this._m.map((value) => precisionTo(value, accurate));
    }

    /**
     * set to absolute position via translation
     * @method
     * @name universheet.Transform#setAbsolutePosition
     * @returns {universheet.Transform}
     */
    setAbsolutePosition(coord: Vector2) {
        const m0 = this._m[0];
        const m1 = this._m[1];
        const m2 = this._m[2];
        const m3 = this._m[3];
        const m4 = this._m[4];
        const m5 = this._m[5];
        const yt = (m0 * (coord.y - m5) - m1 * (coord.x - m4)) / (m0 * m3 - m1 * m2);
        const xt = (coord.x - m4 - m2 * yt) / m0;

        return this.translate(xt, yt);
    }

    /**
     * convert transformation matrix back into node's attributes
     * @method
     * @name universheet.Transform#decompose
     * @returns {universheet.Transform}
     */
    decompose() {
        const a = this._m[0];
        const b = this._m[1];
        const c = this._m[2];
        const d = this._m[3];
        const e = this._m[4];
        const f = this._m[5];

        const delta = a * d - b * c;

        const result = {
            x: e,
            y: f,
            angle: 0,
            scaleX: 0,
            scaleY: 0,
            skewX: 0,
            skewY: 0,
        };

        // Apply the QR-like decomposition.
        if (a !== 0 || b !== 0) {
            const r = Math.sqrt(a * a + b * b);
            result.angle = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
            result.scaleX = r;
            result.scaleY = delta / r;
            result.skewX = (a * c + b * d) / delta;
            result.skewY = 0;
        } else if (c !== 0 || d !== 0) {
            const s = Math.sqrt(c * c + d * d);
            result.angle = Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
            result.scaleX = delta / s;
            result.scaleY = s;
            result.skewX = 0;
            result.skewY = (a * c + b * d) / delta;
        } else {
            // a = b = c = d = 0
        }

        result.angle = radToDeg(result.angle);

        return result;
    }

    makeBoundingBoxFromPoints(points: Vector2[]): IRect {
        if (this) {
            for (let i = 0; i < points.length; i++) {
                points[i] = this.applyPoint(points[i]);
            }
        }

        const xPoints = [points[0].x, points[1].x, points[2].x, points[3].x];
        const minX = Math.min(...xPoints);
        const maxX = Math.max(...xPoints);
        const width = maxX - minX;
        const yPoints = [points[0].y, points[1].y, points[2].y, points[3].y];
        const minY = Math.min(...yPoints);
        const maxY = Math.max(...yPoints);
        const height = maxY - minY;

        return {
            left: minX,
            top: minY,
            width,
            height,
            points,
        };
    }

    composeMatrix(options: ITransformState) {
        const matrix = new Transform([1, 0, 0, 1, options.left || 0, options.top || 0]);
        if (options.angle) {
            matrix.rotate(options.angle);
        }
        if (
            options.scaleX !== 1 ||
            options.scaleY !== 1 ||
            options.skewX ||
            options.skewY ||
            options.flipX ||
            options.flipY
        ) {
            matrix.multiply(this._calcDimensionsMatrix(options));
        }
        this._m = matrix.getMatrix();
        return this;
    }

    clone() {
        return new Transform([...this._m]);
    }

    /**
     * Returns a transform matrix starting from an object of the same kind of
     * the one returned from qrDecompose, useful also if you want to calculate some
     * transformations from an object that is not enLived yet.
     * is called DimensionsTransformMatrix because those properties are the one that influence
     * the size of the resulting box of the object.
     * @param  {object} options
     * @param  {number} [options.scaleX]
     * @param  {number} [options.scaleY]
     * @param  {boolean} [options.flipX]
     * @param  {boolean} [options.flipY]
     * @param  {number} [options.skewX]
     * @param  {number} [options.skewX]
     * @return {number[]} transform matrix
     */
    private _calcDimensionsMatrix(options: ITransformState) {
        const scaleX = options.scaleX ?? 1;
        const scaleY = options.scaleY ?? 1;
        const scaleMatrix = new Transform([
            options.flipX ? -scaleX : scaleX,
            0,
            0,
            options.flipY ? -scaleY : scaleY,
            0,
            0,
        ]);
        if (options.skewX) {
            scaleMatrix.multiply(new Transform([1, 0, Math.tan(degToRad(options.skewX)), 1, 0, 0]));
        }
        if (options.skewY) {
            scaleMatrix.multiply(new Transform([1, Math.tan(degToRad(options.skewY)), 0, 1, 0, 0]));
        }
        return scaleMatrix;
    }

    convert2DOMMatrix2D() {
        const m = this.getMatrix();
        return {
            a: m[0],
            b: m[1],
            c: m[2],
            d: m[3],
            e: m[4],
            f: m[5],
        };
    }

    // static createTransformByState(state: positionState) {
    //     const newTr = new this();
    //     let { x, y, angle, scaleX, scaleY, skewX, skewY, flipX, flipY } = state;
    //     x = x ?? 0;
    //     y = y ?? 0;
    //     newTr.translate(x, y);
    //     if (angle) {
    //         newTr.rotate(angle);
    //     }
    //     scaleX = scaleX ?? 1;
    //     scaleY = scaleY ?? 1;
    //     newTr.scale(scaleX, scaleY);
    //     return newTr;
    // }
}
