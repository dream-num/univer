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

import { DateSystem } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { stripErrorMargin } from '../../../../engine/utils/math-kit';
import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Now } from '../index';

describe('Test now function', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2020, 0, 1, 2, 3, 4));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const testFunction = new Now(FUNCTION_NAMES_DATE.NOW);

    describe('Now', () => {
        it('Normal', () => {
            const result = testFunction.calculate();
            expect(stripErrorMargin(result.getValue())).toBe(43831.085462963);
        });

        it('uses the configured date system', () => {
            testFunction.setDateSystem(DateSystem.Date1900);
            const date1900 = testFunction.calculate().getValue();

            testFunction.setDateSystem(DateSystem.Date1904);
            const date1904 = testFunction.calculate().getValue();

            expect(date1900 - date1904).toBeCloseTo(1462, 10);
            testFunction.setDateSystem(DateSystem.Date1900);
        });
    });
});
