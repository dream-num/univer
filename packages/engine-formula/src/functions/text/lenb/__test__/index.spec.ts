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
import { Lenb } from '../index';
import { StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test lenb function', () => {
    const textFunction = new Lenb(FUNCTION_NAMES_TEXT.LENB);

    describe('Lenb', () => {
        it('Text is single cell', () => {
            const text = StringValueObject.create('Univer');
            const result = textFunction.calculate(text);
            expect(result.getValue()).toStrictEqual(6);
        });

        it('Text1 is array', () => {
            const text = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null, 'Univer表格シート繁體한국인'],
                    [0, '100', '2.34', 'test', -3, ErrorType.VALUE, null],
                ]),
                rowCount: 2,
                columnCount: 7,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(text);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [1, 1, 4, 4, 5, 0, 26],
                [1, 3, 4, 4, 2, '#VALUE!', 0],
            ]);
        });

        it('Text1 is array with emoji', () => {
            const text = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    ['u'],
                    [1],
                    ['ß'],
                    ['é'],
                    ['ع'],
                    ['汉'],
                    ['漢'],
                    ['😊'],
                    ['𐌸'],
                    ['👨‍👩‍👧'],
                    ['𓀀'],
                    ['𐌰'],
                    ['♚'],
                ]),
                rowCount: 13,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = textFunction.calculate(text);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[1], [1], [1], [1], [1], [2], [2], [2], [2], [8], [2], [2], [1]]);
        });
    });
});
