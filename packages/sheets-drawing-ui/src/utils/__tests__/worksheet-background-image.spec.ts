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
import { getWorksheetBackgroundImageScale } from '../worksheet-background-image';

function base64(bytes: number[]): string {
    return `data:image/png;base64,${btoa(String.fromCharCode(...bytes))}`;
}

describe('getWorksheetBackgroundImageScale', () => {
    it('converts PNG pixels-per-meter metadata to a 96-DPI worksheet scale', () => {
        const bytes = [
            0x89,
            0x50,
            0x4E,
            0x47,
            0x0D,
            0x0A,
            0x1A,
            0x0A,
            0x00,
            0x00,
            0x00,
            0x09,
            0x70,
            0x48,
            0x59,
            0x73,
            0x00,
            0x00,
            0x17,
            0x12,
            0x00,
            0x00,
            0x17,
            0x12,
            0x01,
            0x00,
            0x00,
            0x00,
            0x00,
        ];

        const scale = getWorksheetBackgroundImageScale(base64(bytes));
        expect(scale).toBeDefined();
        expect(scale?.scaleX).toBeCloseTo(0.6399471, 6);
        expect(scale?.scaleY).toBeCloseTo(0.6399471, 6);
    });

    it('leaves images without usable resolution metadata unchanged', () => {
        expect(getWorksheetBackgroundImageScale('data:image/png;base64,invalid')).toBeUndefined();
    });
});
