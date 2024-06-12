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

import { describe, expect, it } from 'vitest';

import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Cos } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test cos function', () => {
    const cosFunction = new Cos(FUNCTION_NAMES_MATH.COS);

    describe('Cos', () => {
        it('should return 1 for cos(0)', () => {
            const value = NumberValueObject.create(0);
            const result = cosFunction.calculate(value);
            expect(result.getValue()).toBe(1);
        });

        it('should return 0.5403023058681398 for cos(1)', () => {
            const value = NumberValueObject.create(1);
            const result = cosFunction.calculate(value);
            expect(result.getValue()).toBeCloseTo(0.5403023058681398); // Approximately 0.5403023058681398
        });

        it('should return #VALUE! error for non-numeric strings', () => {
            const value = new StringValueObject('test');
            const result = cosFunction.calculate(value);
            expect(result).toBeInstanceOf(ErrorValueObject);
            expect(result.getErrorType()).toBe(ErrorType.VALUE);
        });

        it('should return #VALUE! error for NaN inputs', () => {
            const value = NumberValueObject.create(NaN);
            const result = cosFunction.calculate(value);
            expect(result).toBeInstanceOf(ErrorValueObject);
            expect(result.getErrorType()).toBe(ErrorType.VALUE);
        });

        it('should return #VALUE! error for Infinity inputs', () => {
            const value = NumberValueObject.create(Infinity);
            const result = cosFunction.calculate(value);
            expect(result).toBeInstanceOf(ErrorValueObject);
            expect(result.getErrorType()).toBe(ErrorType.VALUE);
        });
    });
});
