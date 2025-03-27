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

import type { Canvas } from '../canvas';
import type { SHEET_VIEWPORT_KEY } from '../components/sheets/interfaces';
import type { DeepImmutable, FloatArray } from './i-events';
import type { Transform } from './transform';

export interface IPoint {
    x: number;
    y: number;
}

export class Vector2 implements IPoint {
    /**
     * Creates a new Vector2 from the given x and y coordinates
     * @param x defines the first coordinate
     * @param y defines the second coordinate
     */
    constructor(
        /** defines the first coordinate */
        public x: number = 0,
        /** defines the second coordinate */
        public y: number = 0
    ) {
        // empty
    }

    // Statics

    /**
     * Gets a new Vector2(0, 0)
     * @returns a new Vector2
     */
    static Zero(): Vector2 {
        return new Vector2(0, 0);
    }

    /**
     * Gets a new Vector2(1, 1)
     * @returns a new Vector2
     */
    static One(): Vector2 {
        return new Vector2(1, 1);
    }

    /**
     * Gets a new Vector2 set from the given index element of the given array
     * @param array defines the data source
     * @param offset defines the offset in the data source
     * @returns a new Vector2
     */
    static FromArray(array: DeepImmutable<ArrayLike<number>>, offset: number = 0): Vector2 {
        return new Vector2(array[offset], array[offset + 1]);
    }

    /**
     * Sets "result" from the given index element of the given array
     * @param array defines the data source
     * @param offset defines the offset in the data source
     * @param result defines the target vector
     */
    static FromArrayToRef(array: ArrayLike<number>, offset: number, result: Vector2): void {
        result.x = array[offset];
        result.y = array[offset + 1];
    }

    /**
     * Gets a new Vector2 located for "amount" (float) on the CatmullRom spline defined by the given four Vector2
     * @param value1 defines 1st point of control
     * @param value2 defines 2nd point of control
     * @param value3 defines 3rd point of control
     * @param value4 defines 4th point of control
     * @param amount defines the interpolation factor
     * @returns a new Vector2
     */
    static CatmullRom(
        value1: DeepImmutable<Vector2>,
        value2: DeepImmutable<Vector2>,
        value3: DeepImmutable<Vector2>,
        value4: DeepImmutable<Vector2>,
        amount: number
    ): Vector2 {
        const squared = amount * amount;
        const cubed = amount * squared;

        const x =
            0.5 *
            (2.0 * value2.x +
                (-value1.x + value3.x) * amount +
                (2.0 * value1.x - 5.0 * value2.x + 4.0 * value3.x - value4.x) * squared +
                (-value1.x + 3.0 * value2.x - 3.0 * value3.x + value4.x) * cubed);

        const y =
            0.5 *
            (2.0 * value2.y +
                (-value1.y + value3.y) * amount +
                (2.0 * value1.y - 5.0 * value2.y + 4.0 * value3.y - value4.y) * squared +
                (-value1.y + 3.0 * value2.y - 3.0 * value3.y + value4.y) * cubed);

        return new Vector2(x, y);
    }

    /**
     * Returns a new Vector2 set with same the coordinates than "value" ones if the vector "value" is in the square defined by "min" and "max".
     * If a coordinate of "value" is lower than "min" coordinates, the returned Vector2 is given this "min" coordinate.
     * If a coordinate of "value" is greater than "max" coordinates, the returned Vector2 is given this "max" coordinate
     * @param value defines the value to clamp
     * @param min defines the lower limit
     * @param max defines the upper limit
     * @returns a new Vector2
     */
    static Clamp(value: DeepImmutable<Vector2>, min: DeepImmutable<Vector2>, max: DeepImmutable<Vector2>): Vector2 {
        let x = value.x;
        x = x > max.x ? max.x : x;
        x = x < min.x ? min.x : x;

        let y = value.y;
        y = y > max.y ? max.y : y;
        y = y < min.y ? min.y : y;

        return new Vector2(x, y);
    }

