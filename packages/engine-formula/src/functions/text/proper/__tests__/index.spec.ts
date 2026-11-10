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
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Proper } from '../index';

describe('Test proper function', () => {
    const testFunction = new Proper(FUNCTION_NAMES_TEXT.PROPER);

    describe('Proper', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('univer');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual('Univer');
        });

        it.each([
            ['hans müller-lüdenscheidt', 'Hans Müller-Lüdenscheidt'],
            ['müller', 'Müller'],
            ['mu\u0308ller', 'Mu\u0308Ller'],
            ['élise', 'Élise'],
            ['e\u0301lise', 'E\u0301Lise'],
            ['中文abc', '中文abc'],
            ['abc中文def', 'Abc中文def'],
            ['ü', 'Ü'],
            ['straße', 'Straße'],
            ['αβγ', 'Αβγ'],
            ['привет', 'Привет'],
            ['a1b', 'A1B'],
            ['2-way street', '2-Way Street'],
            ['o\'NEILL', 'O\'Neill'],
        ])('Uses Excel letter boundaries for %s', (input, expected) => {
            const result = testFunction.calculate(StringValueObject.create(input));
            expect(getObjectValue(result)).toStrictEqual(expected);
        });

        it('Capitalizes Unicode text in arrays', () => {
            const text = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['müller', 'élise'],
                    ['ü', '中文abc'],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual([
                ['Müller', 'Élise'],
                ['Ü', '中文abc'],
            ]);
        });

        it('Value is array', () => {
            const text = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 'this is a TITLE', true, false, null],
                    [0, '100', '2.34', '2-way street', -3, ErrorType.NAME],
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
                [1, ' ', 'This Is A Title', true, false, 0],
                [0, 100, 2.34, '2-Way Street', -3, ErrorType.NAME],
            ]);

            const text2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['76BudGet'],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(text2);
            expect(getObjectValue(result2)).toStrictEqual('76Budget');
        });
    });
});
