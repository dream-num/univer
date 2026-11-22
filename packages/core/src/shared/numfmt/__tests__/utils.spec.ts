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

import { describe, expect, it } from 'vitest';
import { isPatternEqualWithoutDecimal } from '../utils';

describe('isPatternEqualWithoutDecimal', () => {
    it('isPatternEqualWithoutDecimal', () => {
        expect(isPatternEqualWithoutDecimal('_(###0.000);-###0.00', '[red]_(###0.0000);-###0.00')).toBe(true);
        expect(isPatternEqualWithoutDecimal('_(###0;-###0.00', '_(###0;[red]-###0.00')).toBe(false);
        expect(isPatternEqualWithoutDecimal('_(###00.0;-###0.00', '_(###0;[red]-###0.00')).toBe(false);
        expect(isPatternEqualWithoutDecimal('_(###0;-###0.00', '_(###0.00;-###0.00')).toBe(true);
    });

    it('keeps a color of a negative section significant', () => {
        // A negative color is part of how the negative value is displayed, so `[Red]` in
        // the second section must not compare equal to the same pattern without it.
        expect(isPatternEqualWithoutDecimal('#,##0_);(#,##0)', '#,##0_);[Red](#,##0)')).toBe(false);
        expect(isPatternEqualWithoutDecimal('"$"#,##0.00_);"$"#,##0.00', '"$"#,##0.00_);[Red]"$"#,##0.00')).toBe(false);
        // A color of the first (positive) section is still ignored.
        expect(isPatternEqualWithoutDecimal('#,##0.00', '[Red]#,##0.00')).toBe(true);
    });

    it('keeps the sign of a colored negative section significant', () => {
        // `[Red]0.00` shows `5.00` for -5, `[Red]-0.00` shows `-5.00`.
        expect(isPatternEqualWithoutDecimal('#,##0.00_);[Red]#,##0.00', '#,##0.00_);[Red]-#,##0.00')).toBe(false);
        expect(isPatternEqualWithoutDecimal('#,##0.00_);#,##0.00', '#,##0.00_);-#,##0.00')).toBe(false);
    });
});
