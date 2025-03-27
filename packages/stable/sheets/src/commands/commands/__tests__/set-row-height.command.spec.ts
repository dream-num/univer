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

import type { Injector, Nullable, Univer, Workbook } from '@univerjs/core';
import type { IDeltaRowHeightCommand, ISetRowHeightCommandParams } from '../set-worksheet-row-height.command';
import {
    BooleanNumber,
    ICommandService,
    IUniverInstanceService,
    RANGE_TYPE,
    RedoCommand,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import {
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
} from '../../mutations/set-worksheet-row-height.mutation';
import {
    DeltaRowHeightCommand,
    SetRowHeightCommand,
    SetWorksheetRowIsAutoHeightCommand,
} from '../set-worksheet-row-height.command';
import { createCommandTestBed } from './create-command-test-bed';

// tests in this file is almost a transpose of packages/base-sheets/src/commands/commands/__tests__/set--width.command.spec.ts

describe('Test set row height commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getRowHeight(row: number): number {
        const worksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!;
        return worksheet.getRowHeight(row);
    }

    function getRowIsAutoHeight(row: number): Nullable<BooleanNumber> {
        const worksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!;
        const rowManager = worksheet.getRowManager();
        const rowInfo = rowManager.getRow(row);

        return rowInfo?.ia;
    }

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(DeltaRowHeightCommand);
        commandService.registerCommand(SetRowHeightCommand);
        commandService.registerCommand(SetWorksheetRowIsAutoHeightCommand);
        commandService.registerCommand(SetWorksheetRowHeightMutation);
        commandService.registerCommand(SetWorksheetRowIsAutoHeightMutation);

        const worksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!;
        const maxColumn = worksheet.getMaxColumns() - 1;
        const selectionManager = get(SheetsSelectionsService);

        // select row 2, 3
        selectionManager.addSelections([
            {
                range: { startRow: 1, startColumn: 0, endRow: 2, endColumn: maxColumn, rangeType: RANGE_TYPE.ROW },
                primary: {
                    startRow: 1,
                    startColumn: 0,
                    endColumn: 0,
                    endRow: 1,
                    actualColumn: 0,
                    actualRow: 1,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);

        // and continue select row 5
        selectionManager.addSelections([
            {
                range: { startRow: 5, startColumn: 0, endColumn: maxColumn, endRow: 5, rangeType: RANGE_TYPE.ROW },
                primary: null,
                style: null,
            },
        ]);
    });

    afterEach(() => univer.dispose());

    describe('Delta row heights by dragging', () => {
        it('Should change all row selections when anchor row is selected', async () => {
            expect(getRowHeight(1)).toBe(24);

            await commandService.executeCommand<IDeltaRowHeightCommand>(DeltaRowHeightCommand.id, {
                deltaY: -5,
                anchorRow: 5,
            });
            expect(getRowHeight(1)).toBe(19);
            expect(getRowIsAutoHeight(1)).toBe(BooleanNumber.FALSE);
            expect(getRowHeight(2)).toBe(19);
            expect(getRowIsAutoHeight(2)).toBe(BooleanNumber.FALSE);
            expect(getRowHeight(5)).toBe(19);
            expect(getRowIsAutoHeight(5)).toBe(BooleanNumber.FALSE);

            await commandService.executeCommand(UndoCommand.id);
            expect(getRowHeight(1)).toBe(24);
            expect(getRowHeight(2)).toBe(24);
            expect(getRowHeight(5)).toBe(24);

            await commandService.executeCommand(RedoCommand.id);
            expect(getRowHeight(1)).toBe(19);
            expect(getRowHeight(2)).toBe(19);
            expect(getRowHeight(5)).toBe(19);
        });

        it('Should expand only the anchor row in other situations', async () => {
            expect(getRowHeight(1)).toBe(24);
            expect(getRowHeight(7)).toBe(24);

            await commandService.executeCommand<IDeltaRowHeightCommand>(DeltaRowHeightCommand.id, {
                deltaY: -5,
                anchorRow: 7,
            });

            expect(getRowHeight(1)).toBe(24);
            expect(getRowHeight(2)).toBe(24);
            expect(getRowHeight(5)).toBe(24);
            expect(getRowHeight(7)).toBe(19);
        });
    });

    it('Direct change row heights', async () => {
        expect(getRowHeight(1)).toBe(24);

        await commandService.executeCommand<ISetRowHeightCommandParams>(SetRowHeightCommand.id, {
            value: 77,
        });
        expect(getRowHeight(1)).toBe(77);
        expect(getRowIsAutoHeight(1)).toBe(BooleanNumber.FALSE);
        expect(getRowHeight(2)).toBe(77);
        expect(getRowIsAutoHeight(2)).toBe(BooleanNumber.FALSE);
        expect(getRowHeight(5)).toBe(77);
        expect(getRowIsAutoHeight(5)).toBe(BooleanNumber.FALSE);

        await commandService.executeCommand(UndoCommand.id);
        expect(getRowHeight(1)).toBe(24);
        expect(getRowHeight(2)).toBe(24);
        expect(getRowHeight(5)).toBe(24);

        await commandService.executeCommand(RedoCommand.id);
        expect(getRowHeight(1)).toBe(77);
        expect(getRowHeight(2)).toBe(77);
        expect(getRowHeight(5)).toBe(77);
    });

    it('Direct change row heights with ranges', async () => {
        await commandService.executeCommand<ISetRowHeightCommandParams>(SetRowHeightCommand.id, {
            value: 88,
            ranges: [{ startRow: 2, endRow: 2, startColumn: 0, endColumn: 0 }],
        });
        expect(getRowHeight(2)).toBe(88);
        expect(getRowIsAutoHeight(2)).toBe(BooleanNumber.FALSE);
    });

    describe('Set fit content in ranges', () => {
        it('Should change all rows ia to true in selections', async () => {
            await commandService.executeCommand(SetWorksheetRowIsAutoHeightCommand.id);
            expect(getRowIsAutoHeight(1)).toBe(BooleanNumber.TRUE);
            expect(getRowIsAutoHeight(2)).toBe(BooleanNumber.TRUE);
            expect(getRowIsAutoHeight(5)).toBe(BooleanNumber.TRUE);

            await commandService.executeCommand(UndoCommand.id);
            expect(getRowIsAutoHeight(1)).toBe(undefined);
            expect(getRowIsAutoHeight(2)).toBe(undefined);
            expect(getRowIsAutoHeight(5)).toBe(undefined);

            await commandService.executeCommand(RedoCommand.id);
            expect(getRowIsAutoHeight(1)).toBe(BooleanNumber.TRUE);
            expect(getRowIsAutoHeight(2)).toBe(BooleanNumber.TRUE);
            expect(getRowIsAutoHeight(5)).toBe(BooleanNumber.TRUE);
        });
    });
});