    /**
     * Returns a new Vector2 located for "amount" (float) on the Hermite spline defined by the vectors "value1", "value2", "tangent1", "tangent2"
     * @param value1 defines the 1st control point
     * @param tangent1 defines the outgoing tangent
     * @param value2 defines the 2nd control point
     * @param tangent2 defines the incoming tangent
     * @param amount defines the interpolation factor
     * @returns a new Vector2
     */
    static Hermite(
        value1: DeepImmutable<Vector2>,
        tangent1: DeepImmutable<Vector2>,
        value2: DeepImmutable<Vector2>,
        tangent2: DeepImmutable<Vector2>,
        amount: number
    ): Vector2 {
        const squared = amount * amount;
        const cubed = amount * squared;
        const part1 = 2.0 * cubed - 3.0 * squared + 1.0;
        const part2 = -2.0 * cubed + 3.0 * squared;
        const part3 = cubed - 2.0 * squared + amount;
        const part4 = cubed - squared;

        const x = value1.x * part1 + value2.x * part2 + tangent1.x * part3 + tangent2.x * part4;
        const y = value1.y * part1 + value2.y * part2 + tangent1.y * part3 + tangent2.y * part4;

        return new Vector2(x, y);
    }

    /**
     * Returns a new Vector2 which is the 1st derivative of the Hermite spline defined by the vectors "value1", "value2", "tangent1", "tangent2".
     * @param value1 defines the first control point
     * @param tangent1 defines the first tangent
     * @param value2 defines the second control point
     * @param tangent2 defines the second tangent
     * @param time define where the derivative must be done
     * @returns 1st derivative
     */
    static Hermite1stDerivative(
        value1: DeepImmutable<Vector2>,
        tangent1: DeepImmutable<Vector2>,
        value2: DeepImmutable<Vector2>,
        tangent2: DeepImmutable<Vector2>,
        time: number
    ): Vector2 {
        const result = Vector2.Zero();

        this.Hermite1stDerivativeToRef(value1, tangent1, value2, tangent2, time, result);

        return result;
    }

    /**
     * Returns a new Vector2 which is the 1st derivative of the Hermite spline defined by the vectors "value1", "value2", "tangent1", "tangent2".
     * @param value1 defines the first control point
     * @param tangent1 defines the first tangent
     * @param value2 defines the second control point
     * @param tangent2 defines the second tangent
     * @param time define where the derivative must be done
     * @param result define where the derivative will be stored
     */
    static Hermite1stDerivativeToRef(
        value1: DeepImmutable<Vector2>,
        tangent1: DeepImmutable<Vector2>,
        value2: DeepImmutable<Vector2>,
        tangent2: DeepImmutable<Vector2>,
        time: number,
        result: Vector2
    ) {
        const t2 = time * time;

        result.x =
            (t2 - time) * 6 * value1.x +
            (3 * t2 - 4 * time + 1) * tangent1.x +
            (-t2 + time) * 6 * value2.x +
            (3 * t2 - 2 * time) * tangent2.x;
        result.y =
            (t2 - time) * 6 * value1.y +
            (3 * t2 - 4 * time + 1) * tangent1.y +
            (-t2 + time) * 6 * value2.y +
            (3 * t2 - 2 * time) * tangent2.y;
    }

    /**
     * Returns a new Vector2 located for "amount" (float) on the linear interpolation between the vector "start" adn the vector "end".
     * @param start defines the start vector
     * @param end defines the end vector
     * @param amount defines the interpolation factor
     * @returns a new Vector2
     */
    static Lerp(start: DeepImmutable<Vector2>, end: DeepImmutable<Vector2>, amount: number): Vector2 {
        const x = start.x + (end.x - start.x) * amount;
        const y = start.y + (end.y - start.y) * amount;
        return new Vector2(x, y);
    }

