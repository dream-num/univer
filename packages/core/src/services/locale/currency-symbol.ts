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

import { regionCurrencySymbols } from '../../shared/numfmt/currency-symbols';
import { getRegionLocale } from '../../types/enum/locale-type';

let lastRegion: string | undefined;
let lastSymbol = '$';

export function getCurrencySymbolByLocale(region: string): string {
    if (region !== lastRegion) {
        const locale = getRegionLocale(region)?.maximize();
        lastSymbol = locale
            ? regionCurrencySymbols.get(locale.baseName) ?? regionCurrencySymbols.get(locale.region ?? '') ?? '¤'
            : '$';
        lastRegion = region;
    }
    return lastSymbol;
}
