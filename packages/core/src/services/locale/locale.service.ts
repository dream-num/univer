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

import type { ILanguagePack, ILocales, LanguageValue } from '../../shared/locale';

import { merge } from 'lodash-es';
import { BehaviorSubject, Subject } from 'rxjs';
import { Disposable, toDisposable } from '../../shared/lifecycle';
import { LocaleType } from '../../types/enum/locale-type';

/**
 * This service provides i18n and timezone / location features to other modules.
 */
export class LocaleService extends Disposable {
    private _currentLocale$ = new BehaviorSubject<LocaleType>(LocaleType.ZH_CN);
    readonly currentLocale$ = this._currentLocale$.asObservable();
    private get _currentLocale(): LocaleType { return this._currentLocale$.value; }

    private _locales: ILocales | null = null;

    localeChanged$ = new Subject<void>();

    constructor() {
        super();

        this.disposeWithMe(toDisposable(() => this.localeChanged$.complete()));
    }

    /**
     * Load more locales after init.
     *
     * @param locales - Locale object
     */
    load(locales: ILocales) {
        this._locales = merge(this._locales ?? {}, locales);
    }

    /**
     * Translate a key to the current locale
     *
     * @param {string} key the key to translate
     * @param {string[]} args optional arguments to replace in the translated string
     * @returns {string} the translated string
     *
     * @example
     * const locales = {
     *   [LocaleType.EN_US]: {
     *     foo: {
     *       bar: 'Hello'
     *    }
     * }
     * t('foo.bar') => 'Hello'
     *
     * @example
     * const locales = {
     *   [LocaleType.EN_US]: {
     *     foo: {
     *       bar: 'Hello {0}'
     *    }
     * }
     * t('foo.bar', 'World') => 'Hello World'
     */
    t = (key: string, ...args: string[]): string => {
        if (!this._locales) throw new Error('[LocaleService]: Locale not initialized');

        const keys = key.split('.');
        const resolvedValue = this.resolveKeyPath(this._locales[this._currentLocale], keys);
        if (typeof resolvedValue === 'string') {
            let result = resolvedValue;
            args.forEach((arg, index) => {
                result = result.replace(`{${index}}`, arg);
            });
            return result;
        } else {
            return key;
        }
    };

    setLocale(locale: LocaleType) {
        this._currentLocale$.next(locale);
        this.localeChanged$.next();
    }

    getLocales() {
        return this._locales?.[this._currentLocale];
    }

    getCurrentLocale() {
        return this._currentLocale;
    }

    public resolveKeyPath(obj: ILanguagePack, keys: string[]): LanguageValue | null {
        const currentKey = keys.shift();

        if (currentKey && obj && currentKey in obj) {
            const nextObj = (obj as ILanguagePack)[currentKey];

            if (keys.length > 0 && (typeof nextObj === 'object' || Array.isArray(nextObj))) {
                return this.resolveKeyPath(nextObj as ILanguagePack, keys);
            } else {
                return nextObj;
            }
        }

        return null;
    }
}