    /**
     * Gets the dot product of the vector "left" and the vector "right"
     * @param left defines first vector
     * @param right defines second vector
     * @returns the dot product (float)
     */
    static Dot(left: DeepImmutable<Vector2>, right: DeepImmutable<Vector2>): number {
        return left.x * right.x + left.y * right.y;
    }

    /**
     * Returns a new Vector2 equal to the normalized given vector
     * @param vector defines the vector to normalize
     * @returns a new Vector2
     */
    static Normalize(vector: DeepImmutable<Vector2>): Vector2 {
        const newVector = Vector2.Zero();
        this.NormalizeToRef(vector, newVector);
        return newVector;
    }

    /**
     * Normalize a given vector into a second one
     * @param vector defines the vector to normalize
     * @param result defines the vector where to store the result
     */
    static NormalizeToRef(vector: DeepImmutable<Vector2>, result: Vector2) {
        const len = vector.length();

        if (len === 0) {
            return;
        }

        result.x = vector.x / len;
        result.y = vector.y / len;
    }

    /**
     * Gets a new Vector2 set with the minimal coordinate values from the "left" and "right" vectors
     * @param left defines 1st vector
     * @param right defines 2nd vector
     * @returns a new Vector2
     */
    static Minimize(left: DeepImmutable<Vector2>, right: DeepImmutable<Vector2>): Vector2 {
        const x = left.x < right.x ? left.x : right.x;
        const y = left.y < right.y ? left.y : right.y;
        return new Vector2(x, y);
    }

    /**
     * Gets a new Vector2 set with the maximal coordinate values from the "left" and "right" vectors
     * @param left defines 1st vector
     * @param right defines 2nd vector
     * @returns a new Vector2
     */
    static Maximize(left: DeepImmutable<Vector2>, right: DeepImmutable<Vector2>): Vector2 {
        const x = left.x > right.x ? left.x : right.x;
        const y = left.y > right.y ? left.y : right.y;
        return new Vector2(x, y);
    }

    // /**
    //  * Transforms the given vector coordinates by the given transformation Transform and stores the result in the vector "result" coordinates
    //  * @param vector defines the vector to transform
    //  * @param transformation defines the Transform to apply
    //  * @param result defines the target vector
    //  */
    // static Transform(vector: DeepImmutable<Vector2>, transformation: DeepImmutable<Transform>, ignoreOffset: boolean = false) {
    //     const t = transformation as IKeyValue;
    //     const p = vector;

    //     if (ignoreOffset) {
    //         return new Vector2(t[0] * p.x + t[2] * p.y, t[1] * p.x + t[3] * p.y);
    //     }
    //     return new Vector2(t[0] * p.x + t[2] * p.y + t[4], t[1] * p.x + t[3] * p.y + t[5]);
    // }

    /**
     * Determines if a given vector is included in a triangle
     * @param p defines the vector to test
     * @param p0 defines 1st triangle point
     * @param p1 defines 2nd triangle point
     * @param p2 defines 3rd triangle point
     * @returns true if the point "p" is in the triangle defined by the vectors "p0", "p1", "p2"
     */
    static PointInTriangle(
        p: DeepImmutable<Vector2>,
        p0: DeepImmutable<Vector2>,
        p1: DeepImmutable<Vector2>,
        p2: DeepImmutable<Vector2>
    ) {
        const a = (1 / 2) * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
        const sign = a < 0 ? -1 : 1;
        const s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
        const t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;

        return s > 0 && t > 0 && s + t < 2 * a * sign;
    }

    /**
     * Gets the distance between the vectors "value1" and "value2"
     * @param value1 defines first vector
     * @param value2 defines second vector
     * @returns the distance between vectors
     */
    static Distance(value1: DeepImmutable<Vector2>, value2: DeepImmutable<Vector2>): number {
        return Math.sqrt(Vector2.DistanceSquared(value1, value2));
    }

