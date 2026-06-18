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
    ContextService,
    DesktopLogService,
    Direction,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    ObjectMatrix,
    UniverInstanceService,
    Workbook,
} from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getNextPrimaryCell } from '../move-active-cell-util';
import { WorkbookSelectionModel } from '../selection-data-model';
import { SheetsSelectionsService } from '../selection.service';
import { SelectionMoveType } from '../type';

function createService() {
    const injector = new Injector();
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([SheetsSelectionsService]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    const workbook = injector.createInstance(Workbook, {
        id: 'unit-1',
        sheets: { 'sheet-1': { id: 'sheet-1' } },
        sheetOrder: ['sheet-1'],
    });
    univerInstanceService.__addUnit(workbook);
    univerInstanceService.focusUnit('unit-1');

    return injector.get(SheetsSelectionsService);
}

describe('SheetsSelectionsService', () => {
    it('sets and clears the active worksheet selections', () => {
        const service = createService();
        const selection = {
            range: { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 },
            primary: { actualRow: 1, actualColumn: 2, startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 },
        };

        service.setSelections([selection] as never);

        expect(service.getCurrentSelections()).toEqual([selection]);
        expect(service.getCurrentLastSelectionPrimaryCell()).toEqual(selection.primary);

        service.clearCurrentSelections();
        expect(service.getCurrentSelections()).toEqual([]);
    });

    it('detects overlapping selections on the active sheet', () => {
        const service = createService();

        service.setSelections([{
            range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            primary: null,
        }, {
            range: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
            primary: null,
        }] as never);

        expect(service.isOverlapping()).toBe(true);
    });

    it('adds explicit worksheet selections and clears all workbook selections', () => {
        const service = createService();
        const selection = {
            range: { startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 },
            primary: { actualRow: 3, actualColumn: 4, startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 },
        };

        service.addSelections('unit-1', 'sheet-1', [selection] as never);
        expect(service.getCurrentLastSelection()).toEqual(selection);
        expect(service.getWorkbookSelections('unit-1').getSelectionsOfWorksheet('sheet-1')).toEqual([selection]);

        service.clear();
        expect(service.getCurrentSelections()).toEqual([]);
    });

    it('summarizes common cell style values and detects mixed values', () => {
        const injector = new Injector();
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([SheetsSelectionsService]);
        const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
        const workbook = injector.createInstance(Workbook, {
            id: 'unit-1',
            sheets: { 'sheet-1': { id: 'sheet-1' } },
            sheetOrder: ['sheet-1'],
        });
        const worksheet = workbook.getSheetBySheetId('sheet-1')!;
        const styles = new Map<string, unknown>([
            ['0_0', { cl: { rgb: '#f00' } }],
            ['0_1', { cl: { rgb: '#f00' } }],
            ['1_0', { cl: { rgb: '#0f0' } }],
        ]);
        worksheet.getComposedCellStyle = ((row: number, col: number) => styles.get(`${row}_${col}`) || {}) as never;
        univerInstanceService.__addUnit(workbook);
        univerInstanceService.focusUnit('unit-1');
        const service = injector.get(SheetsSelectionsService);

        service.setSelections([{ range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 }, primary: null }] as never);
        expect(service.getCellStylesProperty('cl')).toEqual({ isAllValuesSame: true, value: { rgb: '#f00' } });

        service.setSelections([{ range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 }, primary: null }] as never);
        expect(service.getCellStylesProperty('cl')).toEqual({ isAllValuesSame: false, value: null });
    });
});

describe('WorkbookSelectionModel', () => {
    it('emits selection events by move type and remembers the last primary cell per worksheet', () => {
        const workbook = {
            getActiveSheet: () => ({ getSheetId: () => 'sheet-1' }),
        };
        const model = new WorkbookSelectionModel(workbook as never);
        const moveStarts: unknown[] = [];
        const moving: unknown[] = [];
        const moveEnds: unknown[] = [];
        const sets: unknown[] = [];
        model.selectionMoveStart$.subscribe((value) => moveStarts.push(value));
        model.selectionMoving$.subscribe((value) => moving.push(value));
        model.selectionMoveEnd$.subscribe((value) => moveEnds.push(value));
        model.selectionSet$.subscribe((value) => sets.push(value));
        const selection = {
            range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
            primary: { actualRow: 1, actualColumn: 1, startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
        };

        model.setSelections('sheet-1', [selection] as never, SelectionMoveType.MOVE_START);
        model.setSelections('sheet-1', [selection] as never, SelectionMoveType.MOVING);
        model.setSelections('sheet-1', [selection] as never, SelectionMoveType.MOVE_END);
        model.addSelections('sheet-1', [selection] as never);

        expect(moveStarts).toEqual([[selection]]);
        expect(moving).toEqual([[selection]]);
        expect(moveEnds.at(-1)).toEqual([selection]);
        expect(sets.at(-1)).toEqual([selection, selection]);
        expect(model.getCurrentLastSelection()).toEqual(selection);
        expect(model.getLastSelectionPrimaryCellOfWorksheet('sheet-1')).toEqual(selection.primary);

        model.deleteSheetSelection('sheet-1');
        expect(model.getSelectionsOfWorksheet('sheet-1')).toEqual([]);
        model.dispose();
    });
});

describe('getNextPrimaryCell', () => {
    function createWorksheet() {
        return {
            getMaxRows: () => 10,
            getMaxColumns: () => 10,
            getRowVisible: (row: number) => row !== 2,
            getColVisible: (col: number) => col !== 2,
            getMergedCell: (row: number, col: number) => row === 1 && col === 1 ? { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } : null,
            getMatrixWithMergedCells: (startRow: number, startColumn: number) => {
                const matrix = new ObjectMatrix();
                matrix.setValue(startRow, startColumn, {});
                return matrix;
            },
        };
    }

    it('moves the primary cell through visible rows and columns', () => {
        const worksheet = createWorksheet();
        const selection = {
            range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 3 },
            primary: { actualRow: 0, actualColumn: 0, startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
        };

        expect(getNextPrimaryCell([selection] as never, Direction.RIGHT, worksheet as never)).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 1,
            endColumn: 1,
        });
        expect(getNextPrimaryCell([{ ...selection, primary: { ...selection.primary, startColumn: 3, endColumn: 3 } }] as never, Direction.DOWN, worksheet as never)).toEqual({
            startRow: 1,
            endRow: 1,
            startColumn: 3,
            endColumn: 3,
        });
        expect(getNextPrimaryCell([] as never, Direction.RIGHT, worksheet as never)).toBeNull();
    });

    it('jumps between selections when the active selection is a single cell', () => {
        const worksheet = createWorksheet();
        const selections = [
            {
                range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                primary: { actualRow: 0, actualColumn: 0, startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            },
            {
                range: { startRow: 4, endRow: 4, startColumn: 4, endColumn: 4 },
                primary: null,
            },
        ];

        expect(getNextPrimaryCell(selections as never, Direction.RIGHT, worksheet as never)).toEqual({
            startRow: 4,
            endRow: 4,
            startColumn: 4,
            endColumn: 4,
        });
        expect(getNextPrimaryCell(selections as never, Direction.LEFT, worksheet as never)).toEqual({
            startRow: 4,
            endRow: 4,
            startColumn: 4,
            endColumn: 4,
        });
    });
});
