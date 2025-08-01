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
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Accrint } from '../index';

describe('Test accrint function', () => {
    const testFunction = new Accrint(FUNCTION_NAMES_FINANCIAL.ACCRINT);

    describe('Accrint', () => {
        it('value is normal', () => {
            const issue = StringValueObject.create('2008/2/29');
            const firstInterest = StringValueObject.create('2008/8/31');
            const settlement = StringValueObject.create('2008/5/1');
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);
            const frequency = NumberValueObject.create(2);

            let result = testFunction.calculate(issue, firstInterest, settlement, rate, par, frequency);
            expect(getObjectValue(result, true)).toBe(16.9444444444);

            const basis = NumberValueObject.create(1);
            result = testFunction.calculate(issue, firstInterest, settlement, rate, par, frequency, basis);
            expect(getObjectValue(result, true)).toBe(16.847826087);
        });

        it('value is normal, endDate < startDate', () => {
            const issue = StringValueObject.create('2008/5/1');
            const firstInterest = StringValueObject.create('2008/8/31');
            const settlement = StringValueObject.create('2008/2/29');
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);
            const frequency = NumberValueObject.create(2);
            const result = testFunction.calculate(issue, firstInterest, settlement, rate, par, frequency);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Issue firstInterest settlement test', () => {
            const issue = StringValueObject.create('1900/1/29');
            const firstInterest = StringValueObject.create('2008/8/31');
            const settlement = StringValueObject.create('2008/5/1');
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);
            const frequency = NumberValueObject.create(2);
            const result = testFunction.calculate(issue, firstInterest, settlement, rate, par, frequency);
            expect(getObjectValue(result)).toBe(0);

            const issue2 = StringValueObject.create('2008/2/29');
            const settlement2 = StringValueObject.create('2008/11/1');
            const result2 = testFunction.calculate(issue2, firstInterest, settlement2, rate, par, frequency);
            expect(getObjectValue(result2, true)).toBe(66.9444444444);

            const basis = NumberValueObject.create(3);
            const result3 = testFunction.calculate(issue2, firstInterest, settlement2, rate, par, frequency, basis);
            expect(getObjectValue(result3, true)).toBe(67.9452054795);

            const basis2 = NumberValueObject.create(1);
            const result4 = testFunction.calculate(issue2, firstInterest, settlement2, rate, par, frequency, basis2);
            expect(getObjectValue(result4, true)).toBe(68.2065217391);
        });

        it('value is error', () => {
            const issue = NumberValueObject.create(1);
            const firstInterest = StringValueObject.create('2008/8/31');
            const settlement = ErrorValueObject.create(ErrorType.NAME);
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);
            const frequency = NumberValueObject.create(2);
            const result = testFunction.calculate(issue, firstInterest, settlement, rate, par, frequency);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('value is boolean', () => {
            const issue = BooleanValueObject.create(false);
            const firstInterest = StringValueObject.create('2008/8/31');
            const settlement = NumberValueObject.create(43832.233);
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);
            const frequency = NumberValueObject.create(2);

            let result = testFunction.calculate(issue, firstInterest, settlement, rate, par, frequency);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const basis = BooleanValueObject.create(true);
            result = testFunction.calculate(issue, firstInterest, settlement, rate, par, frequency, basis);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('value is normal string', () => {
            const issue = StringValueObject.create('test');
            const firstInterest = StringValueObject.create('2008/8/31');
            const settlement = StringValueObject.create('2008/5/1');
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);
            const frequency = NumberValueObject.create(2);
            const result = testFunction.calculate(issue, firstInterest, settlement, rate, par, frequency);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const issue2 = StringValueObject.create('2008/2/29');
            const firstInterest2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(issue2, firstInterest2, settlement, rate, par, frequency);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);

            const settlement2 = StringValueObject.create('test');
            const result3 = testFunction.calculate(issue2, firstInterest, settlement2, rate, par, frequency);
            expect(getObjectValue(result3)).toBe(ErrorType.VALUE);

            const rate2 = StringValueObject.create('test');
            const result4 = testFunction.calculate(issue2, firstInterest, settlement, rate2, par, frequency);
            expect(getObjectValue(result4)).toBe(ErrorType.VALUE);
        });

        it('rate or par value less than or equal to 0', () => {
            const issue = StringValueObject.create('2008/2/29');
            const firstInterest = StringValueObject.create('2008/8/31');
            const settlement = StringValueObject.create('2008/5/1');
            const rate = NumberValueObject.create(0);
            const par = NumberValueObject.create(1000);
            const frequency = NumberValueObject.create(2);
            const result = testFunction.calculate(issue, firstInterest, settlement, rate, par, frequency);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const rate2 = NumberValueObject.create(0.1);
            const par2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(issue, firstInterest, settlement, rate2, par2, frequency);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('basis value less than 0 or greater than 4', () => {
            const issue = StringValueObject.create('2008/2/29');
            const firstInterest = StringValueObject.create('2008/8/31');
            const settlement = StringValueObject.create('2008/5/1');
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);
            const frequency = NumberValueObject.create(2);
            const basis = NumberValueObject.create(-1);
            const result = testFunction.calculate(issue, firstInterest, settlement, rate, par, frequency, basis);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('value is array', () => {
            const issue = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2012-3-29', 'test', true, false, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const firstInterest = StringValueObject.create('2008/8/31');
            const settlement = StringValueObject.create('2008/5/1');
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);
            const frequency = NumberValueObject.create(2);
            const result = testFunction.calculate(issue, firstInterest, settlement, rate, par, frequency);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });
    });
});
