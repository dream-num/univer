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

import type { countryCurrencyMap } from '../base/const/currency-symbols';
import { BehaviorSubject } from 'rxjs';

export class MenuCurrencyService {
    private _currencySymbol$ = new BehaviorSubject<keyof typeof countryCurrencyMap>('US');
    public readonly currencySymbol$ = this._currencySymbol$.asObservable();

    /**
     * Set the currency symbol by setting the country code.
     */
    public setCurrencySymbolByCountryCode(symbol: keyof typeof countryCurrencyMap) {
        this._currencySymbol$.next(symbol);
    }

    public getCurrencySymbol() {
        return this._currencySymbol$.getValue();
    }
}
