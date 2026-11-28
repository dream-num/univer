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
import { Injector } from '../../../common/di';
import { LocaleType } from '../../../types/enum/locale-type';
import { LocaleService } from '../locale.service';

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
        const injector = new Injector();
        injector.add([LocaleService]);
        localeService = injector.get(LocaleService);
        localeService.load(testLocales);
    });

    it.each(['zh-CN', 'zh-cn', 'ZH-CN'])('prefers the BCP 47 pack key %s over a compact alias in either order', (key) => {
        const injector = new Injector([[LocaleService]]);
        const locales = injector.get(LocaleService);
        const legacy = { zhCN: { app: { shared: 'legacy', old: 'old' } } };
        const standard = { [key]: { app: { shared: 'standard', added: 'added' } } };
        locales.setLocale('zhCN');
        for (const packs of [{ ...standard, ...legacy }, { ...legacy, ...standard }]) {
            locales.load(packs);
            expect(locales.getLocales()).toEqual({ app: { shared: 'standard', old: 'old', added: 'added' } });
        }
        locales.load({ zhCN: { app: { shared: 'updated' } } });
        expect(locales.t('app.shared')).toBe('updated');
        expect(locales.t('app.added')).toBe('added');
        injector.dispose();
    });

    it('merges equivalent case spellings independently of property order', () => {
        const injector = new Injector([[LocaleService]]);
        const service = injector.get(LocaleService);
        service.setLocale('zh-CN');
        const entries = [['zh-cn', { shared: 'lowercase' }], ['ZH-CN', { shared: 'uppercase' }]] as const;
        for (const order of [entries, [...entries].reverse()]) {
            const packs = Object.fromEntries(order);
            service.load(packs);
            expect(service.t('shared')).toBe('lowercase');
            service.load({ 'zh-CN': { shared: 'preferred' }, ...packs });
            expect(service.t('shared')).toBe('preferred');
        }
        injector.dispose();
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

    it('should return RTL status independent from current locale', () => {
        expect(localeService.getDirection()).toBe('ltr');
        localeService.setLocale(LocaleType.FA_IR);
        expect(localeService.getDirection()).toBe('ltr');
        localeService.setDirection('rtl');
        expect(localeService.getDirection()).toBe('rtl');
    });

    it('should throw an error if locales are not initialized', () => {
        const injector = new Injector();
        injector.add([LocaleService]);
        const newLocaleService = injector.get(LocaleService);
        const t = () => {
            newLocaleService.t('greeting');
        };
        expect(t).toThrow('Locale not initialized');
    });
});
