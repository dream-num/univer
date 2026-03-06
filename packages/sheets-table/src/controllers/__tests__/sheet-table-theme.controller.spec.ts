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

import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetsTableThemeController } from '../sheet-table-theme.controller';

describe('SheetsTableThemeController', () => {
    it('should initialize themes and react to table theme lifecycle events', () => {
        const tableAdd$ = new Subject<any>();
        const tableRangeChanged$ = new Subject<any>();
        const tableThemeChanged$ = new Subject<any>();
        const tableDelete$ = new Subject<any>();

        const table = {
            getTableStyleId: vi.fn(() => undefined),
            setTableStyleId: vi.fn(),
            getRange: vi.fn(() => ({ startRow: 1, endRow: 3, startColumn: 1, endColumn: 2 })),
        };

        const tableManager = {
            tableAdd$,
            tableRangeChanged$,
            tableThemeChanged$,
            tableDelete$,
            getTable: vi.fn(() => table),
        };

        const sheetRangeThemeService = {
            registerRangeThemeStyle: vi.fn(),
            removeRangeThemeRule: vi.fn(),
        };
        const sheetRangeThemeModel = {
            registerDefaultRangeTheme: vi.fn(),
        };
        const configService = {
            getConfig: vi.fn(() => ({
                defaultThemeIndex: 1,
                userThemes: [{ name: 'user-theme', style: {} }],
            })),
        };

        const controller = new SheetsTableThemeController(
            tableManager as any,
            sheetRangeThemeService as any,
            sheetRangeThemeModel as any,
            configService as any
        );

        expect(sheetRangeThemeModel.registerDefaultRangeTheme).toHaveBeenCalledTimes(7);

        tableAdd$.next({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            tableStyleId: '',
            range: { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2 },
        });

        expect(table.setTableStyleId).toHaveBeenCalledWith('table-default-0');
        expect(sheetRangeThemeService.registerRangeThemeStyle).toHaveBeenCalledWith('table-default-0', {
            unitId: 'u1',
            subUnitId: 's1',
            range: { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2 },
        });

        tableRangeChanged$.next({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            oldRange: { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2 },
            range: { startRow: 1, endRow: 5, startColumn: 1, endColumn: 2 },
        });

        expect(sheetRangeThemeService.removeRangeThemeRule).toHaveBeenCalledWith('table-default-0', {
            unitId: 'u1',
            subUnitId: 's1',
            range: { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2 },
        });
        expect(sheetRangeThemeService.registerRangeThemeStyle).toHaveBeenCalledWith('table-default-0', {
            unitId: 'u1',
            subUnitId: 's1',
            range: { startRow: 1, endRow: 5, startColumn: 1, endColumn: 2 },
        });

        tableThemeChanged$.next({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            oldTheme: 'table-default-0',
            theme: 'table-default-1',
        });

        expect(sheetRangeThemeService.removeRangeThemeRule).toHaveBeenCalledWith('table-default-0', {
            unitId: 'u1',
            subUnitId: 's1',
            range: { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2 },
        });
        expect(sheetRangeThemeService.registerRangeThemeStyle).toHaveBeenCalledWith('table-default-1', {
            unitId: 'u1',
            subUnitId: 's1',
            range: { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2 },
        });

        tableDelete$.next({
            unitId: 'u1',
            subUnitId: 's1',
            range: { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2 },
        });

        expect(sheetRangeThemeService.removeRangeThemeRule).toHaveBeenCalledWith('table-default-0', {
            unitId: 'u1',
            subUnitId: 's1',
            range: { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2 },
        });

        controller.dispose();
    });
});
