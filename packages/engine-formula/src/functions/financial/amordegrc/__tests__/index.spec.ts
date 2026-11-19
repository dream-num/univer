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
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Amordegrc } from '../index';

describe('Test amordegrc function', () => {
    const testFunction = new Amordegrc(FUNCTION_NAMES_FINANCIAL.AMORDEGRC);

    const amordegrc = (overrides: {
        cost?: number | string;
        datePurchased?: string;
        firstPeriod?: string;
        salvage?: number;
        period?: number;
        rate?: number;
        basis?: number;
    } = {}) => {
        const { cost = 2400, datePurchased = '2008/8/19', firstPeriod = '2008/12/31', salvage = 300, period = 1, rate = 0.15, basis = 1 } = overrides;

        return getObjectValue(testFunction.calculate(
            typeof cost === 'number' ? NumberValueObject.create(cost) : StringValueObject.create(cost),
            StringValueObject.create(datePurchased),
            StringValueObject.create(firstPeriod),
            NumberValueObject.create(salvage),
            NumberValueObject.create(period),
            NumberValueObject.create(rate),
            NumberValueObject.create(basis)
        ));
    };

    describe('Amordegrc', () => {
        it('Value is normal', () => {
            // The example of the Excel documentation.
            expect(amordegrc()).toBe(776);
        });

        it('Basis is omitted', () => {
            const result = testFunction.calculate(
                NumberValueObject.create(2400),
                StringValueObject.create('2008/8/19'),
                StringValueObject.create('2008/12/31'),
                NumberValueObject.create(300),
                NumberValueObject.create(1),
                NumberValueObject.create(0.15)
            );
            expect(getObjectValue(result)).toBe(776);
        });

        // Expected values below are Excel's, as reported in review of this function.
        it('Depreciates period by period until the salvage value is reached', () => {
            // Period 0 is prorated from the purchase date. The period before the last one of the
            // asset's life takes half of the book value and the last one what is left above the salvage value.
            const periods = [0, 1, 2, 3, 4, 5, 6, 7];
            expect(periods.map((period) => amordegrc({ period }))).toStrictEqual([330, 776, 485, 303, 190, 158, 0, 0]);
            expect(periods.map((period) => amordegrc({ period, salvage: 0 }))).toStrictEqual([330, 776, 485, 303, 190, 158, 158, 0]);
        });

        it('Returns 0 for a period that starts below the salvage value', () => {
            const capped = { cost: 9940.54, datePurchased: '2019/3/31', firstPeriod: '2020/3/30', salvage: 4677, rate: 0.441321, basis: 0 };
            expect(amordegrc({ ...capped, period: 0 })).toBe(5264);
            expect(amordegrc({ ...capped, period: 1 })).toBe(0);
            expect(amordegrc({ salvage: 2400, period: 0 })).toBe(0);
        });

        it('Still depreciates a period that starts at the salvage value', () => {
            // Period 0 is capped at cost - salvage, which leaves the book value at exactly 10. Excel's own result.
            const atSalvage = { cost: 100, datePurchased: '1998/2/28', firstPeriod: '2000/2/29', salvage: 10, rate: 0.3 };
            expect(amordegrc({ ...atSalvage, period: 0 })).toBe(90);
            expect(amordegrc({ ...atSalvage, period: 1 })).toBe(5);
        });

        it('Picks the coefficient from the life of the asset', () => {
            // 1 / rate is the life: (2, 4] years 1.5, (4, 6] years 2, and 2.5 beyond.
            expect(amordegrc({ rate: 0.3 })).toBe(902);
            expect(amordegrc({ rate: 0.25 })).toBe(776);
            expect(amordegrc({ rate: 0.24 })).toBe(949);
            expect(amordegrc({ rate: 0.2222 })).toBe(893);
            expect(amordegrc({ rate: 0.21 })).toBe(853);
            expect(amordegrc({ rate: 0.1 })).toBe(545);
        });

        it('Returns #NUM! for a life of two years or less', () => {
            expect(amordegrc({ rate: 0.49 })).not.toBe(ErrorType.NUM);
            expect(amordegrc({ rate: 0.5 })).toBe(ErrorType.NUM);
            expect(amordegrc({ cost: 10000, datePurchased: '2023/1/1', firstPeriod: '2023/12/31', salvage: 0, rate: 1.5 })).toBe(ErrorType.NUM);
        });

        it('Purchased on the first period date', () => {
            // The first period then counts as a whole period.
            expect(amordegrc({ datePurchased: '2020/5/15', firstPeriod: '2020/5/15', period: 0 })).toBe(900);
            expect(amordegrc({ datePurchased: '2020/5/15', firstPeriod: '2020/5/15', period: 1 })).toBe(563);
        });

        it('Counts 28 and 29 February of a leap year as 28 February', () => {
            expect(amordegrc({ datePurchased: '2024/2/29', firstPeriod: '2024/12/31', basis: 1 })).toBe(617);
        });

        it('Counts the end of February as day 30 under basis 0', () => {
            const endOfFebruary = { cost: 100, datePurchased: '1998/2/28', firstPeriod: '1999/2/28', salvage: 10, basis: 0 };
            expect(amordegrc({ ...endOfFebruary, period: 0 })).toBe(38);
            expect(amordegrc({ ...endOfFebruary, period: 1 })).toBe(23);
        });

        it('Rounds at Excel\'s 15 significant digits', () => {
            expect(amordegrc({ rate: 0.333333333333333 })).toBe(980);
        });

        it('Returns 0 quickly when a tiny rate rounds every period to 0', () => {
            expect(amordegrc({ rate: 1e-9, period: 1e6 })).toBe(0);
        });

        it('Cost is normal string', () => {
            expect(amordegrc({ cost: 'test' })).toBe(ErrorType.VALUE);
            expect(amordegrc({ datePurchased: 'test' })).toBe(ErrorType.VALUE);
            expect(amordegrc({ firstPeriod: 'test' })).toBe(ErrorType.VALUE);
        });

        it('Cost <= 0 or salvage < 0 or cost < salvage', () => {
            expect(amordegrc({ cost: 0 })).toBe(ErrorType.NUM);
            expect(amordegrc({ salvage: -1 })).toBe(ErrorType.NUM);
            expect(amordegrc({ cost: 100, salvage: 200 })).toBe(ErrorType.NUM);
        });

        it('DatePurchased > firstPeriod', () => {
            expect(amordegrc({ datePurchased: '2008/12/31', firstPeriod: '2008/8/19' })).toBe(ErrorType.NUM);
        });

        it('Period < 0 or period is not an integer', () => {
            expect(amordegrc({ period: -1 })).toBe(ErrorType.NUM);

            // Between 0 and 1 Excel returns 0, above 1 it uses the whole number of periods.
            expect(amordegrc({ period: 0.5 })).toBe(0);
            expect(amordegrc({ period: 1.9 })).toBe(776);
            expect(amordegrc({ period: 2.9 })).toBe(485);
        });

        it('Rate <= 0', () => {
            expect(amordegrc({ rate: 0 })).toBe(ErrorType.NUM);
            expect(amordegrc({ rate: -0.15 })).toBe(ErrorType.NUM);
        });

        it('Basis value is 0|1|3|4', () => {
            expect(amordegrc({ period: 0, basis: 2 })).toBe(ErrorType.NUM);
            expect(amordegrc({ period: 0, basis: 0 })).toBe(330);
            expect(amordegrc({ period: 0, basis: 1 })).toBe(330);
            expect(amordegrc({ period: 0, basis: 3 })).toBe(330);
            expect(amordegrc({ period: 0, basis: 4 })).toBe(328);
            expect(amordegrc({ period: 1, basis: 4 })).toBe(777);
        });

        it('Value is array', () => {
            const cost = ArrayValueObject.create({
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
            const result = testFunction.calculate(
                cost,
                StringValueObject.create('2008/8/19'),
                StringValueObject.create('2008/12/31'),
                NumberValueObject.create(300),
                NumberValueObject.create(1),
                NumberValueObject.create(0.15),
                NumberValueObject.create(1)
            );
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });
    });
});
