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
import { NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Wrapcols } from '../index';

describe('Test wrapcols function', () => {
    const testFunction = new Wrapcols(FUNCTION_NAMES_LOOKUP.WRAPCOLS);

    describe('Wrapcols', () => {
        it('Value is normal', async () => {
            const vector = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Ben', 1, 'Mary', -2],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const wrapCount = NumberValueObject.create(3);
            const padWith = NullValueObject.create();
            const result = testFunction.calculate(vector, wrapCount, padWith);
            expect(getObjectValue(result)).toStrictEqual([
                ['Ben', -2],
                [1, ErrorType.NA],
                ['Mary', ErrorType.NA],
            ]);
        });

        it('Vector value test', async () => {
            const vector = ErrorValueObject.create(ErrorType.NAME);
            const wrapCount = NumberValueObject.create(3);
            const padWith = NullValueObject.create();
            const result = testFunction.calculate(vector, wrapCount, padWith);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            const vector2 = NullValueObject.create();
            const result2 = testFunction.calculate(vector2, wrapCount, padWith);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const vector3 = StringValueObject.create('test');
            const result3 = testFunction.calculate(vector3, wrapCount, padWith);
            expect(getObjectValue(result3)).toStrictEqual('test');
        });

        it('WrapCount value test', async () => {
            const vector = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Ben', 1, 'Mary', -2],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const wrapCount = NumberValueObject.create(0);
            const padWith = NullValueObject.create();
            const result = testFunction.calculate(vector, wrapCount, padWith);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NUM);

            const wrapCount2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(vector, wrapCount2, padWith);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);

            const wrapCount3 = StringValueObject.create('test');
            const result3 = testFunction.calculate(vector, wrapCount3, padWith);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);
        });

        it('PadWith value test', async () => {
            const vector = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Ben', 1, 'Mary', -2],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const wrapCount = NumberValueObject.create(3);
            const padWith = NullValueObject.create();
            const result = testFunction.calculate(vector, wrapCount, padWith);
            expect(getObjectValue(result)).toStrictEqual([
                ['Ben', -2],
                [1, ErrorType.NA],
                ['Mary', ErrorType.NA],
            ]);

            const padWith2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(vector, wrapCount, padWith2);
            expect(getObjectValue(result2)).toStrictEqual([
                ['Ben', -2],
                [1, ErrorType.NAME],
                ['Mary', ErrorType.NAME],
            ]);

            const padWith3 = StringValueObject.create('test');
            const result3 = testFunction.calculate(vector, wrapCount, padWith3);
            expect(getObjectValue(result3)).toStrictEqual([
                ['Ben', -2],
                [1, 'test'],
                ['Mary', 'test'],
            ]);

            const padWith4 = ArrayValueObject.create('{"a", "b"}');
            const result4 = testFunction.calculate(vector, wrapCount, padWith4);
            expect(getObjectValue(result4)).toStrictEqual([
                ['Ben', 'Ben'],
            ]);
        });
    });
});
