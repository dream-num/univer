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

import { BooleanNumber } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { fontLibrary } from '../font-library';

describe('font library', () => {
    it('matches best local font variant by style distance', () => {
        const book = new Map([
            ['My Sans', new Map([
                ['Regular', {
                    font: {
                        family: 'My Sans',
                        fullName: 'My Sans Regular',
                        postscriptName: 'MySans-Regular',
                        style: 'Regular',
                    },
                    buffer: new ArrayBuffer(8),
                }],
                ['Bold', {
                    font: {
                        family: 'My Sans',
                        fullName: 'My Sans Bold',
                        postscriptName: 'MySans-Bold',
                        style: 'Bold',
                    },
                    buffer: new ArrayBuffer(8),
                }],
                ['Italic', {
                    font: {
                        family: 'My Sans',
                        fullName: 'My Sans Italic',
                        postscriptName: 'MySans-Italic',
                        style: 'Italic',
                    },
                    buffer: new ArrayBuffer(8),
                }],
            ])],
        ]);

        (fontLibrary as any)._fontBook = book;

        const regular = fontLibrary.findBestMatchFontByStyle({
            ff: 'My Sans',
            bl: BooleanNumber.FALSE,
            it: BooleanNumber.FALSE,
        });
        expect(regular?.font.fullName).toBe('My Sans Regular');

        const bold = fontLibrary.findBestMatchFontByStyle({
            ff: 'My Sans',
            bl: BooleanNumber.TRUE,
            it: BooleanNumber.FALSE,
        });
        expect(bold?.font.fullName).toBe('My Sans Bold');

        const italic = fontLibrary.findBestMatchFontByStyle({
            ff: 'My Sans',
            bl: BooleanNumber.FALSE,
            it: BooleanNumber.TRUE,
        });
        expect(italic?.font.fullName).toBe('My Sans Italic');

        expect(fontLibrary.findBestMatchFontByStyle({ ff: 'Unknown Family' })).toBeUndefined();
    });

    it('filters valid font families from current font book', () => {
        (fontLibrary as any)._fontBook = new Map([
            ['A', new Map()],
            ['B', new Map()],
        ]);

        expect(fontLibrary.getValidFontFamilies(['A', 'C', 'B'])).toEqual(['A', 'B']);
        expect(fontLibrary.getValidFontFamilies([])).toEqual([]);
    });
});
