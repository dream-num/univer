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

import { DateSystem, getNumfmtParseValueFilter } from '@univerjs/core';
import Decimal from 'decimal.js';

// Decimal.cos has a bug when calculating PI/2
Decimal.prototype.cos = function (): Decimal {
    const num = this.toNumber();
    return new Decimal(Math.cos(num));
};

/**
 * Finds the sign that separates the real and imaginary parts. A sign at the
 * start of the string or right after the exponent marker of a number such as
 * `1e-7` belongs to that number, so it is skipped. Excel splits the text at
 * the first remaining sign, which keeps every later sign inside the imaginary
 * part, e.g. `1+2-3i` reads its imaginary part as `2-3`.
 */
function findSeparatorIndex(inumberStr: string): number {
    for (let i = 1; i < inumberStr.length; i++) {
        const char = inumberStr[i];

        if ((char === '+' || char === '-') && inumberStr[i - 1] !== 'e' && inumberStr[i - 1] !== 'E') {
            return i;
        }
    }

    return -1;
}

/**
 * Matches the parts that are already plain numbers, so the common case skips
 * the full text to number conversion.
 */
const DECIMAL_PART_REG = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

/**
 * Reads one part of a complex number with the same text to number conversion
 * Excel applies to cell text, so a part may also be a percentage such as `50%`
 * or a date such as `2-3`, which is February 3 of the current year. The date
 * serial follows the workbook date system, as it does for cell text.
 */
function parseComplexPart(part: string, dateSystem: DateSystem): number | null {
    const value = part.trim();

    if (value === '') {
        return null;
    }

    if (DECIMAL_PART_REG.test(value)) {
        const number = Number(value);

        return Number.isFinite(number) ? number : null;
    }

    const parsed = getNumfmtParseValueFilter(value, { dateSystem });

    if (!parsed || typeof parsed.v !== 'number' || !Number.isFinite(parsed.v)) {
        return null;
    }

    return parsed.v;
}

/**
 * Reads the coefficient of the imaginary unit. Excel accepts an empty
 * coefficient and a bare sign, e.g. `i`, `1+i` and `-i`.
 */
function parseImaginaryCoefficient(part: string, dateSystem: DateSystem): number | null {
    const value = part.trim();

    if (value === '' || value === '+') {
        return 1;
    }

    if (value === '-') {
        return -1;
    }

    return parseComplexPart(value, dateSystem);
}

/**
 * Excel prints the parts of a complex number with at most 15 significant
 * digits and keeps plain decimal notation while the text fits in 21
 * characters, e.g. `0.0000001` and `100000000000000000000`. Longer values fall
 * back to scientific notation such as `1.23456789012345E-06`.
 *
 * The whole conversion stays inside Decimal so the rounded value is never
 * turned into a double and formatted again, which can round a second time.
 */
const MAX_FIXED_LENGTH = 21;

function formatComplexNumber(value: Decimal): string {
    if (!value.isFinite()) {
        return value.toString();
    }

    if (value.isZero()) {
        return '0';
    }

    const sign = value.isNegative() ? '-' : '';
    const abs = value.abs().toSignificantDigits(15, Decimal.ROUND_HALF_UP);
    const fixed = abs.toFixed();

    if (fixed.length <= MAX_FIXED_LENGTH) {
        return `${sign}${fixed}`;
    }

    const [mantissa, exponent] = abs.toExponential().split('e');
    const power = Number(exponent);
    const exponentText = `${power < 0 ? '-' : '+'}${Math.abs(power).toString().padStart(2, '0')}`;

    return `${sign}${mantissa}E${exponentText}`;
}

/**
 * Formats the imaginary part. Excel omits the coefficient of the unit, so `1`
 * and `-1` render as `i` and `-i`.
 */
