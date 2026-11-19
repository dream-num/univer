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

import type { LocaleType } from '@univerjs/core';
import { Injector, LocaleService } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import l0 from '../ar-SA';
import l1 from '../ca-ES';
import l2 from '../de-DE';
import l3 from '../en-US';
import l4 from '../es-ES';
import l5 from '../fa-IR';
import l6 from '../fr-FR';
import l7 from '../id-ID';
import l8 from '../it-IT';
import l9 from '../ja-JP';
import l10 from '../ko-KR';
import l11 from '../pl-PL';
import l12 from '../pt-BR';
import l13 from '../ru-RU';
import l14 from '../sk-SK';
import l15 from '../vi-VN';
import l16 from '../zh-CN';
import l17 from '../zh-HK';
import l18 from '../zh-TW';

const locales = {
    'ar-SA': l0['drawing-ui'].ole,
    'ca-ES': l1['drawing-ui'].ole,
    'de-DE': l2['drawing-ui'].ole,
    'en-US': l3['drawing-ui'].ole,
    'es-ES': l4['drawing-ui'].ole,
    'fa-IR': l5['drawing-ui'].ole,
    'fr-FR': l6['drawing-ui'].ole,
    'id-ID': l7['drawing-ui'].ole,
    'it-IT': l8['drawing-ui'].ole,
    'ja-JP': l9['drawing-ui'].ole,
    'ko-KR': l10['drawing-ui'].ole,
    'pl-PL': l11['drawing-ui'].ole,
    'pt-BR': l12['drawing-ui'].ole,
    'ru-RU': l13['drawing-ui'].ole,
    'sk-SK': l14['drawing-ui'].ole,
    'vi-VN': l15['drawing-ui'].ole,
    'zh-CN': l16['drawing-ui'].ole,
    'zh-HK': l17['drawing-ui'].ole,
    'zh-TW': l18['drawing-ui'].ole,
};

describe('OLE action localization', () => {
    it('covers every action and tooltip in all 19 supported locales', () => {
        expect(Object.keys(locales)).toHaveLength(19);
        const keys = Object.keys(locales['en-US']).sort();
        const injector = new Injector([[LocaleService]]);
        const locale = injector.get(LocaleService);
        locale.load(Object.fromEntries(Object.entries(locales).map(([language, ole]) => [language, { 'drawing-ui': { ole } }])));
        try {
            for (const [language, messages] of Object.entries(locales)) {
                locale.setLocale(language as LocaleType);
                locale.setDirection(language === 'ar-SA' || language === 'fa-IR' ? 'rtl' : 'ltr');
                expect(Object.keys(messages).sort(), language).toEqual(keys);
                const summary = locale.t('drawing-ui.ole.unavailableSummary', '2');
                expect(summary, language).toContain('2');
                expect(summary, language).not.toContain('{0}');
                for (const key of keys) {
                    expect(locale.t(`drawing-ui.ole.${key}`), `${language}.${key}`).toBe(Reflect.get(messages, key));
                    expect(locale.t(`drawing-ui.ole.${key}`)).not.toBe(`drawing-ui.ole.${key}`);
                }
            }
        } finally { injector.dispose(); }
    });
});