    /**
     * Returns the squared distance between the vectors "value1" and "value2"
     * @param value1 defines first vector
     * @param value2 defines second vector
     * @returns the squared distance between vectors
     */
    static DistanceSquared(value1: DeepImmutable<Vector2>, value2: DeepImmutable<Vector2>): number {
        const x = value1.x - value2.x;
        const y = value1.y - value2.y;
        return x * x + y * y;
    }

    /**
     * Gets a new Vector2 located at the center of the vectors "value1" and "value2"
     * @param value1 defines first vector
     * @param value2 defines second vector
     * @returns a new Vector2
     */
    static Center(value1: DeepImmutable<Vector2>, value2: DeepImmutable<Vector2>): Vector2 {
        return Vector2.CenterToRef(value1, value2, Vector2.Zero());
    }

    /**
     * Gets the center of the vectors "value1" and "value2" and stores the result in the vector "ref"
     * @param value1 defines first vector
     * @param value2 defines second vector
     * @param ref defines third vector
     * @returns ref
     */
    static CenterToRef(
        value1: DeepImmutable<Vector2>,
        value2: DeepImmutable<Vector2>,
        ref: DeepImmutable<Vector2>
    ): Vector2 {
        return ref.copyFromFloats((value1.x + value2.x) / 2, (value1.y + value2.y) / 2);
    }

    /**
     * Gets the shortest distance (float) between the point "p" and the segment defined by the two points "segA" and "segB".
     * @param p defines the middle point
     * @param segA defines one point of the segment
     * @param segB defines the other point of the segment
     * @returns the shortest distance
     */
    static DistanceOfPointFromSegment(
        p: DeepImmutable<Vector2>,
        segA: DeepImmutable<Vector2>,
        segB: DeepImmutable<Vector2>
    ): number {
        const l2 = Vector2.DistanceSquared(segA, segB);
        if (l2 === 0.0) {
            return Vector2.Distance(p, segA);
        }
        const v = segB.subtract(segA);
        const t = Math.max(0, Math.min(1, Vector2.Dot(p.subtract(segA), v) / l2));
        const proj = segA.add(v.multiplyByFloats(t, t));
        return Vector2.Distance(p, proj);
    }

    static create(x: number, y: number) {
        return new Vector2(x, y);
    }

    /**
     * Gets a string with the Vector2 coordinates
     * @returns a string with the Vector2 coordinates
     */
    toString(): string {
        return `{X: ${this.x} Y: ${this.y}}`;
    }

    /**
     * Gets class name
     * @returns the string "Vector2"
     */
    getClassName(): string {
        return 'Vector2';
    }

    /**
     * Gets current vector hash code
     * @returns the Vector2 hash code as a number
     */
    getHashCode(): number {
        let hash = this.x | 0;
        hash = (hash * 397) ^ (this.y | 0);
        return hash;
    }

    // Operators

    /**
     * Sets the Vector2 coordinates in the given array or Float32Array from the given index.
     * @param array defines the source array
     * @param index defines the offset in source array
     * @returns the current Vector2
     */
    toArray(array: FloatArray, index: number = 0): Vector2 {
        array[index] = this.x;
        array[index + 1] = this.y;
        return this;
    }

    /**
     * Update the current vector from an array
     * @param array defines the destination array
     * @param index defines the offset in the destination array
     * @returns the current Vector3
     */
    fromArray(array: FloatArray, index: number = 0): Vector2 {
        Vector2.FromArrayToRef(array, index, this);
        return this;
    }

    /**
     * Copy the current vector to an array
     * @returns a new array with 2 elements: the Vector2 coordinates.
     */
    asArray(): number[] {
        const result = new Array<number>();
        this.toArray(result, 0);
        return result;
    }

    /**
     * Sets the Vector2 coordinates with the given Vector2 coordinates
     * @param source defines the source Vector2
     * @returns the current updated Vector2
     */
    copyFrom(source: DeepImmutable<Vector2>): Vector2 {
        this.x = source.x;
        this.y = source.y;
        return this;
    }