function formatImaginaryNumber(iValue: Decimal, suffix: string): string {
    if (iValue.eq(1)) {
        return suffix;
    }

    if (iValue.eq(-1)) {
        return `-${suffix}`;
    }

    return `${formatComplexNumber(iValue)}${suffix}`;
}

export class Complex {
    static getComplex(realNum: number, iNum: number, suffix: string): number | string {
        const realValue = new Decimal(realNum).toSignificantDigits(15, Decimal.ROUND_HALF_UP);
        const iValue = new Decimal(iNum).toSignificantDigits(15, Decimal.ROUND_HALF_UP);
        const _suffix = suffix === '' ? 'i' : suffix;

        let result: number | string;

        if (realValue.isZero() && iValue.isZero()) {
            result = 0;
        } else if (realValue.isZero()) {
            result = formatImaginaryNumber(iValue, _suffix);
        } else if (iValue.isZero()) {
            result = realValue.toNumber();
        } else {
            const sign = iValue.gt(0) ? '+' : '';
            result = `${formatComplexNumber(realValue)}${sign}${formatImaginaryNumber(iValue, _suffix)}`;
        }

        return result;
    }

    static createByComplexStr(realNum: number, iNum: number, suffix: string): Complex {
        const complexStr = Complex.getComplex(realNum, iNum, suffix);

        return new Complex(complexStr);
    }

    private _inumber: string | number = '';

    private _realNum: number = 0;

    private _iNum: number = 0;

    private _suffix: string = '';

    private _isError: boolean = false;

    private _dateSystem: DateSystem = DateSystem.Date1900;

    constructor(inumber: number | string, dateSystem: DateSystem = DateSystem.Date1900) {
        this._inumber = inumber;
        this._dateSystem = dateSystem;
        this._parseInumber();
    }

    /**
     * Reads the text into its real and imaginary parts. Excel converts every
     * part with the same text to number conversion it applies to cell values,
     * so `1+2-3i` keeps `2-3` as its imaginary part, and any part that cannot
     * be read makes the whole number invalid.
     */
    private _parseInumber(): void {
        const inumberStr = `${this._inumber}`.trim();

        if (inumberStr === '') {
            this._isError = true;
            return;
        }

        const last = inumberStr.substring(inumberStr.length - 1);
        const unit = last === 'i' || last === 'j';
        const body = unit ? inumberStr.substring(0, inumberStr.length - 1) : inumberStr;
        const separatorIndex = findSeparatorIndex(body);

        if (!unit && separatorIndex >= 0) {
            // A separator without an imaginary unit is not a complex number,
            // e.g. `1+2-3`.
            this._isError = true;
            return;
        }

        let realText = body;
        let iText: string | null = null;

        if (unit) {
            realText = '';

            if (separatorIndex >= 0) {
                realText = body.substring(0, separatorIndex);
                iText = body.substring(separatorIndex + 1);
            } else {
                iText = body;
            }
        }

        const realNum = realText === '' ? 0 : parseComplexPart(realText, this._dateSystem);
        const iNum = iText === null ? 0 : parseImaginaryCoefficient(iText, this._dateSystem);
        const iSign = separatorIndex >= 0 && body[separatorIndex] === '-' ? -1 : 1;

        if (realNum === null || iNum === null) {
            this._isError = true;
            return;
        }

        this._realNum = realNum;
        this._iNum = iSign * iNum;
        this._suffix = unit ? last : '';
    }

    getRealNum(): number {
        return this._realNum;
    }

    getINum(): number {
        return this._iNum;
    }

    getSuffix(): string {
        return this._suffix;
    }

    isError(): boolean {
        return this._isError;
    }

    toString(): number | string {
        return Complex.getComplex(this._realNum, this._iNum, this._suffix);
    }

    isDifferentSuffixes(complex2: Complex): boolean {
        const suffix2 = complex2.getSuffix();

        if (this._suffix === '' || suffix2 === '') {
            return false;
        }

        return this._suffix !== suffix2;
    }

