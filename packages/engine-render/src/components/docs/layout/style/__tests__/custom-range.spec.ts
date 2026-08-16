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

import { BooleanNumber, CustomRangeType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getColorStyleForCanvas } from '../color';
import { getCustomRangeStyle } from '../custom-range';

describe('custom range style', () => {
    it('renders hyperlink-like ranges with the theme blue token and an underline', () => {
        expect(getCustomRangeStyle({ rangeType: CustomRangeType.HYPERLINK } as never)).toEqual({
            ul: { s: BooleanNumber.TRUE },
            cl: { rgb: 'blue.600' },
        });
        expect(getCustomRangeStyle({ rangeType: CustomRangeType.HYPERLINK, active: false } as never)).toEqual({
            ul: { s: BooleanNumber.TRUE },
            cl: { rgb: 'blue.600' },
        });
        expect(getCustomRangeStyle({ rangeType: CustomRangeType.MENTION, active: true } as never)).toEqual({
            ul: { s: BooleanNumber.TRUE },
            cl: { rgb: 'blue.600' },
        });
    });

    it('keeps the link color but drops underline for inactive custom ranges', () => {
        expect(getCustomRangeStyle({ rangeType: CustomRangeType.CUSTOM, active: false } as never)).toEqual({
            cl: { rgb: 'blue.600' },
        });
    });

    it('preserves the text run color when requested by the custom range', () => {
        expect(getCustomRangeStyle({
            rangeType: CustomRangeType.HYPERLINK,
            properties: { textColorMode: 'text' },
        } as never)).toEqual({
            ul: { s: BooleanNumber.TRUE },
        });
    });

    it('does not style unsupported custom range types', () => {
        expect(getCustomRangeStyle({ rangeType: CustomRangeType.COMMENT } as never)).toBeNull();
    });

    it('keeps palette tokens for the canvas theme color service', () => {
        expect(getColorStyleForCanvas({ rgb: 'blue.600' })).toBe('blue.600');
        expect(getColorStyleForCanvas({ rgb: 'rgb(39, 79, 238)' })).toBe('#274fee');
    });
});
