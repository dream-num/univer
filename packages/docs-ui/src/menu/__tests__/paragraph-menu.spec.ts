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

import { ThemeService } from '@univerjs/core';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import {
    BACKGROUND_COLOR_SWATCH_ICONS,
    ParagraphMenuBackgroundColorSwatchMenuItemFactories,
    ParagraphMenuIndentDecreaseMenuItemFactory,
    ParagraphMenuIndentIncreaseMenuItemFactory,
} from '../paragraph-menu';

vi.mock('@univerjs/ui', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/ui')>('@univerjs/ui');
    return {
        ...actual,
        getMenuHiddenObservable: vi.fn(() => of(false)),
    };
});

describe('paragraph menu theme colors', () => {
    it('uses semantic line-indent icons for indent actions', () => {
        const accessor = {
            get: vi.fn(),
        };
        const increase = ParagraphMenuIndentIncreaseMenuItemFactory(accessor as never);
        const decrease = ParagraphMenuIndentDecreaseMenuItemFactory(accessor as never);

        expect(increase.icon).toBe('LineIndentIncreaseIcon');
        expect(decrease.icon).toBe('LineIndentDecreaseIcon');
    });

    it('uses direct theme highlight background tokens for background swatches', () => {
        const themeService = {
            getColorFromTheme: vi.fn((path: string) => ({
                'highlight.background.1': { color: 'purple.500', alpha: 0.3 },
                'highlight.background.2': { color: 'red.500', alpha: 0.15 },
                'purple.500': '#010203',
                'red.500': '#040506',
            })[path]),
        };
        const accessor = {
            get: vi.fn((id) => id === ThemeService ? themeService : undefined),
        };

        const firstFactory = ParagraphMenuBackgroundColorSwatchMenuItemFactories['doc.menu.paragraph-t.background-color.0'].menuItemFactory;
        const secondFactory = ParagraphMenuBackgroundColorSwatchMenuItemFactories['doc.menu.paragraph-t.background-color.1'].menuItemFactory;

        expect(BACKGROUND_COLOR_SWATCH_ICONS).toHaveLength(16);
        expect(firstFactory(accessor as never).params).toEqual({ value: 'rgba(1,2,3,0.3)' });
        expect(secondFactory(accessor as never).params).toEqual({ value: 'rgba(4,5,6,0.15)' });
        expect(themeService.getColorFromTheme).toHaveBeenCalledWith('highlight.background.1');
        expect(themeService.getColorFromTheme).toHaveBeenCalledWith('highlight.background.2');
    });
});
