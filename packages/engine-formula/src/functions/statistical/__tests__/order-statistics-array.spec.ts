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

import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../../basics/error-type';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { getObjectValue } from '../../util';
import { FUNCTION_NAMES_STATISTICAL } from '../function-names';
import { Large } from '../large';
import { PercentileExc } from '../percentile-exc';
import { PercentileInc } from '../percentile-inc';
import { QuartileExc } from '../quartile-exc';
import { QuartileInc } from '../quartile-inc';
import { Small } from '../small';

describe('Order statistics with array-valued queries', () => {
    it.each([
        [FUNCTION_NAMES_STATISTICAL.LARGE, Large, [0, ErrorType.NA, 2.5, 1, 2.5, 6, 'bad'], [ErrorType.NUM, ErrorType.NA, 2, 9, 2, ErrorType.NUM, ErrorType.VALUE]],
        [FUNCTION_NAMES_STATISTICAL.SMALL, Small, [0, ErrorType.NA, 2.5, 1, 2.5, 6, 'bad'], [ErrorType.NUM, ErrorType.NA, 2, -4, 2, ErrorType.NUM, ErrorType.VALUE]],
        [FUNCTION_NAMES_STATISTICAL.PERCENTILE_INC, PercentileInc, [-0.1, ErrorType.NA, 0.5, 0, 1, 1.1, 'bad'], [ErrorType.NUM, ErrorType.NA, 2, -4, 9, ErrorType.NUM, ErrorType.VALUE]],
        [FUNCTION_NAMES_STATISTICAL.PERCENTILE_EXC, PercentileExc, [0.1, ErrorType.NA, 0.5, 0.25, 0.75, 0.9, 'bad'], [ErrorType.NUM, ErrorType.NA, 2, -1, 8.5, ErrorType.NUM, ErrorType.VALUE]],
        [FUNCTION_NAMES_STATISTICAL.QUARTILE_INC, QuartileInc, [-1, ErrorType.NA, 2, 0, 4, 5, 'bad'], [ErrorType.NUM, ErrorType.NA, 2, -4, 9, ErrorType.NUM, ErrorType.VALUE]],
        [FUNCTION_NAMES_STATISTICAL.QUARTILE_EXC, QuartileExc, [0, ErrorType.NA, 2, 1, 3, 4, 'bad'], [ErrorType.NUM, ErrorType.NA, 2, -1, 8.5, ErrorType.NUM, ErrorType.VALUE]],
    ] as const)('%s preserves mixed query results and recalculates each input independently', (name, FunctionClass, queries, expected) => {
        const testFunction = new FunctionClass(name);
        const source = [[9, null, 'ignored', -4], [2, true, 8, 2]];
        const queryArray = ArrayValueObject.createByArray([[...queries]]);

        for (const offset of [0, 100]) {
            const values = source.map((row) => row.map((value) => typeof value === 'number' ? value + offset : value));
            const array = ArrayValueObject.createByArray(values);
            const original = getObjectValue(array);
            const result = testFunction.calculate(array, queryArray);

            expect(getObjectValue(result)).toStrictEqual([expected.map((value) => typeof value === 'number' ? value + offset : value)]);
            expect(getObjectValue(array)).toStrictEqual(original);
            expect(getObjectValue(queryArray)).toStrictEqual([[...queries]]);
        }
    });
});
