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

import { Injector } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetRangeThemeModel } from '../../models/range-theme-model';
import { RangeThemeStyle } from '../../models/range-theme-util';
import { SheetRangeThemeService } from '../range-theme.service';

describe('SheetRangeThemeService', () => {
    let service: SheetRangeThemeService;
    let model: {
        registerRangeThemeStyle: ReturnType<typeof vi.fn>;
        getALLRegisteredTheme: ReturnType<typeof vi.fn>;
        registerRangeThemeRule: ReturnType<typeof vi.fn>;
        getRegisteredRangeThemeStyle: ReturnType<typeof vi.fn>;
        removeRangeThemeRule: ReturnType<typeof vi.fn>;
        getRegisteredRangeThemes: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        model = {
            registerRangeThemeStyle: vi.fn(),
            getALLRegisteredTheme: vi.fn(() => ['sales']),
            registerRangeThemeRule: vi.fn(),
            getRegisteredRangeThemeStyle: vi.fn(() => 'sales'),
            removeRangeThemeRule: vi.fn(),
            getRegisteredRangeThemes: vi.fn(() => new Map([['default', new RangeThemeStyle('default')]])),
        };
        const injector = new Injector();
        injector.add([SheetRangeThemeModel, { useValue: model as unknown as SheetRangeThemeModel }]);
        injector.add([SheetRangeThemeService]);
        service = injector.get(SheetRangeThemeService);
    });

    it('registers and applies named table themes to sheet ranges', () => {
        const theme = new RangeThemeStyle('sales');
        const rangeInfo = { unitId: 'book-1', subUnitId: 'sheet-1', range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 } };

        service.registerRangeTheme('book-1', theme);
        service.registerRangeThemeStyle('sales', rangeInfo);

        expect(model.registerRangeThemeStyle).toHaveBeenCalledWith('book-1', theme);
        expect(model.registerRangeThemeRule).toHaveBeenCalledWith('sales', rangeInfo);
        expect(service.getAppliedRangeThemeStyle(rangeInfo)).toBe('sales');
    });

    it('removes a theme rule from the requested range', () => {
        const rangeInfo = { unitId: 'book-1', subUnitId: 'sheet-1', range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 } };

        service.removeRangeThemeRule('sales', rangeInfo);

        expect(model.removeRangeThemeRule).toHaveBeenCalledWith('sales', rangeInfo);
    });
});
