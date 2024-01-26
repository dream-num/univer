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

import { describe, it } from 'vitest';

import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Offset } from '..';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';

describe('Test offset function', () => {
    const textFunction = new Offset(FUNCTION_NAMES_LOOKUP.OFFSET);

    describe('Offset', () => {
        it('Text is single cell', () => {
            const reference = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1, 2],
                    [2, 3],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 1,
                column: 1,
            });
            const rows = new NumberValueObject(1);
            const cols = new NumberValueObject(1);
            const height = new NumberValueObject(2);
            const width = new NumberValueObject(2);
            const result = textFunction.calculate(reference, rows, cols, height, width);
        });
    });
});
