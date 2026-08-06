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

import { CellValueType } from '@univerjs/core';
import { CURSOR_TYPE, getCurrentTypeOfRenderer } from '@univerjs/engine-render';
import { INTERCEPTOR_POINT, SetWorksheetColWidthMutation, TextToNumberCommand, ToggleCellCheckboxCommand } from '@univerjs/sheets';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CellAlertType } from '../../services/cell-alert-manager.service';
import { AutoWidthController, createAutoColWidthUndoMutationsByRedos } from '../auto-width.controller';
import { SheetCheckboxController } from '../checkbox.controller';
import { ForceStringAlertRenderController } from '../force-string-alert-render.controller';
import { ForceStringRenderController } from '../force-string-render.controller';

const mainComponentMock = vi.hoisted(() => ({
    setCursor: vi.fn(),
}));

vi.mock('@univerjs/engine-render', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/engine-render')>();

    return {
        ...actual,
        getCurrentTypeOfRenderer: vi.fn(() => ({
            mainComponent: mainComponentMock,
        })),
    };
});

describe('SheetCheckboxController', () => {
    it('uses pointer cursor for checkbox bullets and toggles the clicked checkbox paragraph', () => {
        const currentRichText$ = new Subject<{ bullet?: { startIndex: number } } | null>();
        const currentClickedCell$ = new Subject<{
            location: { unitId: string; subUnitId: string; row: number; col: number };
            bullet?: { startIndex: number };
        }>();
        const commandService = { executeCommand: vi.fn() };
        const controller = new SheetCheckboxController(
            { currentRichText$, currentClickedCell$ } as never,
            {} as never,
            commandService as never,
            {} as never
        );

        currentRichText$.next({ bullet: { startIndex: 3 } });
        expect(mainComponentMock.setCursor).toHaveBeenCalledWith(CURSOR_TYPE.POINTER);
        expect(getCurrentTypeOfRenderer).toHaveBeenCalled();
        currentRichText$.next(null);
        expect(mainComponentMock.setCursor).toHaveBeenCalledWith(CURSOR_TYPE.AUTO);

        currentClickedCell$.next({
            location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 2, col: 4 },
            bullet: { startIndex: 7 },
        });
        currentClickedCell$.next({
            location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 3, col: 5 },
        });

        expect(commandService.executeCommand).toHaveBeenCalledTimes(1);
        expect(commandService.executeCommand).toHaveBeenCalledWith(ToggleCellCheckboxCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 2,
            col: 4,
            paragraphIndex: 7,
        });

        controller.dispose();
    });
});

describe('ForceStringRenderController', () => {
    it('marks numeric-looking string cells unless disabled or formatted as text', () => {
        let interceptor: typeof INTERCEPTOR_POINT.CELL_CONTENT | undefined;
        const controller = new ForceStringRenderController(
            { unitId: 'unit-1' } as never,
            { getCurrentParam: vi.fn(() => ({ skeleton: {} })) } as never,
            {
                intercept: vi.fn((point, config) => {
                    expect(point).toBe(INTERCEPTOR_POINT.CELL_CONTENT);
                    interceptor = config;
                    return { dispose: vi.fn() };
                }),
            } as never,
            { getConfig: vi.fn(() => ({ disableForceStringMark: false })) } as never
        );
        const workbook = {
            getStyles: vi.fn(() => ({
                get: vi.fn((styleId: string) => styleId === 'text' ? { n: { pattern: '@' } } : undefined),
            })),
        };
        const rawCell = { v: '123', t: CellValueType.STRING };

        if (!interceptor) {
            throw new Error('CELL_CONTENT interceptor was not registered');
        }

        const result = interceptor.handler(rawCell, {
            rawData: rawCell,
            workbook,
        } as never, (cell) => cell);

        expect(result).not.toBe(rawCell);
        expect(result?.markers?.tl).toEqual({ size: 6, color: '#409f11' });

        expect(interceptor.handler({ ...rawCell, s: 'text' }, {
            rawData: { ...rawCell, s: 'text' },
            workbook,
        } as never, (cell) => cell)).not.toHaveProperty('markers');

        controller.dispose();
    });
});

