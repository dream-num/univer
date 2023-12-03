import type { ICellData, Nullable, Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, RANGE_TYPE } from '@univerjs/core';
import {
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
} from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { InsertFunctionCommand } from '../../commands/insert-function.command';
import type { IInsertFunctionOperationParams } from '../insert-function.operation';
import { InsertFunctionOperation } from '../insert-function.operation';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test insert function operation', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(InsertFunctionOperation);
        commandService.registerCommand(InsertFunctionCommand);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('insert function', () => {
        describe('correct situations', () => {
            it('insert function, match the data range above', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                // B3
                selectionManager.add([
                    {
                        range: { startRow: 2, startColumn: 1, endRow: 2, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(2, 1, 2, 1)
                        .getValue();
                }
                const params: IInsertFunctionOperationParams = {
                    value: 'SUM',
                };

                // expect(await commandService.executeCommand(InsertFunctionOperation.id, params)).toBeTruthy();
                // expect(getValue()?.f).toStrictEqual('=SUM(B2)');
                // // undo
                // expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                // expect(getValue()).toStrictEqual({});
                // // redo
                // expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                // expect(getValue()?.f).toStrictEqual('=SUM(B2)');

                // // Restore the original data
                // expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });

            it('insert function, match the data range left', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                // C2
                selectionManager.add([
                    {
                        range: { startRow: 1, startColumn: 2, endRow: 1, endColumn: 2, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(1, 2, 1, 2)
                        .getValue();
                }
                const params: IInsertFunctionOperationParams = {
                    value: 'SUM',
                };

                // expect(await commandService.executeCommand(InsertFunctionOperation.id, params)).toBeTruthy();
                // expect(getValue()?.f).toStrictEqual('=SUM(B2)');
                // // undo
                // expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                // expect(getValue()).toStrictEqual({});
                // // redo
                // expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                // expect(getValue()?.f).toStrictEqual('=SUM(B2)');

                // // Restore the original data
                // expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(InsertFunctionOperation.id);
                expect(result).toBeFalsy();
            });
        });
    });
});
