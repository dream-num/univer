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

import Decimal from 'decimal.js';

// Decimal.cos has a bug when calculating PI/2
Decimal.prototype.cos = function (): Decimal {
    const num = this.toNumber();
    return new Decimal(Math.cos(num));
};

/**
 * Finds the sign that separates the real and imaginary parts. A sign at the
 * start of the string or right after the exponent marker of a number such as
 * `1e-7` belongs to that number, so it is skipped.
 */
function findSignIndex(inumberStr: string, sign: '+' | '-'): number {
    for (let i = 1; i < inumberStr.length; i++) {
        if (inumberStr[i] === sign && inumberStr[i - 1] !== 'e' && inumberStr[i - 1] !== 'E') {
            return i;
        }
    }

    return -1;
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

    constructor(inumber: number | string) {
        if (`${inumber}`.trim() === '') {
            this._isError = true;
            return;
        }

        this._inumber = inumber;
        this._getImReal();
        this._getImAginary();
        this._getImSuffix();
    }

    private _getImReal(): void {
        if (this._inumber === 0 || this._inumber === '0') {
            this._realNum = 0;
            return;
        }

        const inumberStr = `${this._inumber}`;

        if (['i', '+i', '1i', '+1i', '-i', '-1i', 'j', '+j', '1j', '+1j', '-j', '-1j'].indexOf(inumberStr) >= 0) {
            this._realNum = 0;
            return;
        }

        const plus = findSignIndex(inumberStr, '+');
        const minus = findSignIndex(inumberStr, '-');

        const last = inumberStr.substring(inumberStr.length - 1, inumberStr.length);
        const unit = last === 'i' || last === 'j';

        if (plus >= 0 || minus >= 0) {
            if (!unit) {
                this._isError = true;
                return;
            }

            if (plus >= 0) {
                if (Number.isNaN(+inumberStr.substring(0, plus)) || Number.isNaN(+inumberStr.substring(plus + 1, inumberStr.length - 1))) {
                    this._isError = true;
                } else {
                    this._realNum = +inumberStr.substring(0, plus);
                }
            } else {
                if (Number.isNaN(+inumberStr.substring(0, minus)) || Number.isNaN(+inumberStr.substring(minus + 1, inumberStr.length - 1))) {
                    this._isError = true;
                } else {
                    this._realNum = +inumberStr.substring(0, minus);
                }
            }
        } else {
            if (unit) {
                if (Number.isNaN(+inumberStr.substring(0, inumberStr.length - 1))) {
                    this._isError = true;
                } else {
                    this._realNum = 0;
                }
            } else {
                if (Number.isNaN(+inumberStr)) {
                    this._isError = true;
                } else {
                    this._realNum = +inumberStr;
                }
            }
        }
    }

    private _getImAginary(): void {
        if (this._isError) {
            return;
        }

        if (this._inumber === 0 || this._inumber === '0') {
            this._iNum = 0;
            return;
        }

        let inumberStr = `${this._inumber}`;

        if (['i', 'j'].indexOf(inumberStr) >= 0) {
            this._iNum = 1;
            return;
        }

        inumberStr = inumberStr.replace('+i', '+1i').replace('-i', '-1i').replace('+j', '+1j').replace('-j', '-1j');

        const plus = findSignIndex(inumberStr, '+');
        const minus = findSignIndex(inumberStr, '-');

        const last = inumberStr.substring(inumberStr.length - 1, inumberStr.length);
        const unit = last === 'i' || last === 'j';

        if (plus >= 0 || minus >= 0) {
            if (!unit) {
                this._isError = true;
                return;
            }

            if (plus >= 0) {
                if (Number.isNaN(+inumberStr.substring(0, plus)) || Number.isNaN(+inumberStr.substring(plus + 1, inumberStr.length - 1))) {
                    this._isError = true;
                } else {
                    this._iNum = +inumberStr.substring(plus + 1, inumberStr.length - 1);
                }
            } else {
                if (Number.isNaN(+inumberStr.substring(0, minus)) || Number.isNaN(+inumberStr.substring(minus + 1, inumberStr.length - 1))) {
                    this._isError = true;
                } else {
                    this._iNum = -(+inumberStr.substring(minus + 1, inumberStr.length - 1));
                }
            }
        } else {
            if (unit) {
                if (Number.isNaN(+inumberStr.substring(0, inumberStr.length - 1))) {
                    this._isError = true;
                } else {
                    this._iNum = +inumberStr.substring(0, inumberStr.length - 1);
                }
            } else {
                if (Number.isNaN(+inumberStr)) {
                    this._isError = true;
                } else {
                    this._iNum = 0;
                }
            }
        }
    }

    private _getImSuffix(): void {
        const inumberStr = `${this._inumber}`;

        const suffix = inumberStr.substring(inumberStr.length - 1);

        this._suffix = suffix === 'i' || suffix === 'j' ? suffix : '';
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