    /**
     * Sets the Vector2 coordinates with the given floats
     * @param x defines the first coordinate
     * @param y defines the second coordinate
     * @returns the current updated Vector2
     */
    copyFromFloats(x: number, y: number): Vector2 {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Sets the Vector2 coordinates with the given floats
     * @param x defines the first coordinate
     * @param y defines the second coordinate
     * @returns the current updated Vector2
     */
    set(x: number, y: number): Vector2 {
        return this.copyFromFloats(x, y);
    }

    /**
     * Add another vector with the current one
     * @param otherVector defines the other vector
     * @returns a new Vector2 set with the addition of the current Vector2 and the given one coordinates
     */
    add(otherVector: DeepImmutable<Vector2>): Vector2 {
        return new Vector2(this.x + otherVector.x, this.y + otherVector.y);
    }

    /**
     * Sets the "result" coordinates with the addition of the current Vector2 and the given one coordinates
     * @param otherVector defines the other vector
     * @param result defines the target vector
     * @returns the unmodified current Vector2
     */
    addToRef(otherVector: DeepImmutable<Vector2>, result: Vector2): Vector2 {
        result.x = this.x + otherVector.x;
        result.y = this.y + otherVector.y;
        return this;
    }

    addByPoint(x: number, y: number) {
        return new Vector2(this.x + x, this.y + y);
    }

    /**
     * Set the Vector2 coordinates by adding the given Vector2 coordinates
     * @param otherVector defines the other vector
     * @returns the current updated Vector2
     */
    addInPlace(otherVector: DeepImmutable<Vector2>): Vector2 {
        this.x += otherVector.x;
        this.y += otherVector.y;
        return this;
    }

    /**
     * Gets a new Vector2 set with the subtracted coordinates of the given one from the current Vector2
     * @param otherVector defines the other vector
     * @returns a new Vector2
     */
    subtract(otherVector: Vector2): Vector2 {
        return new Vector2(this.x - otherVector.x, this.y - otherVector.y);
    }

    subtractByPoint(x: number, y: number) {
        return new Vector2(this.x - x, this.y - y);
    }

    /**
     * Sets the "result" coordinates with the subtraction of the given one from the current Vector2 coordinates.
     * @param otherVector defines the other vector
     * @param result defines the target vector
     * @returns the unmodified current Vector2
     */
    subtractToRef(otherVector: DeepImmutable<Vector2>, result: Vector2): Vector2 {
        result.x = this.x - otherVector.x;
        result.y = this.y - otherVector.y;
        return this;
    }

    /**
     * Sets the current Vector2 coordinates by subtracting from it the given one coordinates
     * @param otherVector defines the other vector
     * @returns the current updated Vector2
     */
    subtractInPlace(otherVector: DeepImmutable<Vector2>): Vector2 {
        this.x -= otherVector.x;
        this.y -= otherVector.y;
        return this;
    }

    /**
     * Multiplies in place the current Vector2 coordinates by the given ones
     * @param otherVector defines the other vector
     * @returns the current updated Vector2
     */
    multiplyInPlace(otherVector: DeepImmutable<Vector2>): Vector2 {
        this.x *= otherVector.x;
        this.y *= otherVector.y;
        return this;
    }

    /**
     * Returns a new Vector2 set with the multiplication of the current Vector2 and the given one coordinates
     * @param otherVector defines the other vector
     * @returns a new Vector2
     */
    multiply(otherVector: DeepImmutable<Vector2>): Vector2 {
        return new Vector2(this.x * otherVector.x, this.y * otherVector.y);
    }

    /**
     * Sets "result" coordinates with the multiplication of the current Vector2 and the given one coordinates
     * @param otherVector defines the other vector
     * @param result defines the target vector
     * @returns the unmodified current Vector2
     */
    multiplyToRef(otherVector: DeepImmutable<Vector2>, result: Vector2): Vector2 {
        result.x = this.x * otherVector.x;
        result.y = this.y * otherVector.y;
        return this;
    }

    /**
     * Gets a new Vector2 set with the Vector2 coordinates multiplied by the given floats
     * @param x defines the first coordinate
     * @param y defines the second coordinate
     * @returns a new Vector2
     */
    multiplyByFloats(x: number, y: number): Vector2 {
        return new Vector2(this.x * x, this.y * y);
    }

    /**
     * Returns a new Vector2 set with the Vector2 coordinates divided by the given one coordinates
     * @param otherVector defines the other vector
     * @returns a new Vector2
     */
    divide(otherVector: Vector2): Vector2 {
        return new Vector2(this.x / otherVector.x, this.y / otherVector.y);
    }

    /**
     * Sets the "result" coordinates with the Vector2 divided by the given one coordinates
     * @param otherVector defines the other vector
     * @param result defines the target vector
     * @returns the unmodified current Vector2
     */
    divideToRef(otherVector: DeepImmutable<Vector2>, result: Vector2): Vector2 {
        result.x = this.x / otherVector.x;
        result.y = this.y / otherVector.y;
        return this;
    }

    /**
     * Divides the current Vector2 coordinates by the given ones
     * @param otherVector defines the other vector
     * @returns the current updated Vector2
     */
    divideInPlace(otherVector: DeepImmutable<Vector2>): Vector2 {
        return this.divideToRef(otherVector, this);
    }

    /**
     * Gets a new Vector2 with current Vector2 negated coordinates
     * @returns a new Vector2
     */
    negate(): Vector2 {
        return new Vector2(-this.x, -this.y);
    }

    /**
     * Negate this vector in place
     * @returns this
     */
    negateInPlace(): Vector2 {
        this.x *= -1;
        this.y *= -1;
        return this;
    }

    /**
     * Negate the current Vector2 and stores the result in the given vector "result" coordinates
     * @param result defines the Vector3 object where to store the result
     * @returns the current Vector2
     */
    negateToRef(result: Vector2): Vector2 {
        return result.copyFromFloats(this.x * -1, this.y * -1);
    }

    /**
     * Multiply the Vector2 coordinates by scale
     * @param scale defines the scaling factor
     * @returns the current updated Vector2
     */
    scaleInPlace(scale: number): Vector2 {
        this.x *= scale;
        this.y *= scale;
        return this;
    }

    /**
     * Returns a new Vector2 scaled by "scale" from the current Vector2
     * @param scale defines the scaling factor
     * @returns a new Vector2
     */
    scale(scale: number): Vector2 {
        const result = new Vector2(0, 0);
        this.scaleToRef(scale, result);
        return result;
    }

    /**
     * Scale the current Vector2 values by a factor to a given Vector2
     * @param scale defines the scale factor
     * @param result defines the Vector2 object where to store the result
     * @returns the unmodified current Vector2
     */
    scaleToRef(scale: number, result: Vector2): Vector2 {
        result.x = this.x * scale;
        result.y = this.y * scale;
        return this;
    }

    /**
     * Scale the current Vector2 values by a factor and add the result to a given Vector2
     * @param scale defines the scale factor
     * @param result defines the Vector2 object where to store the result
     * @returns the unmodified current Vector2
     */
    scaleAndAddToRef(scale: number, result: Vector2): Vector2 {
        result.x += this.x * scale;
        result.y += this.y * scale;
        return this;
    }

    /**
     * Gets a boolean if two vectors are equals
     * @param otherVector defines the other vector
     * @returns true if the given vector coordinates strictly equal the current Vector2 ones
     */
    equals(otherVector: DeepImmutable<Vector2>): boolean {
        return otherVector && this.x === otherVector.x && this.y === otherVector.y;
    }

    /**
     * Gets a new Vector2 from current Vector2 floored values
     * eg (1.2, 2.31) returns (1, 2)
     * @returns a new Vector2
     */
    floor(): Vector2 {
        return new Vector2(Math.floor(this.x), Math.floor(this.y));
    }

    /**
     * Gets a new Vector2 from current Vector2 fractional values
     * eg (1.2, 2.31) returns (0.2, 0.31)
     * @returns a new Vector2
     */
    fract(): Vector2 {
        return new Vector2(this.x - Math.floor(this.x), this.y - Math.floor(this.y));
    }

    /**
     * Rotate the current vector into a given result vector
     * @param angle defines the rotation angle
     * @returns the current vector
     */
    rotate(angle: number) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const rx = cos * this.x - sin * this.y;
        const ry = sin * this.x + cos * this.y;
        this.x = rx;
        this.y = ry;
        return this;
    }

