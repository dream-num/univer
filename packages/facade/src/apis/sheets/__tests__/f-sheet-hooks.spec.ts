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

import type { ICellData, Injector, IStyleData, Nullable, Workbook } from '@univerjs/core';
import type { IDragCellPosition, IEditorBridgeServiceVisibleParam, IHoverCellPosition } from '@univerjs/sheets-ui';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';

import { EditorService, IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { IRefSelectionsService, RefSelectionsService, SetHorizontalTextAlignCommand, SetRangeValuesCommand, SetRangeValuesMutation, SetStyleCommand, SetTextWrapCommand, SetVerticalTextAlignCommand } from '@univerjs/sheets';
import { DragManagerService, EditorBridgeService, HoverManagerService, IEditorBridgeService, SetCellEditVisibleOperation } from '@univerjs/sheets-ui';
import { KeyCode } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from '../../__tests__/create-test-bed';
import { FSheetHooks } from '../../everything';

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
            [IEditorBridgeService, { useClass: EditorBridgeService }],
            [IEditorService, { useClass: EditorService }],
            [DocSelectionManagerService],
            [IRefSelectionsService, { useClass: RefSelectionsService }],
        ]);
        get = testBed.get;
        injector = testBed.injector;
        workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetVerticalTextAlignCommand);
        commandService.registerCommand(SetHorizontalTextAlignCommand);
        commandService.registerCommand(SetTextWrapCommand);

        // onCellEditBefore
        commandService.registerCommand(SetCellEditVisibleOperation);

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
        const worksheet = workbook.getActiveSheet()!;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        hoverCurrentPosition$.next({ location: { workbook, worksheet, unitId, subUnitId, row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 } });
    });

    it('Test onCellPointerOver', () => {
        sheetHooks.onCellPointerOver((cellPos) => {
            expect(cellPos).toEqual({ location: { workbook, worksheet, unitId: workbook.getUnitId(), subUnitId: worksheet.getSheetId(), row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 } });
        });

        // Trigger the Observable to emit a new value
        const worksheet = workbook.getActiveSheet()!;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        hoverCurrentCell$.next({ location: { workbook, worksheet, unitId, subUnitId, row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 } });
    });

    it('Test onCellDragOver', () => {
        sheetHooks.onCellDragOver((cellPos) => {
            expect(cellPos).toEqual({ location: { workbook, worksheet, unitId: workbook.getUnitId(), subUnitId: worksheet.getSheetId(), row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 }, dataTransfer: new MockDataTransfer() });
        });

        // Trigger the Observable to emit a new value
        const worksheet = workbook.getActiveSheet()!;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        dragCurrentCell$.next({ location: { workbook, worksheet, unitId, subUnitId, row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 }, dataTransfer: new MockDataTransfer() });
    });

    it('Test onCellDrop', () => {
        sheetHooks.onCellDrop((cellPos) => {
            expect(cellPos).toEqual({ location: { workbook, worksheet, unitId: workbook.getUnitId(), subUnitId: worksheet.getSheetId(), row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 }, dataTransfer: new MockDataTransfer() });
        });

        // Trigger the Observable to emit a new value
        const worksheet = workbook.getActiveSheet()!;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        dragEndCell$.next({ location: { workbook, worksheet, unitId, subUnitId, row: 0, col: 0 }, position: { startX: 0, endX: 1, startY: 0, endY: 1 }, dataTransfer: new MockDataTransfer() });
    });

    it('Test onCellRender', () => {
        sheetHooks.onCellRender([{
            drawWith: (ctx, info, skeleton, spreadsheets) => {
                const { row, col } = info;
                // Update to any cell location you want
                if (row === 1 && col === 1) {
                    const { primaryWithCoord } = info;
                    const { startX, startY } = primaryWithCoord;
                    ctx.fillText('✅', startX, startY + 10);

                    expect(info.unitId).toEqual(workbook.getUnitId());
                    expect(info.subUnitId).toEqual(workbook.getActiveSheet().getSheetId());
                }
            },
        }]);
    });

    it('Test onBeforeCellEdit', () => {
        const commandParams: IEditorBridgeServiceVisibleParam = {
            visible: true,
            eventType: DeviceInputEventType.Dblclick,
            unitId: workbook.getUnitId(),
        };

        sheetHooks.onBeforeCellEdit((params) => {
            expect(params).toEqual(commandParams);
        });

        commandService.executeCommand(SetCellEditVisibleOperation.id, commandParams);
    });

    it('Test onAfterCellEdit', () => {
        const commandParams: IEditorBridgeServiceVisibleParam = {
            visible: false,
            eventType: DeviceInputEventType.Keyboard,
            unitId: workbook.getUnitId(),
            keycode: KeyCode.ENTER,
        };

        sheetHooks.onAfterCellEdit((params) => {
            expect(params).toEqual(commandParams);
        });

        commandService.executeCommand(SetCellEditVisibleOperation.id, commandParams);
    });
});
