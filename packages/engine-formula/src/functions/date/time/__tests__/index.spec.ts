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

import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Time } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { stripArrayValue } from '../../../__tests__/create-function-test-bed';

describe('Test time function', () => {
    const testFunction = new Time(FUNCTION_NAMES_DATE.TIME);

    describe('Time', () => {
        it('All value is normal', () => {
            const hour = NumberValueObject.create(13);
            const minute = NumberValueObject.create(30);
            const second = NumberValueObject.create(15);
            const result = testFunction.calculate(hour, minute, second);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[0.56267361111111114]]); // 13:30:15
        });

        it('All value is normal, include boolean and number string', () => {
            const hour = BooleanValueObject.create(true);
            const minute = BooleanValueObject.create(false);
            const second = StringValueObject.create('2');
            const result = testFunction.calculate(hour, minute, second);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[0.04168981481481481]]); // 13:30:15
        });

        it('Handling large values', () => {
            const hour = NumberValueObject.create(27); // 27 hours = 3 hours next day
            const minute = NumberValueObject.create(750); // 750 minutes = 12 hours, 30 minutes
            const second = NumberValueObject.create(3661); // 3661 seconds = 1 hour, 1 minute, 1 second
            const result = testFunction.calculate(hour, minute, second);
            expect(stripArrayValue(transformToValue(result.getArrayValue()))).toStrictEqual([[0.688206018519]]); // 16:31:01
        });

        it('Negative values', () => {
            const hour = NumberValueObject.create(-1);
            const minute = NumberValueObject.create(-50);
            const second = NumberValueObject.create(-70);
            const result = testFunction.calculate(hour, minute, second);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[ErrorType.NUM]]);
        });

        it('Array values with different types', () => {
            const hour = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[12, 24, -1, 'text']]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const minute = NumberValueObject.create(45);
            const second = NumberValueObject.create(30);
            const result = testFunction.calculate(hour, minute, second);
            expect(stripArrayValue(transformToValue(result.getArrayValue()))).toStrictEqual([[0.531597222222, 0.0315972222222, ErrorType.NUM, ErrorType.VALUE]]);
        });

        it('Handling leap values in hours, minutes, and seconds', () => {
            const hour = NumberValueObject.create(48); // 48 hours = 0 hours next two days
            const minute = NumberValueObject.create(1439); // 1439 minutes = 23 hours, 59 minutes
            const second = NumberValueObject.create(86400); // 86400 seconds = 24 hours = 0 seconds next day
            const result = testFunction.calculate(hour, minute, second);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[ErrorType.NUM]]); // 23:59:00
        });

        it('Year, Month, Day are arrays with various valid and invalid types', () => {
            const hour = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.VALUE],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const minute = NumberValueObject.create(59);
            const second = NumberValueObject.create(59);
            const result = testFunction.calculate(hour, minute, second);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[0.08332175925925926, ErrorType.VALUE, 0.08332175925925926, 0.08332175925925926, 0.04165509259259259, 0.04165509259259259], [0.04165509259259259, 0.20832175925925925, 0.12498842592592592, ErrorType.VALUE, ErrorType.NUM, ErrorType.VALUE]]);
        });
    });
});
