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
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { functionMath } from '../../function-map';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { IsoCeiling } from '../index';

describe('Test iso.ceiling function', () => {
    const testFunction = new IsoCeiling(FUNCTION_NAMES_MATH.ISO_CEILING);

    it('is registered, so ISO.CEILING does not evaluate to #NAME?', () => {
        expect(functionMath).toContainEqual([IsoCeiling, FUNCTION_NAMES_MATH.ISO_CEILING]);
    });

    it('rounds up whatever the signs of the number and the significance', () => {
        // Microsoft's ISO.CEILING examples.
        const cases: [number, number | undefined, number][] = [
            [4.3, undefined, 5],
            [-4.3, undefined, -4],
            [4.3, 2, 6],
            [4.3, -2, 6],
            [-4.3, 2, -4],
            [-4.3, -2, -4],
        ];
        for (const [number, significance, expected] of cases) {
            const result = testFunction.calculate(
                NumberValueObject.create(number),
                significance === undefined ? undefined : NumberValueObject.create(significance)
            );
            expect(result.getValue()).toBe(expected);
        }
    });

    it('returns 0 when the number or the significance is 0', () => {
        expect(testFunction.calculate(NumberValueObject.create(0), NumberValueObject.create(2)).getValue()).toBe(0);
        expect(testFunction.calculate(NumberValueObject.create(4.3), NumberValueObject.create(0)).getValue()).toBe(0);
    });

    it('reads numeric text and reports text that is not a number or an error argument', () => {
        expect(testFunction.calculate(StringValueObject.create('4.3'), NumberValueObject.create(2)).getValue()).toBe(6);
        expect(testFunction.calculate(StringValueObject.create('test'), NumberValueObject.create(2)).getValue()).toBe(ErrorType.VALUE);
        expect(testFunction.calculate(ErrorValueObject.create(ErrorType.NAME), NumberValueObject.create(2)).getValue()).toBe(ErrorType.NAME);
    });
});
