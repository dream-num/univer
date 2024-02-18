/**
 * Copyright 2023-present DreamNum Inc.
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

import { Subject } from 'rxjs';

import { Disposable, toDisposable } from '../../shared/lifecycle';
import type { ILanguagePack, ILocales } from '../../shared/locale';
import { Tools } from '../../shared/tools';
import { LocaleType } from '../../types/enum/locale-type';

/**
 * This service provides i18n and timezone / location features to other modules.
 */
export class LocaleService extends Disposable {
    private _currentLocale: LocaleType = LocaleType.ZH_CN;

    private _locales: ILocales | null = null;

    localeChanged$ = new Subject<void>();

    constructor() {
        super();

        this.disposeWithMe(toDisposable(() => this.localeChanged$.complete()));
    }

    /**
     * Load more locales after init
     *
     * @param locales - Locale object
     *
     */
    load(locales: ILocales) {
        this._locales = Tools.deepMerge(this._locales ?? {}, locales);
    }

    t = (key: string, ...args: string[]): string => {
        if (!this._locales) throw new Error('Locale not initialized');

        function resolveKeyPath(obj: ILanguagePack | ILanguagePack[], keys: string[]): string | ILanguagePack | ILanguagePack[] | null {
            const currentKey = keys.shift();

            if (currentKey && obj && currentKey in obj) {
                const nextObj = (obj as ILanguagePack)[currentKey];

                if (keys.length > 0 && (typeof nextObj === 'object' || Array.isArray(nextObj))) {
                    return resolveKeyPath(nextObj as ILanguagePack, keys);
                } else {
                    return nextObj;
                }
            }

            return null;
        }

        // 使用点分隔符拆分key
        const keys = key.split('.');
        const resolvedValue = resolveKeyPath(this._locales[this._currentLocale], keys);

        if (typeof resolvedValue === 'string') {
            // 如果找到的是字符串，进行插值
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
        this._currentLocale = locale;
        this.localeChanged$.next();
    }

    getLocales() {
        return this._locales?.[this._currentLocale];
    }
}
