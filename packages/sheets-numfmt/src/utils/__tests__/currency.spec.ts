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

import { currencySymbols } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getCurrencyType } from '../currency';

describe('getCurrencyType', () => {
    it('getCurrencyType', () => {
        expect(getCurrencyType(`_(${currencySymbols[7]} 123123`)).toBe(currencySymbols[7]);
        expect(getCurrencyType('_(# 123123')).toBeUndefined();
        expect(getCurrencyType(`_(${currencySymbols[7]} 123123 ${currencySymbols[8]}`)).toBe(currencySymbols[7]);
    });
});
