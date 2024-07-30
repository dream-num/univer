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

import type { ArrayValueObject } from '../engine/value-object/array-value-object';
import type { BaseValueObject } from '../engine/value-object/base-value-object';
import { ErrorValueObject } from '../engine/value-object/base-value-object';
import { ErrorType } from './error-type';

export function checkVariantsErrorIsArrayOrBoolean(...variants: BaseValueObject[]) {
    for (let i = 0; i < variants.length; i++) {
        let variant = variants[i];

        if (variant.isArray()) {
            const rowCount = (variant as ArrayValueObject).getRowCount();
            const columnCount = (variant as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return {
                    isError: true,
                    errorObject: ErrorValueObject.create(ErrorType.VALUE),
                };
            }

            variant = (variant as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (variant.isError()) {
            return {
                isError: true,
                errorObject: variant,
            };
        }

        if (variant.isBoolean()) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.VALUE),
            };
        }

        variants[i] = variant;
    }

    return {
        isError: false,
        variants,
    };
}

// eslint-disable-next-line ts/no-namespace
export namespace BESSEL {
    const W = 0.636619772;

    function _horner(arr: number[], v: number): number {
        let z = 0;

        for (let i = 0; i < arr.length; ++i) {
            z = v * z + arr[i];
        }

        return z;
    }

    function _bessel_iter(x: number, n: number, f0: number, f1: number, sign: number): number {
        if (n === 0) {
            return f0;
        }

        if (n === 1) {
            return f1;
        }

        const tdx = 2 / x;
        let _f0 = f0;
        let _f1 = f1;
        let f2 = f1;

        for (let o = 1; o < n; ++o) {
            f2 = _f1 * o * tdx + sign * _f0;
            _f0 = _f1;
            _f1 = f2;
        }

        return f2;
    }

    function _bessel_wrap(bessel0: Function, bessel1: Function, nonzero: number, sign: number) {
        return function bessel(x: number, n: number) {
            if (nonzero) {
                if (x === 0) {
                    return nonzero === 1 ? -Infinity : Infinity;
                } else if (x < 0) {
                    return Number.NaN;
                }
            }

            if (n === 0) {
                return bessel0(x);
            }

            if (n === 1) {
                return bessel1(x);
            }

            if (n < 0) {
                return Number.NaN;
            }

            const _n = n | 0;

            const b0 = bessel0(x);
            const b1 = bessel1(x);

            return _bessel_iter(x, _n, b0, b1, sign);
        };
    }

