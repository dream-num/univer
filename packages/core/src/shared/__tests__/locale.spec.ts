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
import { mergeLocales } from '../locale';

describe('mergeLocales function', () => {
    it('should merge multiple locale objects correctly', () => {
        const locale1 = { greeting: 'Hello' };
        const locale2 = { farewell: 'Goodbye' };
        const locale3 = { greeting: 'Hola' };

        const merged1 = mergeLocales(locale1, locale2, locale3);

        expect(merged1).toEqual({
            greeting: 'Hola',
            farewell: 'Goodbye',
        });
    });

    it('should merge an array of locale objects', () => {
        const localesArray = [
            { greeting: 'Hello' },
            { farewell: 'Goodbye' },
            { greeting: 'Hola' },
        ];

        const merged1 = mergeLocales(...localesArray);
        const merged2 = mergeLocales(localesArray);

        expect(merged1).toEqual(merged2);
    });

    it('should handle empty objects', () => {
        const locale1 = {};
        const locale2 = { key: 'value' };

        const merged1 = mergeLocales(locale1, locale2);

        expect(merged1).toEqual({ key: 'value' });
    });
});
