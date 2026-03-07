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

import type { Univer } from '@univerjs/core';
import {
    ICommandService,
    Injector,
    RANGE_TYPE,
} from '@univerjs/core';
import { SetSelectionsOperation, SetWorksheetHideCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { firstValueFrom, take } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    SetRangeFontDecreaseCommand,
    SetRangeFontIncreaseCommand,
    SetRangeFontSizeCommand,
} from '../../../commands/commands/inline-format.command';
import { ShowMenuListCommand } from '../../../commands/commands/unhide.command';
import {
    FontSizeDecreaseMenuItemFactory,
    FontSizeIncreaseMenuItemFactory,
    FontSizeSelectorMenuItemFactory,
} from '../font.menu';
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
    let get: any;
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

    function setSingleSelection(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        selectionService.setSelections([
            {
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
            },
        ]);
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
        expect(await firstValueFrom((unhideSheet.selections as any).pipe(take(1)))).toEqual([]);
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
