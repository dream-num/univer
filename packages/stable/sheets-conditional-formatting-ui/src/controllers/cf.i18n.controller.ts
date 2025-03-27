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

import type { ReactNode } from 'react';
import { Disposable, Inject, LocaleService } from '@univerjs/core';

export class ConditionalFormattingI18nController extends Disposable {
    constructor(@Inject(LocaleService) private _localeService: LocaleService) {
        super();
        this._initLocal();
    }

    private _initLocal = () => {
    };

    public tWithReactNode(key: string, ...args: (ReactNode | string)[]) {
        const locale = this._localeService.getLocales();
        const keys = key.split('.');
        const resolvedValue = locale && this._localeService.resolveKeyPath(locale, keys);
        if (typeof resolvedValue === 'string') {
            const result: (string | ReactNode)[] = [];
            this._findReplaceIndex(resolvedValue).forEach((item, index, list) => {
                const preItem = list[index - 1] || { startIndex: 0, endIndex: -1 };
                if (preItem.endIndex + 1 < item.startIndex) {
                    const text = resolvedValue.slice(preItem.endIndex + 1, item.startIndex);
                    text && result.push(text);
                }
                args[item.key] && result.push(args[item.key]);
                if (index === list.length - 1) {
                    const text = resolvedValue.slice(item.endIndex + 1);
                    text && result.push(text);
                }
            });
            return result;
        }
        return [];
    }

    private _findReplaceIndex = (text: string) => {
        const reg = /\{([^}]+)?\}/g;
        const result: { startIndex: number; key: number; endIndex: number }[] = [];
        let currentValue = reg.exec(text);
        while (currentValue) {
            result.push({
                startIndex: currentValue.index,
                key: Number(currentValue[1]),
                endIndex: currentValue.index + currentValue[0].length - 1,
            });
            currentValue = reg.exec(text);
        }
        return result;
    };
}