describe('ForceStringAlertRenderController', () => {
    it('shows the alert only for a numeric-text primary cell in a single selection', () => {
        const selectionChanged$ = new Subject<Array<{
            range: { startRow: number; endRow: number; startColumn: number; endColumn: number };
            primary: { actualRow: number; actualColumn: number };
        }>>();
        const cellAlertManagerService = {
            currentAlert: new Map(),
            showAlert: vi.fn((alert) => {
                cellAlertManagerService.currentAlert.set(alert.key, { alert });
            }),
            removeAlert: vi.fn((key) => cellAlertManagerService.currentAlert.delete(key)),
        };
        const worksheet = {
            getSheetId: vi.fn(() => 'sheet-1'),
            getCell: vi.fn((row: number) => row === 1
                ? { v: '123', t: CellValueType.STRING }
                : { v: '123', t: CellValueType.STRING, s: 'text' }),
        };
        const workbook = {
            activeSheet$: new BehaviorSubject(worksheet),
            getUnitId: vi.fn(() => 'unit-1'),
            getActiveSheet: vi.fn(() => worksheet),
            getStyles: vi.fn(() => ({
                get: vi.fn((styleId: string) => styleId === 'text' ? { n: { pattern: '@' } } : undefined),
            })),
        };
        let disableForceStringAlert = false;
        const commandService = {
            syncExecuteCommand: vi.fn(() => true),
        };
        const currentUnit$ = new BehaviorSubject(workbook);
        const controller = new ForceStringAlertRenderController(
            { unit: workbook } as never,
            {
                selectionChanged$,
                currentSelectionParam: { unitId: 'unit-1', sheetId: 'sheet-1' },
                getCurrentSelections: vi.fn(() => []),
            } as never,
            cellAlertManagerService as never,
            { t: vi.fn((key: string) => key) } as never,
            { getConfig: vi.fn(() => ({ disableForceStringAlert })) } as never,
            commandService as never,
            { getCurrentTypeOfUnit$: vi.fn(() => currentUnit$) } as never
        );

        const selection = {
            range: { startRow: 1, endRow: 3, startColumn: 2, endColumn: 4 },
            primary: { actualRow: 1, actualColumn: 2 },
        };
        selectionChanged$.next([selection]);
        expect(cellAlertManagerService.showAlert).toHaveBeenCalledWith(expect.objectContaining({
            type: CellAlertType.WARNING,
            title: 'sheets-ui.info.error',
            message: 'sheets-ui.info.forceStringInfo',
            key: 'SHEET_FORCE_STRING_ALERT:unit-1',
            location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 1, col: 2 },
            menu: [expect.objectContaining({ label: 'sheets-ui.info.convertToNumber' })],
        }));

        const alert = cellAlertManagerService.showAlert.mock.calls[0][0];
        alert.menu[0].onSelect();
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(TextToNumberCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ranges: [selection.range],
        });

        selectionChanged$.next([selection, { ...selection }]);
        expect(cellAlertManagerService.removeAlert).toHaveBeenCalledWith('SHEET_FORCE_STRING_ALERT:unit-1');

        selectionChanged$.next([{
            range: { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 },
            primary: { actualRow: 2, actualColumn: 2 },
        }]);
        expect(cellAlertManagerService.showAlert).toHaveBeenCalledTimes(1);

        disableForceStringAlert = true;
        selectionChanged$.next([selection]);
        expect(cellAlertManagerService.showAlert).toHaveBeenCalledTimes(1);

        controller.dispose();
    });

    it('scopes alerts to the current workbook and refreshes them when the active sheet changes', () => {
        const selection = {
            range: { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 },
            primary: { actualRow: 1, actualColumn: 2 },
        };
        const selectionChanged$ = new Subject<typeof selection[]>();
        const selectionService = {
            selectionChanged$,
            currentSelectionParam: { unitId: 'unit-2', sheetId: 'sheet-1' },
            getCurrentSelections: vi.fn(() => [selection]),
        };
        const sheet1 = {
            getSheetId: vi.fn(() => 'sheet-1'),
            getCell: vi.fn(() => ({ v: '123', t: CellValueType.STRING })),
        };
        const sheet2 = {
            getSheetId: vi.fn(() => 'sheet-2'),
            getCell: vi.fn(() => ({ v: 'abc', t: CellValueType.STRING })),
        };
        let activeSheet = sheet1;
        const activeSheet$ = new BehaviorSubject(activeSheet);
        const workbook = {
            activeSheet$,
            getUnitId: vi.fn(() => 'unit-1'),
            getActiveSheet: vi.fn(() => activeSheet),
            getStyles: vi.fn(() => ({ get: vi.fn() })),
        };
        const cellAlertManagerService = {
            currentAlert: new Map(),
            showAlert: vi.fn((alert) => cellAlertManagerService.currentAlert.set(alert.key, { alert })),
            removeAlert: vi.fn((key) => cellAlertManagerService.currentAlert.delete(key)),
        };
        const currentUnit$ = new BehaviorSubject<object>({ getUnitId: () => 'unit-2' });
        const controller = new ForceStringAlertRenderController(
            { unit: workbook } as never,
            selectionService as never,
            cellAlertManagerService as never,
            { t: vi.fn((key: string) => key) } as never,
            { getConfig: vi.fn(() => ({})) } as never,
            { syncExecuteCommand: vi.fn(() => true) } as never,
            { getCurrentTypeOfUnit$: vi.fn(() => currentUnit$) } as never
        );

        expect(cellAlertManagerService.showAlert).not.toHaveBeenCalled();

        selectionService.currentSelectionParam = { unitId: 'unit-1', sheetId: 'sheet-1' };
        currentUnit$.next(workbook);
        expect(cellAlertManagerService.showAlert).toHaveBeenCalledTimes(1);

        selectionService.currentSelectionParam = { unitId: 'unit-2', sheetId: 'sheet-1' };
        currentUnit$.next({ getUnitId: () => 'unit-2' });
        expect(cellAlertManagerService.currentAlert.size).toBe(0);

        activeSheet = sheet2;
        selectionService.currentSelectionParam = { unitId: 'unit-1', sheetId: 'sheet-2' };
        currentUnit$.next(workbook);
        activeSheet$.next(sheet2);
        expect(cellAlertManagerService.currentAlert.size).toBe(0);

        controller.dispose();
    });
});

