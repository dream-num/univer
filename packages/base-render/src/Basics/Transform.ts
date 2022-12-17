import { ITransformState } from '@univer/core';
import { degToRad, precisionTo, radToDeg } from './Tools';
import { IRect } from './Interfaces';
import { Vector2 } from './Vector2';

export const INITIAL_MATRIX: number[] = [1, 0, 0, 1, 0, 0];

export class Transform {
    private _m: number[];

    dirty = false;

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
     * Copy UniverSheet.Transform object
     * @method
     * @name UniverSheet.Transform#copy
     * @returns {UniverSheet.Transform}
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
     * @name UniverSheet.Transform#point
     * @param {Object} point 2D point(x, y)
     * @returns {Object} 2D point(x, y)
     */
    applyPoint(point: Vector2, ignoreOffset: boolean = false): Vector2 {
        const m = this._m;
        let xNew = m[0] * point.x + m[2] * point.y;
        let yNew = m[1] * point.x + m[3] * point.y;
        if (ignoreOffset) {
            return new Vector2(xNew, yNew);
        }
        return new Vector2(xNew + m[4], yNew + m[5]);
    }

    /**
     * Apply translation
     * @method
     * @name universheet.Transform#translate
     * @param {Number} x
     * @param {Number} y
     * @returns {UniverSheet.Transform}
     */
    translate(x: number, y: number) {
        this._m[4] += this._m[0] * x + this._m[2] * y;
        this._m[5] += this._m[1] * x + this._m[3] * y;
        return this;
    }

    /**
     * Apply scale
     * @method
     * @name UniverSheet.Transform#scale
     * @param {Number} sx
     * @param {Number} sy
     * @returns {UniverSheet.Transform}
     */
    scale(sx: number, sy: number) {
        this._m[0] *= sx;
        this._m[1] *= sx;
        this._m[2] *= sy;
        this._m[3] *= sy;
        return this;
    }

    /**
     * Apply rotation
     * @method
     * @name UniverSheet.Transform#rotate
     * @param {Number} Degree  Angle in Degree
     * @returns {UniverSheet.Transform}
     */
    rotate(deg: number) {
        const rad = degToRad(deg);
        let c = Math.cos(rad);
        let s = Math.sin(rad);
        let m11 = this._m[0] * c + this._m[2] * s;
        let m12 = this._m[1] * c + this._m[3] * s;
        let m21 = this._m[0] * -s + this._m[2] * c;
        let m22 = this._m[1] * -s + this._m[3] * c;
        this._m[0] = m11;
        this._m[1] = m12;
        this._m[2] = m21;
        this._m[3] = m22;
        return this;
    }

    /**
     * Returns the translation
     * @method
     * @name UniverSheet.Transform#getTranslation
     * @returns {Object} 2D point(x, y)
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
     * @name UniverSheet.Transform#skew
     * @param {Number} sx
     * @param {Number} sy
     * @returns {UniverSheet.Transform}
     */
    skew(sx: number, sy: number) {
        let m11 = this._m[0] + this._m[2] * sy;
        let m12 = this._m[1] + this._m[3] * sy;
        let m21 = this._m[2] + this._m[0] * sx;
        let m22 = this._m[3] + this._m[1] * sx;
        this._m[0] = m11;
        this._m[1] = m12;
        this._m[2] = m21;
        this._m[3] = m22;
        return this;
    }