    export const besselj = (() => {
        const b0_a1a = [-184.9052456, 77392.33017, -11214424.18, 651619640.7, -13362590354.0, 57568490574.0];
        const b0_a2a = [1.0, 267.8532712, 59272.64853, 9494680.718, 1029532985.0, 57568490411.0];
        const b0_a1b = [0.2093887211e-6, -0.2073370639e-5, 0.2734510407e-4, -0.1098628627e-2, 1.0];
        const b0_a2b = [-0.934935152e-7, 0.7621095161e-6, -0.6911147651e-5, 0.1430488765e-3, -0.1562499995e-1];

        function bessel0(x: number): number {
            let a = 0;
            let a1 = 0;
            let a2 = 0;
            let y = x * x;

            if (x < 8) {
                a1 = _horner(b0_a1a, y);
                a2 = _horner(b0_a2a, y);
                a = a1 / a2;
            } else {
                const xx = x - 0.785398164;
                y = 64 / y;
                a1 = _horner(b0_a1b, y);
                a2 = _horner(b0_a2b, y);
                a = Math.sqrt(W / x) * (Math.cos(xx) * a1 - Math.sin(xx) * a2 * 8 / x);
            }

            return a;
        }

        const b1_a1a = [-30.16036606, 15704.48260, -2972611.439, 242396853.1, -7895059235.0, 72362614232.0];
        const b1_a2a = [1.0, 376.9991397, 99447.43394, 18583304.74, 2300535178.0, 144725228442.0];
        const b1_a1b = [-0.240337019e-6, 0.2457520174e-5, -0.3516396496e-4, 0.183105e-2, 1.0];
        const b1_a2b = [0.105787412e-6, -0.88228987e-6, 0.8449199096e-5, -0.2002690873e-3, 0.04687499995];

        function bessel1(x: number): number {
            let a = 0;
            let a1 = 0;
            let a2 = 0;
            let y = x * x;
            const xx = Math.abs(x) - 2.356194491;

            if (Math.abs(x) < 8) {
                a1 = x * _horner(b1_a1a, y);
                a2 = _horner(b1_a2a, y);
                a = a1 / a2;
            } else {
                y = 64 / y;
                a1 = _horner(b1_a1b, y);
                a2 = _horner(b1_a2b, y);
                a = Math.sqrt(W / Math.abs(x)) * (Math.cos(xx) * a1 - Math.sin(xx) * a2 * 8 / Math.abs(x));

                if (x < 0) {
                    a = -a;
                }
            }

            return a;
        }

        return function besselj(x: number, n: number): number {
            const _n = Math.round(n);

            if (!Number.isFinite(x)) {
                return Number.isNaN(x) ? x : 0;
            }

            if (_n < 0) {
                return ((_n % 2) ? -1 : 1) * besselj(x, -_n);
            }

            if (x < 0) {
                return ((_n % 2) ? -1 : 1) * besselj(-x, _n);
            }

            if (_n === 0) {
                return bessel0(x);
            }

            if (_n === 1) {
                return bessel1(x);
            }

            if (x === 0) {
                return 0;
            }

            let ret = 0.0;

            if (x > _n) {
                ret = _bessel_iter(x, _n, bessel0(x), bessel1(x), -1);
            } else {
                const m = 2 * Math.floor((_n + Math.floor(Math.sqrt(40 * _n))) / 2);
                let jsum = false;
                let bjp = 0.0;
                let sum = 0.0;
                let bj = 1.0;
                let bjm = 0.0;
                const tox = 2 / x;

                for (let j = m; j > 0; j--) {
                    bjm = j * tox * bj - bjp;
                    bjp = bj;
                    bj = bjm;

                    if (Math.abs(bj) > 1e10) {
                        bj *= 1e-10;
                        bjp *= 1e-10;
                        ret *= 1e-10;
                        sum *= 1e-10;
                    }

                    if (jsum) {
                        sum += bj;
                    }

                    jsum = !jsum;

                    if (j === _n) {
                        ret = bjp;
                    }
                }

                sum = 2.0 * sum - bj;
                ret /= sum;
            }

            return ret;
        };
    })();

    export const bessely = (() => {
        const b0_a1a = [228.4622733, -86327.92757, 10879881.29, -512359803.6, 7062834065.0, -2957821389.0];
        const b0_a2a = [1.0, 226.1030244, 47447.26470, 7189466.438, 745249964.8, 40076544269.0];
        const b0_a1b = [0.2093887211e-6, -0.2073370639e-5, 0.2734510407e-4, -0.1098628627e-2, 1.0];
        const b0_a2b = [-0.934945152e-7, 0.7621095161e-6, -0.6911147651e-5, 0.1430488765e-3, -0.1562499995e-1];

        function bessel0(x: number): number {
            let a = 0;
            let a1 = 0;
            let a2 = 0;
            let y = x * x;
            const xx = x - 0.785398164;

            if (x < 8) {
                a1 = _horner(b0_a1a, y);
                a2 = _horner(b0_a2a, y);
                a = a1 / a2 + W * besselj(x, 0) * Math.log(x);
            } else {
                y = 64 / y;
                a1 = _horner(b0_a1b, y);
                a2 = _horner(b0_a2b, y);
                a = Math.sqrt(W / x) * (Math.sin(xx) * a1 + Math.cos(xx) * a2 * 8 / x);
            }

            return a;
        }

        const b1_a1a = [0.8511937935e4, -0.4237922726e7, 0.7349264551e9, -0.5153438139e11, 0.1275274390e13, -0.4900604943e13];
        const b1_a2a = [1, 0.3549632885e3, 0.1020426050e6, 0.2245904002e8, 0.3733650367e10, 0.4244419664e12, 0.2499580570e14];
        const b1_a1b = [-0.240337019e-6, 0.2457520174e-5, -0.3516396496e-4, 0.183105e-2, 1.0];
        const b1_a2b = [0.105787412e-6, -0.88228987e-6, 0.8449199096e-5, -0.2002690873e-3, 0.04687499995];

        function bessel1(x: number): number {
            let a = 0;
            let a1 = 0;
            let a2 = 0;
            let y = x * x;
            const xx = x - 2.356194491;

            if (x < 8) {
                a1 = x * _horner(b1_a1a, y);
                a2 = _horner(b1_a2a, y);
                a = a1 / a2 + W * (besselj(x, 1) * Math.log(x) - 1 / x);
            } else {
                y = 64 / y;
                a1 = _horner(b1_a1b, y);
                a2 = _horner(b1_a2b, y);
                a = Math.sqrt(W / x) * (Math.sin(xx) * a1 + Math.cos(xx) * a2 * 8 / x);
            }

            return a;
        }

        return _bessel_wrap(bessel0, bessel1, 1, -1);
    })();