    Abs(): number {
        const result = Decimal.sqrt(Decimal.pow(this._realNum, 2).add(Decimal.pow(this._iNum, 2))).toSignificantDigits(16).toNumber();

        return result;
    }

    Argument(): number {
        const abs = Decimal.sqrt(Decimal.pow(this._realNum, 2).add(Decimal.pow(this._iNum, 2)));

        let result = Decimal.acos(new Decimal(this._realNum).div(abs)).toSignificantDigits(16).toNumber();

        if (this._iNum < 0) {
            result = -result;
        }

        return result;
    }

    Conjugate(): number | string {
        return Complex.getComplex(this._realNum, -this._iNum, this._suffix);
    }

    Cos(): number | string {
        if (this._iNum) {
            const realNum = Decimal.cos(this._realNum).mul(Decimal.cosh(this._iNum)).toNumber();
            const iNum = Decimal.sin(this._realNum).mul(Decimal.sinh(this._iNum)).negated().toNumber();

            return Complex.getComplex(realNum, iNum, this._suffix);
        } else {
            const realNum = Decimal.cos(this._realNum).toNumber();

            return Complex.getComplex(realNum, this._iNum, this._suffix);
        }
    }

    Cosh(): number | string {
        if (!Number.isFinite(Math.sinh(this._realNum)) || !Number.isFinite(Math.cosh(this._realNum))) {
            this._isError = true;
            return '';
        }

        if (this._iNum) {
            const realNum = Decimal.cosh(this._realNum).mul(Decimal.cos(this._iNum)).toNumber();
            const iNum = Decimal.sinh(this._realNum).mul(Decimal.sin(this._iNum)).toNumber();

            return Complex.getComplex(realNum, iNum, this._suffix);
        } else {
            const realNum = Decimal.cosh(this._realNum).toNumber();

            return Complex.getComplex(realNum, this._iNum, this._suffix);
        }
    }

    Cot(): number | string {
        if (this._iNum) {
            const den = Decimal.cosh(this._iNum * 2).sub(Decimal.cos(this._realNum * 2));
            const realNum = Decimal.sin(this._realNum * 2).div(den).toNumber();
            const iNum = Decimal.sinh(this._iNum * 2).div(den).negated().toNumber();

            return Complex.getComplex(realNum, iNum, this._suffix);
        } else {
            const realNum = new Decimal(1).div(Decimal.tan(this._realNum)).toNumber();

            return Complex.getComplex(realNum, this._iNum, this._suffix);
        }
    }

    Coth(): number | string {
        if (!Number.isFinite(Math.sinh(this._realNum)) || !Number.isFinite(Math.cosh(this._realNum))) {
            this._isError = true;
            return '';
        }

        if (this._iNum) {
            const den = Decimal.cosh(this._realNum * 2).sub(Decimal.cos(this._iNum * 2));
            const realNum = Decimal.sinh(this._realNum * 2).div(den).toNumber();
            const iNum = Decimal.sin(this._iNum * 2).div(den).negated().toNumber();

            return Complex.getComplex(realNum, iNum, this._suffix);
        } else {
            const realNum = new Decimal(1).div(Decimal.tanh(this._realNum)).toNumber();

            return Complex.getComplex(realNum, this._iNum, this._suffix);
        }
    }

    Csc(): number | string {
        if (this._iNum) {
            const den = Decimal.cosh(this._iNum * 2).sub(Decimal.cos(this._realNum * 2));
            const realNum = Decimal.sin(this._realNum).mul(Decimal.cosh(this._iNum)).mul(2).div(den).toNumber();
            const iNum = Decimal.cos(this._realNum).mul(Decimal.sinh(this._iNum)).mul(-2).div(den).toNumber();

            return Complex.getComplex(realNum, iNum, this._suffix);
        } else {
            const realNum = new Decimal(1).div(Decimal.sin(this._realNum)).toNumber();

            return Complex.getComplex(realNum, this._iNum, this._suffix);
        }
    }