    /**
     * Transform multiplication
     * @method
     * @name UniverSheet.Transform#multiply
     * @param {UniverSheet.Transform} matrix
     * @returns {UniverSheet.Transform}
     */
    multiply(matrix: Transform) {
        let m11 = this._m[0] * matrix._m[0] + this._m[2] * matrix._m[1];
        let m12 = this._m[1] * matrix._m[0] + this._m[3] * matrix._m[1];

        let m21 = this._m[0] * matrix._m[2] + this._m[2] * matrix._m[3];
        let m22 = this._m[1] * matrix._m[2] + this._m[3] * matrix._m[3];

        let dx = this._m[0] * matrix._m[4] + this._m[2] * matrix._m[5] + this._m[4];
        let dy = this._m[1] * matrix._m[4] + this._m[3] * matrix._m[5] + this._m[5];

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
     * @name UniverSheet.Transform#invert
     * @returns {UniverSheet.Transform}
     */
    invert() {
        let d = 1 / (this._m[0] * this._m[3] - this._m[1] * this._m[2]);
        let m0 = this._m[3] * d;
        let m1 = -this._m[1] * d;
        let m2 = -this._m[2] * d;
        let m3 = this._m[0] * d;
        let m4 = d * (this._m[2] * this._m[5] - this._m[3] * this._m[4]);
        let m5 = d * (this._m[1] * this._m[4] - this._m[0] * this._m[5]);
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
     * @name UniverSheet.Transform#getMatrix
     */
    getMatrix() {
        return this._m;
    }

    /**
     * return matrix
     * @method
     * @name UniverSheet.Transform#getMatrix
     */
    getMatrixByAccurate(accurate = 3) {
        return this._m.map((value) => precisionTo(value, accurate));
    }

    /**
     * set to absolute position via translation
     * @method
     * @name UniverSheet.Transform#setAbsolutePosition
     * @returns {UniverSheet.Transform}
     */
    setAbsolutePosition(coord: Vector2) {
        let m0 = this._m[0];
        let m1 = this._m[1];
        let m2 = this._m[2];
        let m3 = this._m[3];
        let m4 = this._m[4];
        let m5 = this._m[5];
        let yt = (m0 * (coord.y - m5) - m1 * (coord.x - m4)) / (m0 * m3 - m1 * m2);
        let xt = (coord.x - m4 - m2 * yt) / m0;

        return this.translate(xt, yt);
    }

    /**
     * convert transformation matrix back into node's attributes
     * @method
     * @name UniverSheet.Transform#decompose
     * @returns {UniverSheet.Transform}
     */
    decompose() {
        let a = this._m[0];
        let b = this._m[1];
        let c = this._m[2];
        let d = this._m[3];
        let e = this._m[4];
        let f = this._m[5];

        let delta = a * d - b * c;

        let result = {
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
            let r = Math.sqrt(a * a + b * b);
            result.angle = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
            result.scaleX = r;
            result.scaleY = delta / r;
            result.skewX = (a * c + b * d) / delta;
            result.skewY = 0;
        } else if (c !== 0 || d !== 0) {
            let s = Math.sqrt(c * c + d * d);
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
        if (options.scaleX !== 1 || options.scaleY !== 1 || options.skewX || options.skewY || options.flipX || options.flipY) {
            matrix.multiply(this._calcDimensionsMatrix(options));
        }
        this._m = matrix.getMatrix();
        return this;
    }

    /**
     * Returns a transform matrix starting from an object of the same kind of
     * the one returned from qrDecompose, useful also if you want to calculate some
     * transformations from an object that is not enLived yet.
     * is called DimensionsTransformMatrix because those properties are the one that influence
     * the size of the resulting box of the object.
     * @param  {Object} options
     * @param  {Number} [options.scaleX]
     * @param  {Number} [options.scaleY]
     * @param  {Boolean} [options.flipX]
     * @param  {Boolean} [options.flipY]
     * @param  {Number} [options.skewX]
     * @param  {Number} [options.skewX]
     * @return {Number[]} transform matrix
     */
    private _calcDimensionsMatrix(options: ITransformState) {
        const scaleX = options.scaleX ?? 1;
        const scaleY = options.scaleY ?? 1;
        const scaleMatrix = new Transform([options.flipX ? -scaleX : scaleX, 0, 0, options.flipY ? -scaleY : scaleY, 0, 0]);
        if (options.skewX) {
            scaleMatrix.multiply(new Transform([1, 0, Math.tan(degToRad(options.skewX)), 1, 0, 0]));
        }
        if (options.skewY) {
            scaleMatrix.multiply(new Transform([1, Math.tan(degToRad(options.skewY)), 0, 1, 0, 0]));
        }
        return scaleMatrix;
    }

    clone() {
        return new Transform([...this._m]);
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
