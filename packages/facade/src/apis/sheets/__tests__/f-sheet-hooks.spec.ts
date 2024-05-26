/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellData, IStyleData, Nullable, UnitModel, Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SetHorizontalTextAlignCommand, SetRangeValuesCommand, SetRangeValuesMutation, SetStyleCommand, SetTextWrapCommand, SetVerticalTextAlignCommand } from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it } from 'vitest';
import { Subject } from 'rxjs';

import type { IDragCellPosition, IHoverCellPosition } from '@univerjs/sheets-ui';
import { DragManagerService, HoverManagerService } from '@univerjs/sheets-ui';
import type { FUniver } from '../../facade';
import { createFacadeTestBed } from '../../__tests__/create-test-bed';
import { FSheetHooks } from '../f-sheet-hooks';

class MockDataTransfer implements DataTransfer {
    effectAllowed: 'none' | 'copy' | 'link' | 'move' | 'all' | 'copyLink' | 'copyMove' | 'linkMove' | 'uninitialized';
    files: FileList;
    items: DataTransferItemList;
    types: readonly string[];
    clearData(format?: string | undefined): void {
        throw new Error('Method not implemented.');
    }

    getData(format: string): string {
        throw new Error('Method not implemented.');
    }

    setData(format: string, data: string): void {
        throw new Error('Method not implemented.');
    }

    dropEffect: 'none' | 'copy' | 'link' | 'move' = 'none';
    setDragImage(image: Element, x: number, y: number): void {
        throw new Error('Method not implemented.');
    }
}

describe('Test FSheetHooks', () => {
    let get: Injector['get'];
    let injector: Injector;
    let commandService: ICommandService;
    let univerAPI: FUniver;
    let sheet: UnitModel<Workbook>;
    let getValueByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<ICellData>;
    let getStyleByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<IStyleData>;
    let mockHoverManagerService: Partial<HoverManagerService>;
    let mockDragManagerService: Partial<DragManagerService>;
    let hoverCurrentCell$: Subject<Nullable<IHoverCellPosition>>;
    let hoverCurrentPosition$: Subject<Nullable<IHoverCellPosition>>;
    let dragCurrentCell$: Subject<Nullable<IDragCellPosition>>;
    let dragEndCell$: Subject<Nullable<IDragCellPosition>>;
    let sheetHooks: FSheetHooks;
    let workbook: Workbook;

    beforeEach(() => {
        // Initialize the subject
        hoverCurrentCell$ = new Subject<Nullable<IHoverCellPosition>>();
        hoverCurrentPosition$ = new Subject<Nullable<IHoverCellPosition>>();
        dragCurrentCell$ = new Subject<Nullable<IDragCellPosition>>();
        dragEndCell$ = new Subject<Nullable<IDragCellPosition>>();

        // Create a mock HoverManagerService with currentCell$
        mockHoverManagerService = {
            currentCell$: hoverCurrentCell$.asObservable(),
            currentPosition$: hoverCurrentPosition$.asObservable(),
        };

        // Create a mock DragManagerService with currentCell$
        mockDragManagerService = {
            currentCell$: dragCurrentCell$.asObservable(),
            endCell$: dragEndCell$.asObservable(),
        };

        const testBed = createFacadeTestBed(undefined, [
            [HoverManagerService, { useValue: mockHoverManagerService }],
            [DragManagerService, { useValue: mockDragManagerService }],
        ]);
        get = testBed.get;
        injector = testBed.injector;
        univerAPI = testBed.univerAPI;
        sheet = testBed.sheet;
        workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetVerticalTextAlignCommand);
        commandService.registerCommand(SetHorizontalTextAlignCommand);
        commandService.registerCommand(SetTextWrapCommand);

        getValueByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValue();

        getStyleByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<IStyleData> => {
            const value = getValueByPosition(startRow, startColumn, endRow, endColumn);
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
            if (value && styles) {
                return styles.getStyleByCell(value);
            }
        };

        sheetHooks = injector.createInstance(FSheetHooks);
    });

    it('Test onCellPointerMove', () => {
        sheetHooks.onCellPointerMove((cellPos) => {
            expect(cellPos).toEqual({ location: { workbook, worksheet, unitId: workbook.getUnitId(), subUnitId: worksheet.getSheetId(), row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 } });
        });

        // Trigger the Observable to emit a new value
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        hoverCurrentPosition$.next({ location: { workbook, worksheet, unitId, subUnitId, row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 } });
    });

    it('Test onCellPointerOver', () => {
        sheetHooks.onCellPointerOver((cellPos) => {
            expect(cellPos).toEqual({ location: { workbook, worksheet, unitId: workbook.getUnitId(), subUnitId: worksheet.getSheetId(), row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 } });
        });

        // Trigger the Observable to emit a new value
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        hoverCurrentCell$.next({ location: { workbook, worksheet, unitId, subUnitId, row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 } });
    });

    it('Test onCellDragOver', () => {
        sheetHooks.onCellDragOver((cellPos) => {
            expect(cellPos).toEqual({ location: { workbook, worksheet, unitId: workbook.getUnitId(), subUnitId: worksheet.getSheetId(), row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 }, dataTransfer: new MockDataTransfer() });
        });

        // Trigger the Observable to emit a new value
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        dragCurrentCell$.next({ location: { workbook, worksheet, unitId, subUnitId, row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 }, dataTransfer: new MockDataTransfer() });
    });

    it('Test onCellDrop', () => {
        sheetHooks.onCellDrop((cellPos) => {
            expect(cellPos).toEqual({ location: { workbook, worksheet, unitId: workbook.getUnitId(), subUnitId: worksheet.getSheetId(), row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 }, dataTransfer: new MockDataTransfer() });
        });

        // Trigger the Observable to emit a new value
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        dragEndCell$.next({ location: { workbook, worksheet, unitId, subUnitId, row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 }, dataTransfer: new MockDataTransfer() });
    });
});
