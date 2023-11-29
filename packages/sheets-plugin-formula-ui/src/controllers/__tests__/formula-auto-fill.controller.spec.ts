import { FormulaEngineService } from '@univerjs/base-formula-engine';
import {
    AddWorksheetMergeMutation,
    NORMAL_SELECTION_PLUGIN_NAME,
    RemoveWorksheetMergeMutation,
    SelectionManagerService,
    SetRangeValuesMutation,
    SetSelectionsOperation,
} from '@univerjs/base-sheets';
import { ICellData, ICommandService, IUniverInstanceService, Nullable, RANGE_TYPE, Univer } from '@univerjs/core';
import { AutoFillCommand, AutoFillService, IAutoFillService } from '@univerjs/ui-plugin-sheets';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FormulaAutoFillController } from '../formula-auto-fill.controller';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test clear selection content commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [
            [FormulaAutoFillController],
            [IAutoFillService, { useClass: AutoFillService }],
            [FormulaEngineService],
        ]);
        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        commandService.registerCommand(AutoFillCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('auto fill with formula', () => {
        describe('correct situations', () => {
            it('one cell with formula', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 1, endRow: 0, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 1, 0, 1)
                        .getValue();
                }

                // expect(getValue()).toStrictEqual({});
                // // undo
                // expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                // expect(getValue()).toStrictEqual({
                //     v: 'A1',
                // });
                // // redo
                // expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                // expect(getValue()).toStrictEqual({});

                // // Restore the original data
                // expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(AutoFillCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
});