    /**
     * Rotate the current vector into a given result vector
     * @param angle defines the rotation angle
     * @param result defines the result vector where to store the rotated vector
     * @returns the current vector
     */
    rotateToRef(angle: number, result: Vector2) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        result.x = cos * this.x - sin * this.y;
        result.y = sin * this.x + cos * this.y;

        return this;
    }

    rotateByPoint(angle: number, originPoint = Vector2.create(0, 0)) {
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const rx = originPoint.x + (this.x - originPoint.x) * cosA - (this.y - originPoint.y) * sinA;
        const ry = originPoint.y + (this.x - originPoint.x) * sinA + (this.y - originPoint.y) * cosA;

        this.x = rx;
        this.y = ry;

        return this;
    }

    transformCoordinateOnRotate(angle: number) {
        const hypotenuse = Math.sqrt(this.x ** 2 + this.y ** 2);
        const beta = Math.atan2(this.y, this.x);
        const theta = -angle + beta;
        this.x = hypotenuse * Math.cos(theta);
        this.y = hypotenuse * Math.sin(theta);
        return this;
    }

    // Properties

    /**
     * Gets the length of the vector
     * @returns the vector length (float)
     */
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Gets the vector squared length
     * @returns the vector squared length (float)
     */
    lengthSquared(): number {
        return this.x * this.x + this.y * this.y;
    }

    // Methods

    /**
     * Normalize the vector
     * @returns the current updated Vector2
     */
    normalize(): Vector2 {
        Vector2.NormalizeToRef(this, this);
        return this;
    }

    /**
     * Gets a new Vector2 copied from the Vector2
     * @returns a new Vector2
     */
    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }
}

