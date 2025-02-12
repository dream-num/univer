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
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Bahttext } from '../index';

describe('Test bahttext function', () => {
    const testFunction = new Bahttext(FUNCTION_NAMES_TEXT.BAHTTEXT);

    describe('Bahttext', () => {
        it('Value is normal', () => {
            const number = NumberValueObject.create(123.45);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual('หนึ่งร้อยยี่สิบสามบาทสี่สิบห้าสตางค์');
        });

        it('Number is negative', () => {
            const number = NumberValueObject.create(-2.34);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual('ลบสองบาทสามสิบสี่สตางค์');
        });

        it('Value is array', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual([
                ['หนึ่งบาทถ้วน', ErrorType.VALUE, 'หนึ่งบาทยี่สิบสามสตางค์', 'หนึ่งบาทถ้วน', 'ศูนย์บาทถ้วน', 'ศูนย์บาทถ้วน'],
                ['ศูนย์บาทถ้วน', 'หนึ่งร้อยบาทถ้วน', 'สองบาทสามสิบสี่สตางค์', ErrorType.VALUE, 'ลบสามบาทถ้วน', ErrorType.NAME],
            ]);

            const number2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1234567890],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(number2);
            expect(getObjectValue(result2)).toStrictEqual('หนึ่งพันสองร้อยสามสิบสี่ล้านห้าแสนหกหมื่นเจ็ดพันแปดร้อยเก้าสิบบาทถ้วน');
        });

        it('More test', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.123, 1111111],
                    [10000000, 11],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual([
                ['สิบสองสตางค์', 'หนึ่งล้านหนึ่งแสนหนึ่งหมื่นหนึ่งพันหนึ่งร้อยสิบเอ็ดบาทถ้วน'],
                ['สิบล้านบาทถ้วน', 'สิบเอ็ดบาทถ้วน'],
            ]);
        });
    });
});
