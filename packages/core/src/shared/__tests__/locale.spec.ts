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

import { describe, expect, expectTypeOf, it } from 'vitest';
import type { LocaleLeafKeys } from '../locale';
import { Injector } from '../../common/di';
import { LocaleService } from '../../services/locale/locale.service';
import { LocaleType } from '../../types/enum/locale-type';
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

describe('LocaleLeafKeys', () => {
    it('types numeric property paths that LocaleService can translate and excludes non-string leaves', () => {
        const resources = {
            month: { 1: 'January', 12: 'December' },
            layout: { '001': 'List', 100: { name: 'Picture list' } },
            enabled: true,
            alternatives: ['First', 'Second'],
        };
        type TestLocaleKey = LocaleLeafKeys<typeof resources>;
        expectTypeOf<TestLocaleKey>().toEqualTypeOf<'month.1' | 'month.12' | 'layout.001' | 'layout.100.name'>();

        const injector = new Injector([[LocaleService]]);
        try {
            const localeService = injector.get(LocaleService);
            localeService.load({ [LocaleType.EN_US]: resources });
            localeService.setLocale(LocaleType.EN_US);
            localeService.setDirection('ltr');
            expect(localeService.t<TestLocaleKey>('month.1')).toBe('January');
            expect(localeService.t<TestLocaleKey>('layout.100.name')).toBe('Picture list');
        } finally {
            injector.dispose();
        }
    });
});
