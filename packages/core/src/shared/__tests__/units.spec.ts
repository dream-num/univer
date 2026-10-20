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
import { cssPxToEmu, emuToCssPx } from '../units';

describe('EMU and CSS pixel conversion', () => {
    it('round trips a CSS inch through Office layout units', () => {
        expect(cssPxToEmu(96)).toBe(914400);
        expect(emuToCssPx(914400)).toBe(96);
    });

    it('quantizes fractional dimensions to the nearest integer EMU', () => {
        expect(cssPxToEmu(0.1)).toBe(953);
        for (const pixels of [-20.5, 0, 0.1, 28.33, 200000 / 9525]) {
            expect(Math.abs(emuToCssPx(cssPxToEmu(pixels)) - pixels)).toBeLessThanOrEqual(0.5 / 9525 + Number.EPSILON * Math.abs(pixels));
        }
    });
});
