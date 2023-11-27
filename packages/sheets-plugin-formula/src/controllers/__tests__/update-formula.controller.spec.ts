import { MoveRowsCommand, NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '@univerjs/base-sheets';
import { ICellData, ICommandService, IUniverInstanceService, Nullable, RANGE_TYPE, Univer } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, it } from 'vitest';

import { createCommandTestBed } from './create-command-test-bed';

// TODO@Dushusir: add move range,insert range,delete range test case
describe('Test insert function operation', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let getValueByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<ICellData>;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(MoveRowsCommand);

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
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('update formula', () => {
        describe('correct situations', () => {
            it('move rows update formula', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });

                // A1
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                const params = {
                    fromRow: 0,
                    toRow: 1,
                };

                await commandService.executeCommand(MoveRowsCommand.id, params);
            });
        });
    });
});
