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
import { Atan2 } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
 
describe('Test atan2 function', () => {
    const atan2Function = new Atan2(FUNCTION_NAMES_MATH.ATAN2);

    describe('Atan2', () => {
        it('should return 0 for atan2(0, 1)', () => {
            const value1 = NumberValueObject.create(0);
            const value2 = NumberValueObject.create(1);
            const result = atan2Function.calculate(value1, value2);
            expect(result.getValue()).toBe(0);
        });

        it('should return 0.7853981633974483 for atan2(1, 1)', () => {
            const value1 = NumberValueObject.create(1);
            const value2 = NumberValueObject.create(1);
            const result = atan2Function.calculate(value1, value2);
            expect(result.getValue()).toBeCloseTo(0.7853981633974483); // π/4
        });

        it('should return -0.7853981633974483 for atan2(-1, 1)', () => {
            const value1 = NumberValueObject.create(-1);
            const value2 = NumberValueObject.create(1);
            const result = atan2Function.calculate(value1, value2);
            expect(result.getValue()).toBeCloseTo(-0.7853981633974483); // -π/4
        });

        it('should return 0 for atan2("0", "1")', () => {
            const value1 = new StringValueObject('0');
            const value2 = new StringValueObject('1');
            const result = atan2Function.calculate(value1, value2);
            expect(result.getValue()).toBe(0);
        });

        it('should return 0.7853981633974483 for atan2("1", "1")', () => {
            const value1 = new StringValueObject('1');
            const value2 = new StringValueObject('1');
            const result = atan2Function.calculate(value1, value2);
            expect(result.getValue()).toBeCloseTo(0.7853981633974483); // π/4
        });

        it('should return -0.7853981633974483 for atan2("-1", "1")', () => {
            const value1 = new StringValueObject('-1');
            const value2 = new StringValueObject('1');
            const result = atan2Function.calculate(value1, value2);
            expect(result.getValue()).toBeCloseTo(-0.7853981633974483); // -π/4
        });

        it('should return #VALUE! error for non-numeric strings', () => {
            const value1 = new StringValueObject('test');
            const value2 = new StringValueObject('test');
            const result = atan2Function.calculate(value1, value2);
            expect(result).toBeInstanceOf(ErrorValueObject);
            expect(result.getErrorType()).toBe(ErrorType.VALUE);
        });

        it('should return #VALUE! error for NaN inputs', () => {
            const value1 = NumberValueObject.create(NaN);
            const value2 = NumberValueObject.create(NaN);
            const result = atan2Function.calculate(value1, value2);
            expect(result).toBeInstanceOf(ErrorValueObject);
            expect(result.getErrorType()).toBe(ErrorType.VALUE);
        });

        it('should return #VALUE! error for Infinity inputs', () => {
            const value1 = NumberValueObject.create(Infinity);
            const value2 = NumberValueObject.create(Infinity);
            const result = atan2Function.calculate(value1, value2);
            expect(result).toBeInstanceOf(ErrorValueObject);
            expect(result.getErrorType()).toBe(ErrorType.VALUE);
        });
    });
});
