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
import { Text } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { transformToValue } from '../../../../engine/value-object/array-value-object';

describe('Test text function', () => {
    const textFunction = new Text(FUNCTION_NAMES_TEXT.TEXT);

    describe('Text', () => {
        it('Text is single cell, format text is single cell', () => {
            const text1 = NumberValueObject.create(111);
            const formatText = StringValueObject.create('$#,##0.00');
            const result = textFunction.calculate(text1, formatText);
            const resultArray = result.getArrayValue();
            expect(transformToValue(resultArray)).toStrictEqual([['$111.00']]);
        });
    });
});
