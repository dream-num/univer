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
import { getColorStyleForCanvas } from '../color';

describe('getColorStyleForCanvas', () => {
    it.each(['0000FF', 'aAbBcC', '000000'])('renders legacy imported RGB %s without making text transparent', (rgb) => {
        const color = Object.freeze({ rgb, th: 0 });
        expect(getColorStyleForCanvas(color)).toBe(`#${rgb.toLowerCase()}`);
        expect(color.rgb).toBe(rgb);
    });

    it.each([
        ['blue.600', 'blue.600'],
        ['#0000FF', '#0000ff'],
        ['rgb(39, 79, 238)', '#274fee'],
        ['rgba(255, 0, 0, 0)', '#ff000000'],
        ['red', '#ff0000'],
        ['#1234', '#11223344'],
    ])('preserves CSS colors and theme tokens: %s', (rgb, expected) => {
        expect(getColorStyleForCanvas({ rgb })).toBe(expected);
    });

    it('preserves absent colors and theme-only colors', () => {
        expect(getColorStyleForCanvas(undefined)).toBeNull();
        expect(getColorStyleForCanvas({ th: 0 })).toBe('rgb(0,0,0)');
    });
});
