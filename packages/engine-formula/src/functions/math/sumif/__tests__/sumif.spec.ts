// import { describe, it } from 'vitest';

// describe('test sumif', () => {
//     it('correct situations', () => {
//         const range = 'A1:A4'
//         // RangeReferenceObject

//         // StringValueObject
//     });
// });

import type { ICellData, Nullable, Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, RANGE_TYPE } from '@univerjs/core';
import { FormulaEngineService, FormulaExecutedStateType } from '@univerjs/engine-formula';
import type { ISetRangeValuesCommandParams } from '@univerjs/sheets';
import {
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
} from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createCommandTestBed } from './create-command-test-bed';

describe('test sumif', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionManager: SelectionManagerService;
    let formulaEngineService: FormulaEngineService;
    let getValue: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<ICellData> | undefined;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        formulaEngineService = get(FormulaEngineService);

        selectionManager = get(SelectionManagerService);
        selectionManager.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });
        selectionManager.add([
            {
                range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        getValue = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValue();
    });

    afterEach(() => {
        univer.dispose();
        formulaEngineService.dispose();
    });

    it('range and criteria', async () => {
        const params: ISetRangeValuesCommandParams = {
            value: {
                f: '=SUMIF(A1:A4, ">40")',
            },
        };

        formulaEngineService.executionCompleteListener$.subscribe((data) => {
            const functionsExecutedState = data.functionsExecutedState;
            // TODO@Dushusir: why this is not success?
            switch (functionsExecutedState) {
                case FormulaExecutedStateType.SUCCESS:
                    break;
            }
        });

        expect(await commandService.executeCommand(SetRangeValuesCommand.id, params)).toBeTruthy();

        // expect(getValue(1, 1, 1, 1)).toStrictEqual(488);

        // // undo
        // expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        // expect(getValue(1, 1, 1, 1)).toStrictEqual({
        //     v: 'A1',
        // });

        // // redo
        // expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
        // expect(getValue(1, 1, 1, 1)).toStrictEqual({
        //     v: 'A1',
        // });
    });
});
