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

import type { NumberDigits } from './types';
import { decimalFromNumber } from './decimal';

const ZERO_DIGITS: NumberDigits = {
    total: 1,
    sign: 0,
    period: 0,
    int: 1,
    frac: 0,
};

// returns the count of digits (including - and .) need to represent the number
export function numDec(value: number, includeSign = true): NumberDigits {
    const decimal = decimalFromNumber(value);
    if (decimal.digits === '0') {
        return ZERO_DIGITS;
    }

    const decimalPoint = decimal.exponent + 1;
    const intSize = Math.max(decimalPoint, 1);
    const fracSize = Math.max(0, decimal.digits.length - decimalPoint);
    const signSize = includeSign && decimal.negative ? 1 : 0;
    const periodSize = fracSize > 0 ? 1 : 0;

    return {
        total: signSize + intSize + periodSize + fracSize,
        digits: Math.max(decimalPoint, 0) + fracSize,
        sign: signSize,
        period: periodSize,
        int: intSize,
        frac: fracSize,
    };
}
