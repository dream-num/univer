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

import { beforeEach, describe, expect, it } from 'vitest';
import { LocaleService } from '../locale.service';
import { LocaleType } from '../../../types/enum/locale-type';

describe('LocaleService', () => {
    let localeService: LocaleService;
    const testLocales = {
        [LocaleType.ZH_CN]: {
            greeting: '你好',
            farewell: '再见',
            nested: {
                welcome: '欢迎光临',
            },
            withParams: '你好, {0}!',
        },
        [LocaleType.EN_US]: {
            greeting: 'Hello',
            farewell: 'Goodbye',
            nested: {
                welcome: 'Welcome',
            },
            withParams: 'Hello, {0}!',
        },
    };

    beforeEach(() => {
        localeService = new LocaleService();
        localeService.load(testLocales);
    });

    it('should translate simple keys', () => {
        expect(localeService.t('greeting')).toBe('你好');
        localeService.setLocale(LocaleType.EN_US);
        expect(localeService.t('greeting')).toBe('Hello');
    });

    it('should translate nested keys', () => {
        expect(localeService.t('nested.welcome')).toBe('欢迎光临');
        localeService.setLocale(LocaleType.EN_US);
        expect(localeService.t('nested.welcome')).toBe('Welcome');
    });

    it('should handle parameters within translations', () => {
        expect(localeService.t('withParams', '世界')).toBe('你好, 世界!');
        localeService.setLocale(LocaleType.EN_US);
        expect(localeService.t('withParams', 'World')).toBe('Hello, World!');
    });

    it('should return the key if translation is not found', () => {
        expect(localeService.t('nonExistentKey')).toBe('nonExistentKey');
    });

    it('should throw an error if locales are not initialized', () => {
        const newLocaleService = new LocaleService();
        const t = () => {
            newLocaleService.t('greeting');
        };
        expect(t).toThrowError('Locale not initialized');
    });
});
