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
import { FUNCTION_NAMES_LOGICAL } from '../../function-names';
import { False } from '../index';

describe('Test false function', () => {
    const textFunction = new False(FUNCTION_NAMES_LOGICAL.FALSE);

    describe('False', () => {
        it('should return false', () => {
            const result = textFunction.calculate();
            expect(result.getValue()).toBe(false);
        });
    });
});
