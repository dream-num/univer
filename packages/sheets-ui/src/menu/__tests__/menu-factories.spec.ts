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

import type { IRange, Univer, Workbook } from '@univerjs/core';
import type { Observable } from 'rxjs';
import {
    BooleanNumber,
    BorderStyleTypes,
    FOCUSING_COMMON_DRAWINGS,
    ICommandService,
    IContextService,
    Injector,

    IUniverInstanceService,
    RANGE_TYPE,
    UniverInstanceType,
} from '@univerjs/core';
import {
    BorderStyleManagerService,
    IExclusiveRangeService,
    MergeCellController,
    SetBorderBasicCommand,
    SetBorderCommand,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetHideCommand,
    SheetsSelectionsService,
    ToggleGridlinesCommand,
    ToggleGridlinesMutation,
} from '@univerjs/sheets';
import { firstValueFrom, of, skip, take } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    SetRangeFontDecreaseCommand,
    SetRangeFontIncreaseCommand,
    SetRangeFontSizeCommand,
} from '../../commands/commands/inline-format.command';
import { ShowMenuListCommand } from '../../commands/commands/unhide.command';
import { CellBorderSelectorMenuItemFactory } from '../border.menu';
import {
    FontSizeDecreaseMenuItemFactory,
    FontSizeIncreaseMenuItemFactory,
    FontSizeSelectorMenuItemFactory,
} from '../font.menu';
import { ToggleGridlinesMenuFactory } from '../gridlines.menu';
import {
    ColInsertMenuItemFactory,
    InsertColAfterMenuItemFactory,
    InsertColBeforeMenuItemFactory,
    InsertColLeftCellMenuItemFactory,
    InsertMultiColsLeftHeaderMenuItemFactory,
    InsertMultiColsRightHeaderMenuItemFactory,
    InsertMultiRowsAboveHeaderMenuItemFactory,
    InsertMultiRowsAfterHeaderMenuItemFactory,
    InsertRangeMoveDownMenuItemFactory,
    InsertRangeMoveRightMenuItemFactory,
    InsertRowAfterMenuItemFactory,
    InsertRowBeforeCellMenuItemFactory,
    InsertRowBeforeMenuItemFactory,
    RowInsertMenuItemFactory,
} from '../insert.menu';
import { CellMergeMenuItemFactory } from '../merge.menu';
import {
    ChangeColorSheetMenuItemFactory,
    CopySheetMenuItemFactory,
    DeleteSheetMenuItemFactory,
    HideSheetMenuItemFactory,
    RenameSheetMenuItemFactory,
    ShowMenuItemFactory,
    UnHideSheetMenuItemFactory,
} from '../sheet.menu';
import { createMenuTestBed } from './create-menu-test-bed';

