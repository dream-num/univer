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
import { StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Unicode } from '../index';

describe('Test unicode function', () => {
    const testFunction = new Unicode(FUNCTION_NAMES_TEXT.UNICODE);

    describe('Unicode', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('A');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual(65);
        });

        it('Value is array', () => {
            const text = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', '中文', true, false, null],
                    [0, 'ABC', '!', 'ÿ', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual([
                [49, 32, 20013, 84, 70, ErrorType.VALUE],
                [48, 65, 33, 255, 45, ErrorType.NAME],
            ]);

            const text2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['หนึ่งบาทถ้วน'],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(text2);
            expect(getObjectValue(result2)).toStrictEqual(3627);
        });
    });
});
