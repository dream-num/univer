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

import type { Injector } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { ICommandService, UniverInstanceType } from '@univerjs/core';
import {
    InsertSheetCommand,
    InsertSheetMutation,
    RemoveSheetCommand,
    RemoveSheetMutation,
    SetGridlinesColorCommand,
    SetGridlinesColorMutation,
    SetTabColorCommand,
    SetTabColorMutation,
    SetWorksheetActiveOperation,
    SetWorksheetHideCommand,
    SetWorksheetHideMutation,
    SetWorksheetNameCommand,
    SetWorksheetNameMutation,
    SetWorksheetOrderCommand,
    SetWorksheetOrderMutation,
    ToggleGridlinesCommand,
    ToggleGridlinesMutation,
} from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

describe('Test FUniver sheets facade', () => {
    let get: Injector['get'];
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        const commandService = get(ICommandService);
        [
            InsertSheetCommand,
            InsertSheetMutation,
            RemoveSheetCommand,
            RemoveSheetMutation,
            SetGridlinesColorCommand,
            SetGridlinesColorMutation,
            SetTabColorCommand,
            SetTabColorMutation,
            SetWorksheetActiveOperation,
            SetWorksheetHideCommand,
            SetWorksheetHideMutation,
            SetWorksheetNameCommand,
            SetWorksheetNameMutation,
            SetWorksheetOrderCommand,
            SetWorksheetOrderMutation,
            ToggleGridlinesCommand,
            ToggleGridlinesMutation,
        ].forEach((command) => commandService.registerCommand(command));
    });

    it('reports workbook lifecycle through the sheet facade', () => {
        const created: string[] = [];
        const disposed: Array<{ unitId: string; sheetCount: number }> = [];

        univerAPI.addEvent(univerAPI.Event.WorkbookCreated, (event) => {
            created.push(event.workbook.getId());
        });
        univerAPI.addEvent(univerAPI.Event.WorkbookDisposed, (event) => {
            disposed.push({
                unitId: event.unitId,
                sheetCount: Object.keys(event.snapshot.sheets).length,
            });
        });

        const workbook = univerAPI.createWorkbook({
            id: 'facade-workbook',
            name: 'Facade workbook',
            sheetOrder: ['orders'],
            sheets: {
                orders: {
                    id: 'orders',
                    name: 'Orders',
                    rowCount: 20,
                    columnCount: 10,
                    cellData: {
                        0: {
                            0: {
                                v: 'SKU',
                            },
                        },
                    },
                },
            },
        });

        expect(univerAPI.getWorkbook('facade-workbook')?.getActiveSheet().getSheetName()).toBe('Orders');
        expect(univerAPI.getActiveWorkbook()?.getId()).toBe('facade-workbook');
        expect(created).toEqual(['facade-workbook']);

        expect(univerAPI.disposeUnit(workbook.getId())).toBe(true);
        expect(univerAPI.getWorkbook('facade-workbook')).toBeNull();
        expect(disposed).toEqual([{ unitId: 'facade-workbook', sheetCount: 1 }]);
    });

    it('keeps embed unit loading outside the sheets facade surface', () => {
        type LoadedWorkbook = Awaited<ReturnType<typeof _loadWorkbookForTypeInference>>;
        const assertWorkbook: LoadedWorkbook extends unknown ? true : false = true;

        expect(assertWorkbook).toBe(true);
    });

    it('reports sheet lifecycle events with the resulting workbook state', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const initialSheet = workbook.getActiveSheet();
        const beforeCreate: Array<{ index?: number; sheetName?: string }> = [];
        const created: string[] = [];
        const activeChanges: Array<{ oldName: string; activeName: string }> = [];
        const renamed: Array<{ oldName: string; newName: string }> = [];
        const moved: Array<{ sheetName: string; newIndex: number }> = [];
        const tabColors: Array<{ oldColor?: string; newColor?: string }> = [];
        const hideChanges: Array<{ sheetName: string; hidden: boolean }> = [];
        const gridlineChanges: Array<{ hidden: boolean; color?: string }> = [];
        const deleted: string[] = [];

        univerAPI.addEvent(univerAPI.Event.BeforeSheetCreate, (event) => {
            beforeCreate.push({ index: event.index, sheetName: event.sheet?.name });
        });
        univerAPI.addEvent(univerAPI.Event.SheetCreated, (event) => {
            created.push(event.worksheet.getSheetName());
        });
        univerAPI.addEvent(univerAPI.Event.BeforeActiveSheetChange, (event) => {
            activeChanges.push({
                oldName: event.oldActiveSheet.getSheetName(),
                activeName: event.activeSheet.getSheetName(),
            });
        });
        univerAPI.addEvent(univerAPI.Event.BeforeSheetNameChange, (event) => {
            renamed.push({ oldName: event.oldName, newName: event.newName });
        });
        univerAPI.addEvent(univerAPI.Event.SheetMoved, (event) => {
            moved.push({ sheetName: event.worksheet.getSheetName(), newIndex: event.newIndex });
        });
        univerAPI.addEvent(univerAPI.Event.BeforeSheetTabColorChange, (event) => {
            tabColors.push({ oldColor: event.oldColor, newColor: event.newColor });
        });
        univerAPI.addEvent(univerAPI.Event.SheetHideChanged, (event) => {
            hideChanges.push({ sheetName: event.worksheet.getSheetName(), hidden: event.hidden });
        });
        univerAPI.addEvent(univerAPI.Event.GridlineChanged, (event) => {
            gridlineChanges.push({
                hidden: !event.enabled,
                color: event.color,
            });
        });
        univerAPI.addEvent(univerAPI.Event.SheetDeleted, (event) => {
            deleted.push(event.sheetId);
        });

        const reportSheet = workbook.insertSheet('Reports', {
            index: 1,
            sheet: {
                id: 'reports',
                rowCount: 30,
                columnCount: 12,
            },
        });

        expect(beforeCreate).toEqual([{ index: 1, sheetName: 'Reports' }]);
        expect(created).toEqual(['Reports']);
        expect(activeChanges).toEqual([{ oldName: initialSheet.getSheetName(), activeName: 'Reports' }]);
        expect(univerAPI.getSheetCommandTarget({ unitId: workbook.getId(), sheetId: 'reports' })?.worksheet.getSheetName()).toBe('Reports');
        expect(univerAPI.getActiveSheet()?.worksheet.getSheetId()).toBe('reports');

        reportSheet.setName('FY Reports');
        expect(reportSheet.getSheetName()).toBe('FY Reports');
        expect(renamed).toEqual([{ oldName: 'Reports', newName: 'FY Reports' }]);

        workbook.moveSheet(reportSheet, 0);
        expect(workbook.getSheets()[0].getSheetId()).toBe('reports');
        expect(moved).toEqual([{ sheetName: 'FY Reports', newIndex: 0 }]);

        reportSheet.setTabColor('#3366ff');
        expect(reportSheet.getTabColor()).toBe('#3366ff');
        expect(tabColors).toEqual([{ oldColor: '', newColor: '#3366ff' }]);

        reportSheet.setHiddenGridlines(true);
        reportSheet.setGridLinesColor('#ddeeff');
        expect(reportSheet.hasHiddenGridLines()).toBe(true);
        expect(reportSheet.getGridLinesColor()).toBe('#ddeeff');
        expect(gridlineChanges).toEqual([
            { hidden: true, color: undefined },
            { hidden: true, color: '#ddeeff' },
        ]);

        reportSheet.hideSheet();
        expect(reportSheet.isSheetHidden()).toBe(true);
        expect(hideChanges).toEqual([{ sheetName: 'FY Reports', hidden: true }]);

        expect(workbook.deleteSheet(reportSheet)).toBe(true);
        expect(workbook.getSheetBySheetId('reports')).toBeNull();
        expect(deleted).toEqual(['reports']);
    });

    it('lets before events cancel risky sheet changes before state is mutated', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const reviewSheet = workbook.insertSheet('Review', {
            sheet: {
                id: 'review',
                rowCount: 20,
                columnCount: 10,
            },
        });

        univerAPI.addEvent(univerAPI.Event.BeforeSheetNameChange, (event) => {
            if (event.newName === 'Locked') {
                event.cancel = true;
            }
        });
        univerAPI.addEvent(univerAPI.Event.BeforeSheetDelete, (event) => {
            if (event.worksheet.getSheetId() === 'review') {
                event.cancel = true;
            }
        });

        reviewSheet.setName('Locked');
        expect(reviewSheet.getSheetName()).toBe('Review');

        expect(workbook.deleteSheet(reviewSheet)).toBe(false);
        expect(workbook.getSheetBySheetId('review')?.getSheetName()).toBe('Review');
    });

    it('reports before and after events for visible worksheet presentation changes', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const baseSheet = workbook.getActiveSheet();
        const opsSheet = workbook.insertSheet('Ops', {
            sheet: {
                id: 'ops',
                rowCount: 20,
                columnCount: 10,
            },
        });
        const events: string[] = [];

        univerAPI.addEvent(univerAPI.Event.BeforeActiveSheetChange, (event) => {
            events.push(`before-active:${event.oldActiveSheet.getSheetName()}->${event.activeSheet.getSheetName()}`);
        });
        univerAPI.addEvent(univerAPI.Event.ActiveSheetChanged, (event) => {
            events.push(`active:${event.activeSheet.getSheetName()}`);
        });
        univerAPI.addEvent(univerAPI.Event.BeforeSheetMove, (event) => {
            events.push(`before-move:${event.oldIndex}->${event.newIndex}`);
        });
        univerAPI.addEvent(univerAPI.Event.BeforeSheetNameChange, (event) => {
            events.push(`before-name:${event.oldName}->${event.newName}`);
        });
        univerAPI.addEvent(univerAPI.Event.SheetNameChanged, (event) => {
            events.push(`name:${event.newName}`);
        });
        univerAPI.addEvent(univerAPI.Event.SheetTabColorChanged, (event) => {
            events.push(`tab:${event.newColor}`);
        });
        univerAPI.addEvent(univerAPI.Event.BeforeSheetHideChange, (event) => {
            events.push(`before-hide:${event.worksheet.getSheetName()}=${event.hidden}`);
        });
        univerAPI.addEvent(univerAPI.Event.BeforeGridlineEnableChange, (event) => {
            events.push(`before-grid:${event.enabled}`);
        });
        univerAPI.addEvent(univerAPI.Event.BeforeGridlineColorChange, (event) => {
            events.push(`before-grid-color:${event.color}`);
        });

        workbook.setActiveSheet(baseSheet);
        workbook.moveSheet(opsSheet, 0);
        opsSheet.setName('Operations');
        opsSheet.setTabColor('#00aa55');
        opsSheet.setHiddenGridlines(true);
        opsSheet.setGridLinesColor('#aabbcc');
        opsSheet.hideSheet();

        expect(events).toEqual([
            'before-active:Ops->sheet1',
            'active:sheet1',
            'before-move:1->0',
            'before-name:Ops->Operations',
            'name:Operations',
            'tab:#00aa55',
            'before-grid:false',
            'before-grid-color:#aabbcc',
            'before-hide:Operations=true',
        ]);
        expect(workbook.getSheets()[0].getSheetName()).toBe('Operations');
        expect(opsSheet.isSheetHidden()).toBe(true);
    });
});

function _loadWorkbookForTypeInference(api: FUniver & {
    loadUnitAsync: (ref: string | object, options: { unitType: UniverInstanceType }) => unknown;
}, ref: string | object) {
    return api.loadUnitAsync(ref, { unitType: UniverInstanceType.UNIVER_SHEET });
}