    Csch(): number | string {
        if (!Number.isFinite(Math.sinh(this._realNum)) || !Number.isFinite(Math.cosh(this._realNum))) {
            return Complex.getComplex(0, 0, this._suffix);
        }

        if (this._iNum) {
            const den = Decimal.cosh(this._realNum * 2).sub(Decimal.cos(this._iNum * 2));
            const realNum = Decimal.sinh(this._realNum).mul(Decimal.cos(this._iNum)).mul(2).div(den).toNumber();
            const iNum = Decimal.cosh(this._realNum).mul(Decimal.sin(this._iNum)).mul(-2).div(den).toNumber();

            return Complex.getComplex(realNum, iNum, this._suffix);
        } else {
            const realNum = new Decimal(1).div(Decimal.sinh(this._realNum)).toNumber();

            return Complex.getComplex(realNum, this._iNum, this._suffix);
        }
    }

    Div(complex2: Complex): number | string {
        const Decimal_realNum1 = new Decimal(this._realNum);
        const Decimal_iNum1 = new Decimal(this._iNum);
        const Decimal_realNum2 = new Decimal(complex2.getRealNum());
        const Decimal_iNum2 = new Decimal(complex2.getINum());

        const den = Decimal_realNum2.mul(Decimal_realNum2).add(Decimal_iNum2.mul(Decimal_iNum2));
        const realNum = Decimal_realNum1.mul(Decimal_realNum2).add(Decimal_iNum1.mul(Decimal_iNum2)).div(den).toNumber();
        const iNum = Decimal_iNum1.mul(Decimal_realNum2).sub(Decimal_realNum1.mul(Decimal_iNum2)).div(den).toNumber();

        const suffix = this._suffix === '' ? complex2.getSuffix() : this._suffix;

        return Complex.getComplex(realNum, iNum, suffix);
    }

    Exp(): number | string {
        if (!Number.isFinite(Math.exp(this._realNum))) {
            this._isError = true;
            return '';
        }

        const realNum = Decimal.exp(this._realNum).mul(Decimal.cos(this._iNum)).toNumber();
        const iNum = Decimal.exp(this._realNum).mul(Decimal.sin(this._iNum)).toNumber();

        return Complex.getComplex(realNum, iNum, this._suffix);
    }

    Ln(): number | string {
        // Keep the real part and the argument in double precision so the
        // result matches Excel, including ln|z| when |z| is close to 1.
        // atan2 also carries the sign of the imaginary part.
        const realNum = Math.log(Math.hypot(this._realNum, this._iNum));
        const iNum = Math.atan2(this._iNum, this._realNum);

        return Complex.getComplex(realNum, iNum, this._suffix);
    }

    Log(base: number): number | string {
        const abs = Decimal.sqrt(Decimal.pow(this._realNum, 2).add(Decimal.pow(this._iNum, 2)));
        const Decimal_realNum1 = Decimal.ln(abs);
        let Decimal_iNum1 = Decimal.acos(new Decimal(this._realNum).div(abs));

        if (this._iNum < 0) {
            Decimal_iNum1 = Decimal_iNum1.negated();
        }

        const Decimal_realNum2 = Decimal.ln(base);
        const Decimal_iNum2 = new Decimal(0);

        const den = Decimal_realNum2.mul(Decimal_realNum2).add(Decimal_iNum2.mul(Decimal_iNum2));

        if (den.eq(0)) {
            this._isError = true;
            return '';
        }

        const realNum = Decimal_realNum1.mul(Decimal_realNum2).add(Decimal_iNum1.mul(Decimal_iNum2)).div(den).toNumber();
        const iNum = Decimal_iNum1.mul(Decimal_realNum2).sub(Decimal_realNum1.mul(Decimal_iNum2)).div(den).toNumber();

        return Complex.getComplex(realNum, iNum, this._suffix);
    }

