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
import { tableDefaultBorderStyle } from '../config.schema';
import { customEmptyThemeWithBorderStyle, processStyleWithBorderStyle, tableThemeConfig } from '../table-theme.factory';

describe('table-theme.factory', () => {
    it('should fill border style for specific theme keys when border is missing', () => {
        expect(processStyleWithBorderStyle('headerRowStyle', {} as any)).toEqual({
            bd: { t: tableDefaultBorderStyle },
        });

        expect(processStyleWithBorderStyle('lastRowStyle', {} as any)).toEqual({
            bd: { b: tableDefaultBorderStyle },
        });

        expect(processStyleWithBorderStyle('lastColumnStyle', {} as any)).toEqual({
            bd: { r: tableDefaultBorderStyle },
        });

        expect(processStyleWithBorderStyle('headerColumnStyle', {} as any)).toEqual({
            bd: { l: tableDefaultBorderStyle },
        });
    });

    it('should not override an existing border definition', () => {
        const style = { bd: { t: { s: 0 } }, bg: { rgb: '#fff' } } as any;
        expect(processStyleWithBorderStyle('headerRowStyle', style)).toBe(style);
    });

    it('should expose the default empty theme with four-side border', () => {
        expect(customEmptyThemeWithBorderStyle.headerRowStyle?.bd?.t).toEqual(tableDefaultBorderStyle);
        expect(customEmptyThemeWithBorderStyle.headerColumnStyle?.bd?.l).toEqual(tableDefaultBorderStyle);
        expect(customEmptyThemeWithBorderStyle.lastColumnStyle?.bd?.r).toEqual(tableDefaultBorderStyle);
        expect(customEmptyThemeWithBorderStyle.lastRowStyle?.bd?.b).toEqual(tableDefaultBorderStyle);
    });

    it('should generate built-in table themes with stable naming and border defaults', () => {
        expect(tableThemeConfig).toHaveLength(6);
        expect(tableThemeConfig[0].name).toBe('table-default-0');
        expect(tableThemeConfig[5].name).toBe('table-default-5');
        expect(tableThemeConfig[0].style.headerRowStyle?.bd?.t).toEqual(tableDefaultBorderStyle);
        expect(tableThemeConfig[0].style.lastColumnStyle?.bd?.r).toEqual(tableDefaultBorderStyle);
    });
});
