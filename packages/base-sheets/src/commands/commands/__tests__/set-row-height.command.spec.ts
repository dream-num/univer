/* eslint-disable no-magic-numbers */
import {
    ICommandService,
    IUniverInstanceService,
    Nullable,
    RANGE_TYPE,
    RedoCommand,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import {
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
} from '../../mutations/set-worksheet-row-height.mutation';
import {
    DeltaRowHeightCommand,
    IDeltaRowHeightCommand,
    ISetRowHeightCommandParams,
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
        const worksheet = get(IUniverInstanceService).getCurrentUniverSheetInstance().getActiveSheet();
        return worksheet.getRowHeight(row);
    }

    function getRowIsAutoHeight(row: number): Nullable<boolean> {
        const worksheet = get(IUniverInstanceService).getCurrentUniverSheetInstance().getActiveSheet();
        const rowManager = worksheet.getRowManager();
        const rowInfo = rowManager.getRow(row);

        return rowInfo?.isAutoHeight;
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

        const worksheet = get(IUniverInstanceService).getCurrentUniverSheetInstance().getActiveSheet();
        const maxColumn = worksheet.getMaxColumns() - 1;
        const selectionManager = get(SelectionManagerService);

        selectionManager.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });

        selectionManager.add([
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

        selectionManager.add([
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
            expect(getRowHeight(1)).toBe(19);

            await commandService.executeCommand<IDeltaRowHeightCommand>(DeltaRowHeightCommand.id, {
                deltaY: -5,
                anchorRow: 5,
            });
            expect(getRowHeight(1)).toBe(14);
            expect(getRowIsAutoHeight(1)).toBe(false);
            expect(getRowHeight(2)).toBe(14);
            expect(getRowIsAutoHeight(2)).toBe(false);
            expect(getRowHeight(5)).toBe(14);
            expect(getRowIsAutoHeight(5)).toBe(false);

            await commandService.executeCommand(UndoCommand.id);
            expect(getRowHeight(1)).toBe(19);
            expect(getRowHeight(2)).toBe(19);
            expect(getRowHeight(5)).toBe(19);

            await commandService.executeCommand(RedoCommand.id);
            expect(getRowHeight(1)).toBe(14);
            expect(getRowHeight(2)).toBe(14);
            expect(getRowHeight(5)).toBe(14);
        });

        it('Should expand only the anchor row in other situations', async () => {
            expect(getRowHeight(1)).toBe(19);
            expect(getRowHeight(7)).toBe(19);

            await commandService.executeCommand<IDeltaRowHeightCommand>(DeltaRowHeightCommand.id, {
                deltaY: -5,
                anchorRow: 7,
            });
            expect(getRowHeight(1)).toBe(19);
            expect(getRowHeight(2)).toBe(19);
            expect(getRowHeight(5)).toBe(19);
            expect(getRowHeight(7)).toBe(14);
        });
    });

    it('Direct change row heights', async () => {
        expect(getRowHeight(1)).toBe(19);

        await commandService.executeCommand<ISetRowHeightCommandParams>(SetRowHeightCommand.id, {
            value: 77,
        });
        expect(getRowHeight(1)).toBe(77);
        expect(getRowIsAutoHeight(1)).toBe(false);
        expect(getRowHeight(2)).toBe(77);
        expect(getRowIsAutoHeight(2)).toBe(false);
        expect(getRowHeight(5)).toBe(77);
        expect(getRowIsAutoHeight(5)).toBe(false);

        await commandService.executeCommand(UndoCommand.id);
        expect(getRowHeight(1)).toBe(19);
        expect(getRowHeight(2)).toBe(19);
        expect(getRowHeight(5)).toBe(19);

        await commandService.executeCommand(RedoCommand.id);
        expect(getRowHeight(1)).toBe(77);
        expect(getRowHeight(2)).toBe(77);
        expect(getRowHeight(5)).toBe(77);
    });

    describe('Set fit content in ranges', () => {
        it('Should change all rows isAutoHeight to true in selections', async () => {
            await commandService.executeCommand(SetWorksheetRowIsAutoHeightCommand.id);
            expect(getRowIsAutoHeight(1)).toBe(true);
            expect(getRowIsAutoHeight(2)).toBe(true);
            expect(getRowIsAutoHeight(5)).toBe(true);

            await commandService.executeCommand(UndoCommand.id);
            expect(getRowIsAutoHeight(1)).toBe(undefined);
            expect(getRowIsAutoHeight(2)).toBe(undefined);
            expect(getRowIsAutoHeight(5)).toBe(undefined);

            await commandService.executeCommand(RedoCommand.id);
            expect(getRowIsAutoHeight(1)).toBe(true);
            expect(getRowIsAutoHeight(2)).toBe(true);
            expect(getRowIsAutoHeight(5)).toBe(true);
        });
    });
});