    Power(number: number): number | string {
        if (this._realNum === 0 && this._iNum === 0) {
            if (number > 0) {
                return Complex.getComplex(this._realNum, this._iNum, this._suffix);
            } else {
                this._isError = true;
                return '';
            }
        }

        let power = Decimal.sqrt(Decimal.pow(this._realNum, 2).add(Decimal.pow(this._iNum, 2)));
        let phi = Decimal.acos(new Decimal(this._realNum).div(power));

        if (this._iNum < 0) {
            phi = phi.negated();
        }

        power = Decimal.pow(power, number);
        phi = phi.mul(number);

        const realNum = Decimal.cos(phi).mul(power).toNumber();
        const iNum = Decimal.sin(phi).mul(power).toNumber();

        if (!Number.isFinite(realNum) || !Number.isFinite(iNum)) {
            this._isError = true;
            return '';
        }

        return Complex.getComplex(realNum, iNum, this._suffix);
    }

    Product(complex2: Complex): number | string {
        const Decimal_realNum1 = new Decimal(this._realNum);
        const Decimal_iNum1 = new Decimal(this._iNum);
        const Decimal_realNum2 = new Decimal(complex2.getRealNum());
        const Decimal_iNum2 = new Decimal(complex2.getINum());

        const realNum = Decimal_realNum1.mul(Decimal_realNum2).sub(Decimal_iNum1.mul(Decimal_iNum2)).toNumber();
        const iNum = Decimal_realNum1.mul(Decimal_iNum2).add(Decimal_iNum1.mul(Decimal_realNum2)).toNumber();

        const suffix = this._suffix === '' ? complex2.getSuffix() : this._suffix;

        return Complex.getComplex(realNum, iNum, suffix);
    }

    Sec(): number | string {
        if (this._iNum) {
            const den = Decimal.cosh(this._iNum * 2).add(Decimal.cos(this._realNum * 2));
            const realNum = Decimal.cos(this._realNum).mul(Decimal.cosh(this._iNum)).mul(2).div(den).toNumber();
            const iNum = Decimal.sin(this._realNum).mul(Decimal.sinh(this._iNum)).mul(2).div(den).toNumber();

            return Complex.getComplex(realNum, iNum, this._suffix);
        } else {
            const realNum = new Decimal(1).div(Decimal.cos(this._realNum)).toNumber();

            return Complex.getComplex(realNum, this._iNum, this._suffix);
        }
    }

    Sech(): number | string {
        if (!Number.isFinite(Math.sinh(this._realNum * 2)) || !Number.isFinite(Math.cosh(this._realNum * 2))) {
            return Complex.getComplex(0, 0, this._suffix);
        }

        if (this._iNum) {
            const den = Decimal.cosh(this._realNum * 2).add(Decimal.cos(this._iNum * 2));
            const realNum = Decimal.cosh(this._realNum).mul(Decimal.cos(this._iNum)).mul(2).div(den).toNumber();
            const iNum = Decimal.sinh(this._realNum).mul(Decimal.sin(this._iNum)).mul(-2).div(den).toNumber();

            return Complex.getComplex(realNum, iNum, this._suffix);
        } else {
            const realNum = new Decimal(1).div(Decimal.cosh(this._realNum)).toNumber();

            return Complex.getComplex(realNum, this._iNum, this._suffix);
        }
    }

    Sin(): number | string {
        if (this._iNum) {
            const realNum = Decimal.sin(this._realNum).mul(Decimal.cosh(this._iNum)).toNumber();
            const iNum = Decimal.cos(this._realNum).mul(Decimal.sinh(this._iNum)).toNumber();

            return Complex.getComplex(realNum, iNum, this._suffix);
        } else {
            const realNum = Decimal.sin(this._realNum).toNumber();

            return Complex.getComplex(realNum, this._iNum, this._suffix);
        }
    }

