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
import { Textsplit } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test textsplit function', () => {
    const testFunction = new Textsplit(FUNCTION_NAMES_TEXT.TEXTSPLIT);

    describe('Textsplit', () => {
        it('value is normal', () => {
            const text = StringValueObject.create('Dakota Lennon Sanchez');
            const colDelimiter = StringValueObject.create(' ');
            const result = testFunction.calculate(text, colDelimiter);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['Dakota', 'Lennon', 'Sanchez'],
            ]);

            const text2 = StringValueObject.create('1,2,3;4,5,6');
            const colDelimiter2 = StringValueObject.create(',');
            const rowDelimiter2 = StringValueObject.create(';');
            const result2 = testFunction.calculate(text2, colDelimiter2, rowDelimiter2);
            expect(transformToValue(result2.getArrayValue())).toStrictEqual([
                [1, 2, 3],
                [4, 5, 6],
            ]);
        });

        it('delimiter value is empty string', () => {
            const text = StringValueObject.create('To be or not to be');
            const colDelimiter = StringValueObject.create('');
            const result = testFunction.calculate(text, colDelimiter);
            expect(result.getValue()).toBe(ErrorType.VALUE);

            const colDelimiter2 = StringValueObject.create(' ');
            const rowDelimiter2 = StringValueObject.create('');
            const result2 = testFunction.calculate(text, colDelimiter2, rowDelimiter2);
            expect(result2.getValue()).toBe(ErrorType.VALUE);
        });

        it('ignoreEmpty value is true', () => {
            const text = StringValueObject.create('Do. Or do not. There is no try. -Anonymous');
            const colDelimiter = StringValueObject.create(' ');
            const rowDelimiter = StringValueObject.create('.');
            const ignoreEmpty = BooleanValueObject.create(true);
            const result = testFunction.calculate(text, colDelimiter, rowDelimiter, ignoreEmpty);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['Do', ErrorType.NA, ErrorType.NA, ErrorType.NA],
                ['Or', 'do', 'not', ErrorType.NA],
                ['There', 'is', 'no', 'try'],
                ['-Anonymous', ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });

        it('matchMode value 0 or 1', () => {
            const text = StringValueObject.create('Do. Or do not. There is no try. -Anonymous');
            const colDelimiter = ArrayValueObject.create('{"o","t"}');
            const rowDelimiter = StringValueObject.create(' ');
            const ignoreEmpty = BooleanValueObject.create(true);
            const matchMode = NumberValueObject.create(-1);
            const result = testFunction.calculate(text, colDelimiter, rowDelimiter, ignoreEmpty, matchMode);
            expect(result.getValue()).toBe(ErrorType.VALUE);

            const matchMode2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(text, colDelimiter, rowDelimiter, ignoreEmpty, matchMode2);
            expect(transformToValue(result2.getArrayValue())).toStrictEqual([
                ['D', '.', ErrorType.NA],
                ['Or', ErrorType.NA, ErrorType.NA],
                ['d', ErrorType.NA, ErrorType.NA],
                ['n', '.', ErrorType.NA],
                ['There', ErrorType.NA, ErrorType.NA],
                ['is', ErrorType.NA, ErrorType.NA],
                ['n', ErrorType.NA, ErrorType.NA],
                ['ry.', ErrorType.NA, ErrorType.NA],
                ['-An', 'nym', 'us'],
            ]);

            const matchMode3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(text, colDelimiter, rowDelimiter, ignoreEmpty, matchMode3);
            expect(transformToValue(result3.getArrayValue())).toStrictEqual([
                ['D', '.', ErrorType.NA],
                ['r', ErrorType.NA, ErrorType.NA],
                ['d', ErrorType.NA, ErrorType.NA],
                ['n', '.', ErrorType.NA],
                ['here', ErrorType.NA, ErrorType.NA],
                ['is', ErrorType.NA, ErrorType.NA],
                ['n', ErrorType.NA, ErrorType.NA],
                ['ry.', ErrorType.NA, ErrorType.NA],
                ['-An', 'nym', 'us'],
            ]);
        });

        it('padWith value test', () => {
            const text = StringValueObject.create('Do. Or do not. There is no try. -Anonymous');
            const colDelimiter = ArrayValueObject.create('{"o","t"}');
            const rowDelimiter = StringValueObject.create(' ');
            const ignoreEmpty = BooleanValueObject.create(true);
            const matchMode = NumberValueObject.create(0);
            const padWith = ErrorValueObject.create(ErrorType.NULL);
            const result = testFunction.calculate(text, colDelimiter, rowDelimiter, ignoreEmpty, matchMode, padWith);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['D', '.', ErrorType.NULL],
                ['Or', ErrorType.NULL, ErrorType.NULL],
                ['d', ErrorType.NULL, ErrorType.NULL],
                ['n', '.', ErrorType.NULL],
                ['There', ErrorType.NULL, ErrorType.NULL],
                ['is', ErrorType.NULL, ErrorType.NULL],
                ['n', ErrorType.NULL, ErrorType.NULL],
                ['ry.', ErrorType.NULL, ErrorType.NULL],
                ['-An', 'nym', 'us'],
            ]);
        });

        it('Value is array', () => {
            const text = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    ['Dakota Lennon Sanchez 0'],
                    ['To be or not to be'],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const colDelimiter = StringValueObject.create(' ');
            const result = testFunction.calculate(text, colDelimiter);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                ['Dakota'],
                ['To'],
            ]);
        });
    });
});