    export const besseli = (() => {
        const b0_a = [0.45813e-2, 0.360768e-1, 0.2659732, 1.2067492, 3.0899424, 3.5156229, 1.0];
        const b0_b = [0.392377e-2, -0.1647633e-1, 0.2635537e-1, -0.2057706e-1, 0.916281e-2, -0.157565e-2, 0.225319e-2, 0.1328592e-1, 0.39894228];

        function bessel0(x: number): number {
            if (x <= 3.75) {
                return _horner(b0_a, x * x / (3.75 * 3.75));
            }

            return Math.exp(Math.abs(x)) / Math.sqrt(Math.abs(x)) * _horner(b0_b, 3.75 / Math.abs(x));
        }

        const b1_a = [0.32411e-3, 0.301532e-2, 0.2658733e-1, 0.15084934, 0.51498869, 0.87890594, 0.5];
        const b1_b = [-0.420059e-2, 0.1787654e-1, -0.2895312e-1, 0.2282967e-1, -0.1031555e-1, 0.163801e-2, -0.362018e-2, -0.3988024e-1, 0.39894228];

        function bessel1(x: number): number {
            if (x < 3.75) {
                return x * _horner(b1_a, x * x / (3.75 * 3.75));
            }

            return (x < 0 ? -1 : 1) * Math.exp(Math.abs(x)) / Math.sqrt(Math.abs(x)) * _horner(b1_b, 3.75 / Math.abs(x));
        }

        return function besseli(x: number, n: number): number {
            const _n = Math.round(n);

            if (_n === 0) {
                return bessel0(x);
            }

            if (_n === 1) {
                return bessel1(x);
            }

            if (_n < 0) {
                return Number.NaN;
            }

            if (Math.abs(x) === 0) {
                return 0;
            }

            if (x === Infinity) {
                return Infinity;
            }

            let ret = 0.0;
            let j;
            const tox = 2 / Math.abs(x);
            let bip = 0.0;
            let bi = 1.0;
            let bim = 0.0;

            const m = 2 * Math.round((_n + Math.round(Math.sqrt(40 * _n))) / 2);

            for (j = m; j > 0; j--) {
                bim = j * tox * bi + bip;
                bip = bi;
                bi = bim;

                if (Math.abs(bi) > 1e10) {
                    bi *= 1e-10;
                    bip *= 1e-10;
                    ret *= 1e-10;
                }

                if (j === _n) ret = bip;
            }

            ret *= besseli(x, 0) / bi;

            return x < 0 && (_n % 2) ? -ret : ret;
        };
    })();

    export const besselk = (() => {
        const b0_a = [0.74e-5, 0.10750e-3, 0.262698e-2, 0.3488590e-1, 0.23069756, 0.42278420, -0.57721566];
        const b0_b = [0.53208e-3, -0.251540e-2, 0.587872e-2, -0.1062446e-1, 0.2189568e-1, -0.7832358e-1, 1.25331414];

        function bessel0(x: number): number {
            if (x <= 2) {
                return -Math.log(x / 2) * besseli(x, 0) + _horner(b0_a, x * x / 4);
            }

            return Math.exp(-x) / Math.sqrt(x) * _horner(b0_b, 2 / x);
        }

        const b1_a = [-0.4686e-4, -0.110404e-2, -0.1919402e-1, -0.18156897, -0.67278579, 0.15443144, 1.0];
        const b1_b = [-0.68245e-3, 0.325614e-2, -0.780353e-2, 0.1504268e-1, -0.3655620e-1, 0.23498619, 1.25331414];

        function bessel1(x: number): number {
            if (x <= 2) {
                return Math.log(x / 2) * besseli(x, 1) + (1 / x) * _horner(b1_a, x * x / 4);
            }

            return Math.exp(-x) / Math.sqrt(x) * _horner(b1_b, 2 / x);
        }

        return _bessel_wrap(bessel0, bessel1, 2, 1);
    })();
}

export function isValidBinaryNumber(number: string): boolean {
    return /^[01]{1,10}$/.test(number);
}

export function isValidOctalNumber(number: string): boolean {
    return /^[0-7]{1,10}$/.test(number);
}

export function isValidHexadecimalNumber(number: string): boolean {
    return /^[0-9A-Fa-f]{1,10}$/.test(number);
}
