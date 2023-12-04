import type { ICellData, Nullable, Univer } from '@univerjs/core';
import {
    ICommandService,
    IUniverInstanceService,
    RANGE_TYPE,
    RedoCommand,
    ThemeService,
    UndoCommand,
} from '@univerjs/core';
import { FormulaEngineService } from '@univerjs/engine-formula';
import {
    AddWorksheetMergeMutation,
    NORMAL_SELECTION_PLUGIN_NAME,
    RemoveWorksheetMergeMutation,
    SelectionManagerService,
    SetRangeValuesMutation,
    SetSelectionsOperation,
} from '@univerjs/sheets';
import {
    AutoFillCommand,
    AutoFillController,
    AutoFillService,
    IAutoFillService,
    ISelectionRenderService,
    SelectionRenderService,
} from '@univerjs/sheets-ui';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FormulaAutoFillController } from '../formula-auto-fill.controller';
import { createCommandTestBed } from './create-command-test-bed';

const theme = {
    colorBlack: '#35322b',
};

describe('Test clear selection content commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let autoFillController: AutoFillController;
    let themeService: ThemeService;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [
            [ISelectionRenderService, { useClass: SelectionRenderService }],
            [AutoFillController],
            [FormulaEngineService],
            [IAutoFillService, { useClass: AutoFillService }],
            [FormulaAutoFillController],
        ]);
        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        themeService = get(ThemeService);
        themeService.setTheme(theme);
        autoFillController = get(AutoFillController);
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

                (autoFillController as any)._handleFill(
                    {
                        startColumn: 1,
                        endColumn: 1,
                        startRow: 0,
                        endRow: 0,
                    },
                    {
                        startColumn: 1,
                        endColumn: 1,
                        startRow: 0,
                        endRow: 2,
                    }
                );

                // values will be in the following format
                // [
                //     [ { f: '=SUM(A1)' } ],
                //     [ { f: '=SUM(A2)', si: '1ZMZWH' } ],
                //     [ { si: '1ZMZWH' } ]
                //   ]
                let values = getValues(0, 1, 2, 1);
                let B2 = values && values[1][0];
                let B3 = values && values[2][0];

                expect(B2?.f).toStrictEqual('=SUM(A2)');
                expect(B2?.si).toEqual(B3?.si);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();

                values = getValues(0, 1, 2, 1);
                B2 = values && values[1][0];
                B3 = values && values[2][0];

                expect(B2).toStrictEqual({});
                expect(B3).toStrictEqual({});

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                values = getValues(0, 1, 2, 1);
                B2 = values && values[1][0];
                B3 = values && values[2][0];

                expect(B2?.f).toStrictEqual('=SUM(A2)');
                expect(B2?.si).toEqual(B3?.si);

                // Restore the original data
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
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
