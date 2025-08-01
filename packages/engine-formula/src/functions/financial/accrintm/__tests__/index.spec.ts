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
import { Accrintm } from '../index';

describe('Test accrintm function', () => {
    const testFunction = new Accrintm(FUNCTION_NAMES_FINANCIAL.ACCRINTM);

    describe('Accrintm', () => {
        it('value is normal', () => {
            const issue = StringValueObject.create('2012/2/2');
            const settlement = StringValueObject.create('2021/3/11');
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);

            let result = testFunction.calculate(issue, settlement, rate, par);
            expect(getObjectValue(result, true)).toBe(910.833333333333);

            const basis = NumberValueObject.create(1);
            result = testFunction.calculate(issue, settlement, rate, par, basis);
            expect(getObjectValue(result, true)).toBe(910.210785655626);
        });

        it('value is normal, settlement <= issue', () => {
            const issue = StringValueObject.create('2021/3/11');
            const settlement = StringValueObject.create('2012/2/2');
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);
            const result = testFunction.calculate(issue, settlement, rate, par);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const issue2 = StringValueObject.create('2012/2/2');
            const settlement2 = StringValueObject.create('2012/2/2');
            const result2 = testFunction.calculate(issue2, settlement2, rate, par);
            expect(getObjectValue(result2)).toBe(0);
        });

        it('value is error', () => {
            const issue = NumberValueObject.create(1);
            const settlement = ErrorValueObject.create(ErrorType.NAME);
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);
            const result = testFunction.calculate(issue, settlement, rate, par);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('value is boolean', () => {
            const issue = BooleanValueObject.create(false);
            const settlement = NumberValueObject.create(43832.233);
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);

            let result = testFunction.calculate(issue, settlement, rate, par);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const basis = BooleanValueObject.create(true);
            result = testFunction.calculate(issue, settlement, rate, par, basis);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('value is normal string', () => {
            const issue = StringValueObject.create('test');
            const settlement = StringValueObject.create('2021-12-31');
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);
            const result = testFunction.calculate(issue, settlement, rate, par);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const issue2 = StringValueObject.create('2012/2/2');
            const settlement2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(issue2, settlement2, rate, par);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);

            const rate2 = StringValueObject.create('test');
            const result3 = testFunction.calculate(issue2, settlement, rate2, par);
            expect(getObjectValue(result3)).toBe(ErrorType.VALUE);
        });

        it('rate or par value less than or equal to 0', () => {
            const issue = StringValueObject.create('2012/2/2');
            const settlement = StringValueObject.create('2021/3/11');
            const rate = NumberValueObject.create(0);
            const par = NumberValueObject.create(1000);
            const result = testFunction.calculate(issue, settlement, rate, par);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const rate2 = NumberValueObject.create(0.1);
            const par2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(issue, settlement, rate2, par2);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('basis value less than 0 or greater than 4', () => {
            const issue = StringValueObject.create('2012/2/2');
            const settlement = StringValueObject.create('2021/3/11');
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);
            const basis = NumberValueObject.create(-1);
            const result = testFunction.calculate(issue, settlement, rate, par, basis);
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
            const settlement = StringValueObject.create('2021-12-31');
            const rate = NumberValueObject.create(0.1);
            const par = NumberValueObject.create(1000);
            const result = testFunction.calculate(issue, settlement, rate, par);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });
    });
});
