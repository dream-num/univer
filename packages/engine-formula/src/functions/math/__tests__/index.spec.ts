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
import { Acoth } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test acoth function', () => {
    const acothFunction = new Acoth(FUNCTION_NAMES_MATH.ACOTH);

    describe('Acoth', () => {
        it('should return 0.5493061443340549 for acoth(2)', () => {
            const value = NumberValueObject.create(2);
            const result = acothFunction.calculate(value);
            expect(result.getValue()).toBeCloseTo(0.5493061443340549);
        });

        it('should return 0.5493061443340549 for acoth("2")', () => {
            const value = new StringValueObject('2');
            const result = acothFunction.calculate(value);
            expect(result.getValue()).toBeCloseTo(0.5493061443340549);
        });

        it('should return #VALUE! error for acoth(1)', () => {
            const value = NumberValueObject.create(1);
            const result = acothFunction.calculate(value);
            expect(result).toBeInstanceOf(ErrorValueObject);
            expect(result.getErrorType()).toBe(ErrorType.VALUE);
        });

        it('should return #VALUE! error for acoth(-1)', () => {
            const value = NumberValueObject.create(-1);
            const result = acothFunction.calculate(value);
            expect(result).toBeInstanceOf(ErrorValueObject);
            expect(result.getErrorType()).toBe(ErrorType.VALUE);
        });

        it('should return #VALUE! error for acoth(0)', () => {
            const value = NumberValueObject.create(0);
            const result = acothFunction.calculate(value);
            expect(result).toBeInstanceOf(ErrorValueObject);
            expect(result.getErrorType()).toBe(ErrorType.VALUE);
        });
    });
});
