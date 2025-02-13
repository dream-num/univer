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

import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Areas } from '../index';
import { StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';
import { CellReferenceObject } from '../../../../engine/reference-object/cell-reference-object';

describe('Test areas function', () => {
    const testFunction = new Areas(FUNCTION_NAMES_LOOKUP.AREAS);

    describe('Areas', () => {
        it('Value is reference', async () => {
            const reference = new CellReferenceObject('A1');
            const result = testFunction.calculate(reference);
            expect(result.getValue()).toBe(1);
        });

        it('Value is not reference', async () => {
            const reference = StringValueObject.create('A1');
            const result = testFunction.calculate(reference);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });
    });
});