    Sinh(): number | string {
        if (!Number.isFinite(Math.sinh(this._realNum)) || !Number.isFinite(Math.cosh(this._realNum))) {
            this._isError = true;
            return '';
        }

        if (this._iNum) {
            const realNum = Decimal.sinh(this._realNum).mul(Decimal.cos(this._iNum)).toNumber();
            const iNum = Decimal.cosh(this._realNum).mul(Decimal.sin(this._iNum)).toNumber();

            return Complex.getComplex(realNum, iNum, this._suffix);
        } else {
            const realNum = Decimal.sinh(this._realNum).toNumber();

            return Complex.getComplex(realNum, this._iNum, this._suffix);
        }
    }

    Sqrt(): number | string {
        const abs = Decimal.sqrt(Decimal.pow(this._realNum, 2).add(Decimal.pow(this._iNum, 2)));
        const abs_sqrt = Decimal.sqrt(abs);

        let arg = Decimal.acos(new Decimal(this._realNum).div(abs));

        if (this._iNum < 0) {
            arg = arg.negated();
        }

        const realNum = abs_sqrt.mul(Decimal.cos(arg.div(2).toNumber())).toNumber();
        const iNum = abs_sqrt.mul(Decimal.sin(arg.div(2))).toNumber();

        return Complex.getComplex(realNum, iNum, this._suffix);
    }

    Sub(complex2: Complex): number | string {
        const Decimal_realNum1 = new Decimal(this._realNum);
        const Decimal_iNum1 = new Decimal(this._iNum);
        const Decimal_realNum2 = new Decimal(complex2.getRealNum());
        const Decimal_iNum2 = new Decimal(complex2.getINum());

        const realNum = Decimal_realNum1.sub(Decimal_realNum2).toNumber();
        const iNum = Decimal_iNum1.sub(Decimal_iNum2).toNumber();

        const suffix = this._suffix === '' ? complex2.getSuffix() : this._suffix;

        return Complex.getComplex(realNum, iNum, suffix);
    }

    Sum(complex2: Complex): number | string {
        const Decimal_realNum1 = new Decimal(this._realNum);
        const Decimal_iNum1 = new Decimal(this._iNum);
        const Decimal_realNum2 = new Decimal(complex2.getRealNum());
        const Decimal_iNum2 = new Decimal(complex2.getINum());

        const realNum = Decimal_realNum1.add(Decimal_realNum2).toNumber();
        const iNum = Decimal_iNum1.add(Decimal_iNum2).toNumber();

        const suffix = this._suffix === '' ? complex2.getSuffix() : this._suffix;

        return Complex.getComplex(realNum, iNum, suffix);
    }

    Tan(): number | string {
        if (this._iNum) {
            const den = Decimal.cos(this._realNum * 2).add(Decimal.cosh(this._iNum * 2));
            const realNum = Decimal.sin(this._realNum * 2).div(den).toNumber();
            const iNum = Decimal.sinh(this._iNum * 2).div(den).toNumber();

            return Complex.getComplex(realNum, iNum, this._suffix);
        } else {
            const realNum = Decimal.tan(this._realNum).toNumber();

            return Complex.getComplex(realNum, this._iNum, this._suffix);
        }
    }

    Tanh(): number | string {
        if (!Number.isFinite(Math.sinh(this._realNum)) || !Number.isFinite(Math.cosh(this._realNum))) {
            this._isError = true;
            return '';
        }

        if (this._iNum) {
            const den = Decimal.cosh(this._realNum * 2).add(Decimal.cos(this._iNum * 2));
            const realNum = Decimal.sinh(this._realNum * 2).div(den).toNumber();
            const iNum = Decimal.sin(this._iNum * 2).div(den).toNumber();

            return Complex.getComplex(realNum, iNum, this._suffix);
        } else {
            const realNum = Decimal.tanh(this._realNum).toNumber();

            return Complex.getComplex(realNum, this._iNum, this._suffix);
        }
    }
}
