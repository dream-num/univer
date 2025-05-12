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

import type { RGBColorType } from './utils';
import { denormalizeRGBColor, normalizeRGBColor } from './utils';

const matrix = [
    [0.333, -0.667, -0.667, 0, 1],
    [-0.667, 0.333, -0.667, 0, 1],
    [-0.667, -0.667, 0.333, 0, 1],
    [0, 0, 0, 1, 0],
];

function invertNormalizedColorByMatrix(color: RGBColorType): RGBColorType {
    const r = color[0];
    const g = color[1];
    const b = color[2];

    let newColor = [
        matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b + matrix[0][4],
        matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b + matrix[1][4],
        matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b + matrix[2][4],
    ];

    // Clamp values between 0 and 1, or we can normalize it.
    // It is better to normalize before rendering.
    newColor = newColor.map((c) => (c > 1 ? 1 : c < 0 ? 0 : c));
    return newColor as RGBColorType;
}

/**
 * Invert a color by RGB matrix method.
 * @param color The color to invert. Note that this color is already normalized.
 * @returns The inverted color.
 */
export function invertColorByMatrix(color: RGBColorType): RGBColorType {
    return denormalizeRGBColor(invertNormalizedColorByMatrix(normalizeRGBColor(color)));
}