export interface IBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IBoundRect {
    tl: Vector2;
    tr: Vector2;
    bl: Vector2;
    br: Vector2;
    dx: number;
    dy: number;
}

export interface IBoundRectNoAngle {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export interface IViewportInfo {
    viewBound: IBoundRectNoAngle;
    diffBounds: IBoundRectNoAngle[];

    /**
     * scroll right further diffX < 0
     * previewBound.x - viewbound.x
     */
    diffX: number;
    diffY: number;

    /**
     * The physical position of the frozen rows and columns on the canvas, used for drawImage.
     * For example, if the freezing starts from the fourth column, the left position would be 4 * column + rowHeaderWidth.
     * The physical position means the top and left values have already considered the scaling factor.
     */
    viewPortPosition: IBoundRectNoAngle;
    viewportKey: string | SHEET_VIEWPORT_KEY;
    /**
     * In the future, a number will be used to indicate the reason for the "dirty" status
     * Here, a binary value is used to facilitate computation.
     */
    isDirty?: number;
    isForceDirty?: boolean;

    allowCache?: boolean;
    cacheBound: IBoundRectNoAngle;
    diffCacheBounds: IBoundRectNoAngle[];
    cacheViewPortPosition: IBoundRectNoAngle;

    shouldCacheUpdate: number;
    sceneTrans: Transform;
    cacheCanvas?: Canvas;

    leftOrigin: number;
    topOrigin: number;

    bufferEdgeX: number;
    bufferEdgeY: number;

    updatePrevCacheBounds?: (viewbound: IBoundRectNoAngle) => void;
}

export interface IViewportInfos {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
}
