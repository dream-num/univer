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
import { getCustomRangeStyle } from '../custom-range';

describe('custom range style', () => {
    it('renders active hyperlink-like ranges as blue underlined text', () => {
        expect(getCustomRangeStyle({ rangeType: CustomRangeType.HYPERLINK } as never)).toEqual({
            ul: { s: BooleanNumber.TRUE },
            cl: { rgb: '#274fee' },
        });
        expect(getCustomRangeStyle({ rangeType: CustomRangeType.MENTION, active: true } as never)).toEqual({
            ul: { s: BooleanNumber.TRUE },
            cl: { rgb: '#274fee' },
        });
    });

    it('keeps the link color but drops underline for inactive custom ranges', () => {
        expect(getCustomRangeStyle({ rangeType: CustomRangeType.CUSTOM, active: false } as never)).toEqual({
            cl: { rgb: '#274fee' },
        });
    });

    it('does not style unsupported custom range types', () => {
        expect(getCustomRangeStyle({ rangeType: CustomRangeType.COMMENT } as never)).toBeNull();
    });
});
