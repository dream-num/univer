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

// Derived from numfmt 3.2.6 (MIT), commit c2cfdfa01bb1f24df51e985825671eb480daed4c.
// See packages/core/src/shared/numfmt/LICENSE.

export function getExponent(number: number, intMax: number = 0): number {
    const exponent = Math.floor(Math.log10(number));
    return intMax > 1
        ? Math.floor(exponent / intMax) * intMax
        : exponent;
}

export function getSignificand(number: number, exponent: number = 1): number {
    if (exponent < -300) {
        return Number.parseFloat(number.toExponential().split('e')[0]);
    }
    return number * (10 ** -exponent);
}
