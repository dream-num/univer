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

import {
    DesktopLogService,
    ILogService,
    Injector,
    IResourceManagerService,
    IUniverInstanceService,
    ResourceManagerService,
} from '@univerjs/core';
import { EMPTY } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { SheetRangeThemeModel } from '../../models/range-theme-model';
import { RangeThemeStyle } from '../../models/range-theme-util';
import { SheetRangeThemeService } from '../range-theme.service';
import { SheetInterceptorService } from '../sheet-interceptor/sheet-interceptor.service';

describe('SheetRangeThemeService', () => {
    let service: SheetRangeThemeService;

    class TestWorksheet {
        getRowCount() {
            return 20;
        }

        getRowManager() {
            return {
                getRowHeight: () => 24,
            };
        }

        getRowVisible() {
            return true;
        }
    }

    class TestWorkbook {
        getSheetBySheetId(sheetId: string) {
            return sheetId === 'sheet-1' ? new TestWorksheet() : null;
        }
    }

    class TestUniverInstanceService {
        getTypeOfUnitAdded$() {
            return EMPTY;
        }

        getTypeOfUnitDisposed$() {
            return EMPTY;
        }

        getUnit(unitId: string) {
            return unitId === 'book-1' ? new TestWorkbook() : null;
        }
    }

    beforeEach(() => {
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IResourceManagerService, { useClass: ResourceManagerService }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetRangeThemeModel]);
        injector.add([SheetRangeThemeService]);
        service = injector.get(SheetRangeThemeService);
    });

    it('registers and applies named table themes to sheet ranges', () => {
        const theme = new RangeThemeStyle('sales');
        const rangeInfo = { unitId: 'book-1', subUnitId: 'sheet-1', range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 } };

        service.registerRangeTheme('book-1', theme);
        service.registerRangeThemeStyle('sales', rangeInfo);

        expect(service.getALLRegisterThemes('book-1')).toEqual(['sales']);
        expect(service.getAppliedRangeThemeStyle(rangeInfo)).toBe('sales');
    });

    it('removes a theme rule from the requested range', () => {
        const rangeInfo = { unitId: 'book-1', subUnitId: 'sheet-1', range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 } };

        service.registerRangeTheme('book-1', new RangeThemeStyle('sales'));
        service.registerRangeThemeStyle('sales', rangeInfo);
        service.removeRangeThemeRule('sales', rangeInfo);

        expect(service.getAppliedRangeThemeStyle(rangeInfo)).toBeUndefined();
    });
});
