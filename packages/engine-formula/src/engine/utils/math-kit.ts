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

import Big from 'big.js';

/**
 * Packaging basic mathematical calculation methods, adding precision parameters and solving native JavaScript precision problems
 */

/**
 * Native JavaScript: 0.6789 * 10000 = 6788.999999999999
 *
 * @param a
 * @param b
 * @returns
 */
export function multiply(a: number, b: number): number {
    return Big(a).times(b).toNumber();
}

export function round(base: number, precision: number): number {
    const factor = 10 ** Math.floor(precision);
    return Math.round(multiply(base, factor)) / factor;
}

export function floor(base: number, precision: number): number {
    const factor = 10 ** Math.floor(precision);
    return Math.floor(multiply(base, factor)) / factor;
}

export function ceil(base: number, precision: number): number {
    const factor = 10 ** Math.floor(precision);
    return Math.ceil(multiply(base, factor)) / factor;
}

export function pow(base: number, exponent: number): number {
    return base ** exponent;
}