describe('AutoWidthController', () => {
    it('creates undo params from existing column widths', () => {
        expect(createAutoColWidthUndoMutationsByRedos({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ranges: [{ startColumn: 1, endColumn: 3, startRow: 0, endRow: 0 }],
            colWidth: { 1: 80, 2: 90, 3: 100 },
        }, {
            getColumnManager: () => ({
                getColumnWidth: (col: number) => col * 10,
            }),
        } as never)).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ranges: [{ startColumn: 1, endColumn: 3, startRow: 0, endRow: 0 }],
            colWidth: { 1: 10, 2: 20, 3: 30 },
        });
    });

    it('builds auto-width undo and redo mutations from calculated skeleton widths', () => {
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getColumnManager: () => ({
                getColumnWidth: (col: number) => col === 2 ? 88 : 66,
            }),
        };
        const controller = new AutoWidthController(
            {
                getRenderUnitById: vi.fn(() => ({
                    with: vi.fn(() => ({
                        getCurrentParam: vi.fn(() => ({
                            skeleton: {
                                calculateAutoWidthInRange: vi.fn(() => [
                                    { col: 2, width: 120 },
                                    { col: 3, width: 140 },
                                ]),
                            },
                        })),
                    })),
                })),
            } as never,
            {
                getUnit: vi.fn(() => ({
                    getUnitId: () => 'unit-1',
                    getSheetBySheetId: vi.fn(() => worksheet),
                })),
            } as never
        );

        expect(controller.getUndoRedoParamsOfColWidth({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ranges: [{ startColumn: 2, endColumn: 3, startRow: 0, endRow: 0 }],
        })).toEqual({
            undos: [{
                id: SetWorksheetColWidthMutation.id,
                params: {
                    unitId: 'unit-1',
                    subUnitId: 'sheet-1',
                    ranges: [{ startColumn: 2, endColumn: 3, startRow: 0, endRow: 0 }],
                    colWidth: { 2: 88, 3: 66 },
                },
            }],
            redos: [{
                id: SetWorksheetColWidthMutation.id,
                params: {
                    unitId: 'unit-1',
                    subUnitId: 'sheet-1',
                    ranges: [{ startColumn: 2, endColumn: 3, startRow: 0, endRow: 0 }],
                    colWidth: { 2: 120, 3: 140 },
                },
            }],
        });
    });
});
