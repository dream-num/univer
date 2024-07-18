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

import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Textafter } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test textafter function', () => {
    const testFunction = new Textafter(FUNCTION_NAMES_TEXT.TEXTAFTER);

    describe('Textafter', () => {
        it('value is normal', () => {
            const text = StringValueObject.create('***TRUETRUEFALSE');
            const delimiter = StringValueObject.create('T');
            const result = testFunction.calculate(text, delimiter);
            expect(result.getValue()).toBe('RUETRUEFALSE');
        });

        it('delimiter value is empty string', () => {
            const text = StringValueObject.create('***TRUETRUEFALSE');
            const delimiter = StringValueObject.create('');
            const instanceNum = NumberValueObject.create(1);
            const result = testFunction.calculate(text, delimiter, instanceNum);
            expect(result.getValue()).toBe('***TRUETRUEFALSE');

            const instanceNum2 = NumberValueObject.create(-1);
            const result2 = testFunction.calculate(text, delimiter, instanceNum2);
            expect(result2.getValue()).toBe('');
        });

        it('instanceNum value test', () => {
            const text = StringValueObject.create('***TRUETRUEFALSE');
            const delimiter = StringValueObject.create('T');
            const instanceNum = NumberValueObject.create(1);
            const result = testFunction.calculate(text, delimiter, instanceNum);
            expect(result.getValue()).toBe('RUETRUEFALSE');

            const instanceNum2 = NumberValueObject.create(2);
            const result2 = testFunction.calculate(text, delimiter, instanceNum2);
            expect(result2.getValue()).toBe('RUEFALSE');

            const instanceNum3 = NumberValueObject.create(3);
            const result3 = testFunction.calculate(text, delimiter, instanceNum3);
            expect(result3.getValue()).toBe(ErrorType.NA);

            const instanceNum4 = NumberValueObject.create(17);
            const result4 = testFunction.calculate(text, delimiter, instanceNum4);
            expect(result4.getValue()).toBe(ErrorType.VALUE);
        });

        it('matchMode value 0 or 1', () => {
            const text = StringValueObject.create('***TRUETRUEFALSE');
            const delimiter = StringValueObject.create('t');
            const instanceNum = NumberValueObject.create(1);
            const matchMode = NumberValueObject.create(-1);
            const result = testFunction.calculate(text, delimiter, instanceNum, matchMode);
            expect(result.getValue()).toBe(ErrorType.VALUE);

            const matchMode2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(text, delimiter, instanceNum, matchMode2);
            expect(result2.getValue()).toBe(ErrorType.NA);

            const matchMode3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(text, delimiter, instanceNum, matchMode3);
            expect(result3.getValue()).toBe('RUETRUEFALSE');
        });

        it('matchEnd value 0 or 1', () => {
            const text = StringValueObject.create('***TRUETRUEFALSE');
            const delimiter = StringValueObject.create('t');
            const instanceNum = NumberValueObject.create(3);
            const matchMode = NumberValueObject.create(1);
            const matchEnd = NumberValueObject.create(0);
            const result = testFunction.calculate(text, delimiter, instanceNum, matchMode, matchEnd);
            expect(result.getValue()).toBe(ErrorType.NA);

            const matchEnd2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(text, delimiter, instanceNum, matchMode, matchEnd2);
            expect(result2.getValue()).toBe('');

            const instanceNum3 = NumberValueObject.create(-3);
            const result3 = testFunction.calculate(text, delimiter, instanceNum3, matchMode, matchEnd2);
            expect(result3.getValue()).toBe('***TRUETRUEFALSE');
        });

        it('ifNotFound value test', () => {
            const text = StringValueObject.create('***TRUETRUEFALSE');
            const delimiter = StringValueObject.create('t');
            const instanceNum = NumberValueObject.create(3);
            const matchMode = NumberValueObject.create(1);
            const matchEnd = NumberValueObject.create(0);
            const ifNotFound = StringValueObject.create('not found');
            const result = testFunction.calculate(text, delimiter, instanceNum, matchMode, matchEnd, ifNotFound);
            expect(result.getValue()).toBe('not found');
        });

        it('Value is array', () => {
            const text = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1, true, false, null, '***TRUETRUEFALSE'],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const delimiter = StringValueObject.create('t');
            const instanceNum = NumberValueObject.create(1);
            const matchMode = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [0],
                    [1],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            }); ;
            const matchEnd = NumberValueObject.create(0);
            const ifNotFound = StringValueObject.create('not found');
            const result = testFunction.calculate(text, delimiter, instanceNum, matchMode, matchEnd, ifNotFound);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['not found', 'not found', 'not found', ErrorType.VALUE, 'not found'],
                ['not found', 'RUE', 'not found', ErrorType.VALUE, 'RUETRUEFALSE'],
            ]);
        });
    });
});