describe('menu factories', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionService: SheetsSelectionsService;

    beforeEach(() => {
        const testBed = createMenuTestBed();
        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        selectionService = get(SheetsSelectionsService);
        commandService.registerCommand(SetSelectionsOperation);
    });

    afterEach(() => {
        univer.dispose();
    });

    function createSelection(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        return {
            range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
            primary: {
                startRow,
                startColumn,
                endRow,
                endColumn,
                actualRow: startRow,
                actualColumn: startColumn,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        };
    }

    function setSelections(ranges: IRange[]) {
        selectionService.setSelections(ranges.map((range) => createSelection(range.startRow, range.startColumn, range.endRow, range.endColumn)), 2);
    }

    function setSingleSelection(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        setSelections([{ startRow, startColumn, endRow, endColumn }]);
    }

    it('creates base insert selectors and header insert commands', async () => {
        const injector = get(Injector);
        const colInsert = injector.invoke(ColInsertMenuItemFactory);
        const rowInsert = injector.invoke(RowInsertMenuItemFactory);
        const insertRowBefore = injector.invoke(InsertRowBeforeMenuItemFactory);
        const insertRowAfter = injector.invoke(InsertRowAfterMenuItemFactory);
        const insertColBefore = injector.invoke(InsertColBeforeMenuItemFactory);
        const insertColAfter = injector.invoke(InsertColAfterMenuItemFactory);
        const insertMoveRight = injector.invoke(InsertRangeMoveRightMenuItemFactory);
        const insertMoveDown = injector.invoke(InsertRangeMoveDownMenuItemFactory);

        expect(colInsert.id).toBe('sheet.menu.col-insert');
        expect(rowInsert.id).toBe('sheet.menu.row-insert');
        expect(insertRowBefore.id).toBe('sheet.command.insert-row-before');
        expect(insertRowAfter.id).toBe('sheet.command.insert-row-after');
        expect(insertColBefore.id).toBe('sheet.command.insert-col-before');
        expect(insertColAfter.id).toBe('sheet.command.insert-col-after');
        expect(insertMoveRight.id).toBe('sheet.command.insert-range-move-right-confirm');
        expect(insertMoveDown.id).toBe('sheet.command.insert-range-move-down-confirm');

        expect(await firstValueFrom(colInsert.hidden$!.pipe(take(1)))).toBeTypeOf('boolean');
        expect(await firstValueFrom(rowInsert.hidden$!.pipe(take(1)))).toBeTypeOf('boolean');
    });

    it('computes row-based insert input menu values from current selection height', async () => {
        setSingleSelection(2, 1, 5, 4);
        const injector = get(Injector);
        const beforeCell = injector.invoke(InsertRowBeforeCellMenuItemFactory);
        const rowsAfter = injector.invoke(InsertMultiRowsAfterHeaderMenuItemFactory);
        const rowsAbove = injector.invoke(InsertMultiRowsAboveHeaderMenuItemFactory);

        expect(await firstValueFrom(beforeCell.value$!.pipe(take(1)))).toBe(4);
        expect(await firstValueFrom(rowsAfter.value$!.pipe(take(1)))).toBe(4);
        expect(await firstValueFrom(rowsAbove.value$!.pipe(take(1)))).toBe(4);
    });

    it('computes column-based insert input menu values from current selection width', async () => {
        setSingleSelection(1, 3, 4, 7);
        const injector = get(Injector);
        const leftCell = injector.invoke(InsertColLeftCellMenuItemFactory);
        const colsLeft = injector.invoke(InsertMultiColsLeftHeaderMenuItemFactory);
        const colsRight = injector.invoke(InsertMultiColsRightHeaderMenuItemFactory);

        expect(await firstValueFrom(leftCell.value$!.pipe(take(1)))).toBe(5);
        expect(await firstValueFrom(colsLeft.value$!.pipe(take(1)))).toBe(5);
        expect(await firstValueFrom(colsRight.value$!.pipe(take(1)))).toBe(5);
    });

    it('creates sheet menu items and resolves default disable states', async () => {
        const injector = get(Injector);
        const deleteSheet = injector.invoke(DeleteSheetMenuItemFactory);
        const copySheet = injector.invoke(CopySheetMenuItemFactory);
        const renameSheet = injector.invoke(RenameSheetMenuItemFactory);
        const colorSheet = injector.invoke(ChangeColorSheetMenuItemFactory);
        const hideSheet = injector.invoke(HideSheetMenuItemFactory);
        const unhideSheet = injector.invoke(UnHideSheetMenuItemFactory);
        const showMenu = injector.invoke(ShowMenuItemFactory);

        expect(deleteSheet.id).toBe('sheet.command.remove-sheet-confirm');
        expect(copySheet.id).toBe('sheet.command.copy-sheet');
        expect(renameSheet.id).toBe('sheet.operation.rename-sheet');
        expect(colorSheet.id).toBe('sheet.command.set-tab-color');
        expect(hideSheet.id).toBe(SetWorksheetHideCommand.id);
        expect(unhideSheet.id).toBe('sheet.command.set-worksheet-show');
        expect(showMenu.id).toBe(ShowMenuListCommand.id);

        expect(await firstValueFrom(deleteSheet.disabled$!.pipe(take(1)))).toBe(true);
        expect(await firstValueFrom(hideSheet.disabled$!.pipe(take(1)))).toBe(true);
        expect(await firstValueFrom(unhideSheet.disabled$!.pipe(take(1)))).toBe(true);
        expect(await firstValueFrom(showMenu.disabled$!.pipe(take(1)))).toBe(true);
        expect(await firstValueFrom((unhideSheet.selections as Observable<unknown[]>).pipe(take(1)))).toEqual([]);
    });

    it('updates gridlines menu activation after toggling sheet gridlines', async () => {
        const injector = get(Injector);
        const instanceService = get(IUniverInstanceService);
        commandService.registerCommand(ToggleGridlinesCommand);
        commandService.registerCommand(ToggleGridlinesMutation);

        const menuItem = injector.invoke(ToggleGridlinesMenuFactory);
        const worksheet = instanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet();
        const initial = await firstValueFrom(menuItem.activated$!.pipe(take(1)));
        expect(await firstValueFrom(menuItem.disabled$!.pipe(take(1)))).toBeTypeOf('boolean');

        expect(await commandService.executeCommand(ToggleGridlinesCommand.id)).toBe(true);
        const activatedAfterToggle = await firstValueFrom(menuItem.activated$!.pipe(take(1)));
        expect(activatedAfterToggle).toBe(worksheet.getConfig().showGridlines === BooleanNumber.TRUE);
        expect(activatedAfterToggle).not.toBe(initial);
    });

    it('updates border menu icon and hidden state from real border commands', async () => {
        const injector = get(Injector);
        const contextService = get(IContextService);
        setSingleSelection(0, 0, 1, 1);

        injector.add([BorderStyleManagerService]);
        commandService.registerCommand(SetBorderBasicCommand);
        commandService.registerCommand(SetBorderCommand);
        commandService.registerCommand(SetRangeValuesMutation);

        const menuItem = injector.invoke(CellBorderSelectorMenuItemFactory);
        expect(await firstValueFrom((menuItem.icon as Observable<string>).pipe(take(1)))).toBe('AllBorderIcon');
        expect(await firstValueFrom(menuItem.disabled$!.pipe(take(1)))).toBe(false);

        const nextIcon = firstValueFrom((menuItem.icon as Observable<string>).pipe(skip(1), take(1)));
        expect(await commandService.executeCommand(SetBorderBasicCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{ startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 }],
            value: { type: 'top', color: '#123456', style: BorderStyleTypes.DASHED },
        })).toBe(true);
        expect(await nextIcon).toBe('UpBorderDoubleIcon');
        expect(get(BorderStyleManagerService).getBorderInfo().type).toBe('top');

        const hiddenState = firstValueFrom(menuItem.hidden$!.pipe(skip(1), take(1)));
        contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);
        expect(await hiddenState).toBe(true);
    });

    it('disables merge menu for overlapping multi-selections and hides it while drawing is focused', async () => {
        const injector = get(Injector);
        const contextService = get(IContextService);
        injector.add([IExclusiveRangeService, { useValue: {
            exclusiveRangesChange$: of({ unitId: 'test', subUnitId: 'sheet1', ranges: [] }),
            addExclusiveRange: () => {},
            getExclusiveRanges: () => undefined,
            clearExclusiveRanges: () => {},
            clearExclusiveRangesByGroupId: () => {},
            getInterestGroupId: () => [],
        } }]);
        injector.add([MergeCellController]);

        setSingleSelection(0, 0, 1, 1);
        const menuItem = injector.invoke(CellMergeMenuItemFactory);
        expect(await firstValueFrom(menuItem.disabled$!.pipe(take(1)))).toBe(false);
        expect(await firstValueFrom(menuItem.hidden$!.pipe(take(1)))).toBeTypeOf('boolean');

        setSelections([
            { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 },
            { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 },
        ]);
        expect(await firstValueFrom(menuItem.disabled$!.pipe(take(1)))).toBe(true);

        const hiddenState = firstValueFrom(menuItem.hidden$!.pipe(skip(1), take(1)));
        contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);
        expect(await hiddenState).toBe(true);
    });

    it('creates font-size menu items and exposes selector current value stream', async () => {
        setSingleSelection(0, 0, 0, 0);
        const injector = get(Injector);
        const sizeSelector = injector.invoke(FontSizeSelectorMenuItemFactory);
        const increase = injector.invoke(FontSizeIncreaseMenuItemFactory);
        const decrease = injector.invoke(FontSizeDecreaseMenuItemFactory);

        expect(sizeSelector.id).toBe(SetRangeFontSizeCommand.id);
        expect(increase.id).toBe(SetRangeFontIncreaseCommand.id);
        expect(decrease.id).toBe(SetRangeFontDecreaseCommand.id);
        expect(await firstValueFrom(sizeSelector.value$!.pipe(take(1)))).toBeTypeOf('number');
        expect(await firstValueFrom(sizeSelector.disabled$!.pipe(take(1)))).toBeTypeOf('boolean');
    });
});
