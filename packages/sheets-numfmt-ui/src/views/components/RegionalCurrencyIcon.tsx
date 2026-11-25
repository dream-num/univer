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

import type { IIconProps } from '@univerjs/ui';
import { getCurrencySymbolByLocale, RegionService } from '@univerjs/core';
import { useDependency, useObservable } from '@univerjs/ui';

export function RegionalCurrencyIcon({ className, style, onClick }: IIconProps) {
    const service = useDependency(RegionService);
    const region = useObservable(service.currentRegion$, service.getCurrentRegion());
    const symbol = getCurrencySymbolByLocale(region);
    return (
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 16 16" className={className} style={style} onClick={onClick}>
            <text
                x="8"
                y="13"
                textAnchor="middle"
                fontSize={symbol.length > 1 ? 9 : 14}
                textLength={symbol.length > 2 ? 14 : undefined}
                lengthAdjust="spacingAndGlyphs"
                fill="currentColor"
            >
                {symbol}
            </text>
        </svg>
    );
}
