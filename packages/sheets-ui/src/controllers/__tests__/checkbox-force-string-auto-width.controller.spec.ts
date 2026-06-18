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
import { INTERCEPTOR_POINT, SetWorksheetColWidthMutation, ToggleCellCheckboxCommand } from '@univerjs/sheets';
import { Subject } from 'rxjs';
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
        const currentRichText$ = new Subject<any>();
        const currentClickedCell$ = new Subject<any>();
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
        let interceptor: any;
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

        const result = interceptor.handler(rawCell, {
            rawData: rawCell,
            workbook,
        }, (cell: unknown) => cell);

        expect(result).not.toBe(rawCell);
        expect(result.markers.tl).toEqual({ size: 6, color: '#409f11' });

        expect(interceptor.handler({ ...rawCell, s: 'text' }, {
            rawData: { ...rawCell, s: 'text' },
            workbook,
        }, (cell: unknown) => cell)).not.toHaveProperty('markers');

        controller.dispose();
    });
});

describe('ForceStringAlertRenderController', () => {
    it('shows and hides force-string alert based on hovered cell value and format', () => {
        const currentCell$ = new Subject<any>();
        const cellAlertManagerService = {
            currentAlert: new Map(),
            showAlert: vi.fn((alert) => {
                cellAlertManagerService.currentAlert.set(alert.key, { alert });
            }),
            removeAlert: vi.fn((key) => cellAlertManagerService.currentAlert.delete(key)),
        };
        const worksheet = {
            getCell: vi.fn((row: number) => row === 1
                ? { v: '123', t: CellValueType.STRING }
                : { v: '123', t: CellValueType.STRING, s: 'text' }),
        };
        const workbook = {
            getActiveSheet: vi.fn(() => worksheet),
            getStyles: vi.fn(() => ({
                get: vi.fn((styleId: string) => styleId === 'text' ? { n: { pattern: '@' } } : undefined),
            })),
        };
        const controller = new ForceStringAlertRenderController(
            { unit: workbook } as never,
            { currentCell$ } as never,
            cellAlertManagerService as never,
            { t: vi.fn((key: string) => key) } as never,
            { getConfig: vi.fn(() => ({ disableForceStringAlert: false })) } as never
        );

        currentCell$.next({ location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 1, col: 2 } });
        expect(cellAlertManagerService.showAlert).toHaveBeenCalledWith(expect.objectContaining({
            type: CellAlertType.ERROR,
            title: 'sheets-ui.info.error',
            message: 'sheets-ui.info.forceStringInfo',
            width: 200,
            height: 74,
            key: 'SHEET_FORCE_STRING_ALERT',
        }));

        currentCell$.next({ location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 2, col: 2 } });
        expect(cellAlertManagerService.removeAlert).toHaveBeenCalledWith('SHEET_FORCE_STRING_ALERT');
        currentCell$.next(null);
        expect(cellAlertManagerService.removeAlert).toHaveBeenCalledTimes(2);

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
                getRenderById: vi.fn(() => ({
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
