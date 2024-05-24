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

import type { Univer, Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, RANGE_TYPE, RedoCommand, UndoCommand, UniverInstanceType } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { SetWorksheetColWidthMutation } from '../../mutations/set-worksheet-col-width.mutation';
import type { IDeltaColumnWidthCommandParams, ISetColWidthCommandParams } from '../set-worksheet-col-width.command';
import { DeltaColumnWidthCommand, SetColWidthCommand } from '../set-worksheet-col-width.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test set col width commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getColumnWidth(col: number): number {
        const worksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet();
        return worksheet.getColumnWidth(col);
    }

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(DeltaColumnWidthCommand);
        commandService.registerCommand(SetColWidthCommand);
        commandService.registerCommand(SetWorksheetColWidthMutation);

        const worksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet();
        const maxRow = worksheet.getMaxRows() - 1;
        const selectionManagerService = get(SelectionManagerService);
        selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });
        selectionManagerService.add([
            {
                range: { startRow: 0, startColumn: 1, endColumn: 2, endRow: maxRow, rangeType: RANGE_TYPE.COLUMN },
                primary: {
                    startRow: 0,
                    startColumn: 1,
                    endColumn: 1,
                    endRow: 0,
                    actualColumn: 1,
                    actualRow: 1,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
        selectionManagerService.add([
            {
                range: { startRow: 0, startColumn: 5, endColumn: 5, endRow: maxRow, rangeType: RANGE_TYPE.COLUMN },
                primary: null,
                style: null,
            },
        ]);
    });

    afterEach(() => univer.dispose());

    describe('Delta col widths by dragging', () => {
        it('Should expand all col selections when anchor col is selected', async () => {
            expect(getColumnWidth(1)).toBe(88);

            await commandService.executeCommand<IDeltaColumnWidthCommandParams>(DeltaColumnWidthCommand.id, {
                deltaX: -23,
                anchorCol: 5,
            });
            expect(getColumnWidth(1)).toBe(65);
            expect(getColumnWidth(2)).toBe(65);
            expect(getColumnWidth(5)).toBe(65);

            await commandService.executeCommand(UndoCommand.id);
            expect(getColumnWidth(1)).toBe(88);
            expect(getColumnWidth(2)).toBe(88);
            expect(getColumnWidth(5)).toBe(88);

            await commandService.executeCommand(RedoCommand.id);
            expect(getColumnWidth(1)).toBe(65);
            expect(getColumnWidth(2)).toBe(65);
            expect(getColumnWidth(5)).toBe(65);
        });

        it('Should expand only the anchor col in other situations', () => {
            expect(getColumnWidth(1)).toBe(88);
            expect(getColumnWidth(7)).toBe(88);

            commandService.executeCommand<IDeltaColumnWidthCommandParams>(DeltaColumnWidthCommand.id, {
                deltaX: -23,
                anchorCol: 7,
            });

            expect(getColumnWidth(1)).toBe(88);
            expect(getColumnWidth(2)).toBe(88);
            expect(getColumnWidth(5)).toBe(88);
            expect(getColumnWidth(7)).toBe(65);
        });
    });

    it('Direct change col widths', async () => {
        expect(getColumnWidth(1)).toBe(88);

        await commandService.executeCommand<ISetColWidthCommandParams>(SetColWidthCommand.id, {
            value: 40,
        });
        expect(getColumnWidth(1)).toBe(40);
        expect(getColumnWidth(2)).toBe(40);
        expect(getColumnWidth(5)).toBe(40);

        await commandService.executeCommand(UndoCommand.id);
        expect(getColumnWidth(1)).toBe(88);
        expect(getColumnWidth(2)).toBe(88);
        expect(getColumnWidth(5)).toBe(88);

        await commandService.executeCommand(RedoCommand.id);
        expect(getColumnWidth(1)).toBe(40);
        expect(getColumnWidth(2)).toBe(40);
        expect(getColumnWidth(5)).toBe(40);
    });
});
