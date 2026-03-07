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
import { invertColorByHSL, stringToRgb } from '../invert-color/invert-hsl';
import { invertColorByMatrix } from '../invert-color/invert-rgb';
import { denormalizeRGBColor, normalizeRGBColor } from '../invert-color/utils';

function expectRgbColorInRange(color: [number, number, number]) {
    color.forEach((channel) => {
        expect(Number.isInteger(channel)).toBe(true);
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(255);
    });
}

describe('invert color helpers', () => {
    it('should normalize and denormalize rgb colors', () => {
        expect(normalizeRGBColor([0, 128, 255])).toEqual([0, 128 / 255, 1]);
        expect(denormalizeRGBColor([0, 0.5, 1])).toEqual([0, 128, 255]);
    });

    it('should parse rgb strings and ignore trailing channels', () => {
        expect(stringToRgb('12,34,56')).toEqual([12, 34, 56]);
        expect(stringToRgb('12,34,56,0.5')).toEqual([12, 34, 56]);
    });

    it('should invert colors with the rgb matrix implementation', () => {
        expect(invertColorByMatrix([0, 0, 0])).toEqual([255, 255, 255]);
        expect(invertColorByMatrix([255, 255, 255])).toEqual([0, 0, 0]);
        expect(invertColorByMatrix([255, 0, 0])).toEqual([255, 85, 85]);
    });

    it('should invert grayscale colors with the hsl implementation', () => {
        expect(invertColorByHSL([0, 0, 0])).toEqual([255, 255, 255]);
        expect(invertColorByHSL([255, 255, 255])).toEqual([3, 3, 3]);
        expect(invertColorByHSL([128, 128, 128])).toEqual([127, 127, 127]);
    });

    it('should invert chromatic colors through all hue branches', () => {
        const redDominantLowBlue = invertColorByHSL([255, 128, 0]);
        const redDominantHighBlue = invertColorByHSL([255, 0, 128]);
        const greenDominant = invertColorByHSL([0, 255, 0]);
        const blueDominant = invertColorByHSL([0, 0, 255]);
        const brightChromatic = invertColorByHSL([255, 200, 100]);

        [redDominantLowBlue, redDominantHighBlue, greenDominant, blueDominant, brightChromatic].forEach((color) => {
            expectRgbColorInRange(color);
        });

        expect(redDominantLowBlue).toHaveLength(3);
        expect(redDominantHighBlue).toHaveLength(3);
        expect(greenDominant).toHaveLength(3);
        expect(blueDominant).toHaveLength(3);
        expect(brightChromatic).toHaveLength(3);
    });
});
