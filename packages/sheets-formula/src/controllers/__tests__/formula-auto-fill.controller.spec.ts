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

import type { ICellData, Nullable, Univer } from '@univerjs/core';
import {
    ICommandService,
    IUniverInstanceService,
    RANGE_TYPE,
    RedoCommand,
    ThemeService,
    UndoCommand,
} from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    NORMAL_SELECTION_PLUGIN_NAME,
    RangeProtectionRenderModel,
    RangeProtectionRuleModel,
    RangeProtectionService,
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
import { DesktopPlatformService, DesktopShortcutService, IPlatformService, IShortcutService } from '@univerjs/ui';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FormulaAutoFillController } from '../formula-auto-fill.controller';
import { createCommandTestBed } from './create-command-test-bed';

const theme = {
    colorBlack: '#35322b',
};

describe('Test auto fill with formula', () => {
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
            [IAutoFillService, { useClass: AutoFillService }],
            [IShortcutService, { useClass: DesktopShortcutService }],
            [IPlatformService, { useClass: DesktopPlatformService }],
            [FormulaAutoFillController],
            [RangeProtectionRuleModel],
            [RangeProtectionService],
            [RangeProtectionRenderModel],
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
        commandService.registerCommand(AutoFillCommand);

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

            (autoFillController as any)._triggerAutoFill(
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

            // B1:B3 values will be in the following format
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

            expect(B2).toStrictEqual({
                t: 2,
                v: 1,
            });
            expect(B3).toStrictEqual({});

            // redo
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            values = getValues(0, 1, 2, 1);
            B2 = values && values[1][0];
            B3 = values && values[2][0];

            expect(B2?.f).toStrictEqual('=SUM(A2)');
            expect(B2?.si).toEqual(B3?.si);

            // drop to right
            (autoFillController as any)._triggerAutoFill(
                {
                    startColumn: 1,
                    endColumn: 1,
                    startRow: 0,
                    endRow: 2,
                },
                {
                    startColumn: 1,
                    endColumn: 3,
                    startRow: 0,
                    endRow: 2,
                }
            );

            // B1:D3 values will be in the following format
            // [
            //     [
            //         {
            //             "f": "=SUM(A1)",
            //         },
            //         {
            //             "f": "=SUM(B1)",
            //             "si": "tF5X2Q"
            //         },
            //         {
            //             "si": "tF5X2Q"
            //         }
            //     ],
            //     [
            //         {
            //             "f": "=SUM(A2)",
            //             "si": "d4_488"
            //         },
            //         {
            //             "si": "d4_488"
            //         },
            //         {
            //             "si": "d4_488"
            //         }
            //     ],
            //     [
            //         {
            //             "si": "d4_488"
            //         },
            //         {
            //             "si": "d4_488"
            //         },
            //         {
            //             "si": "d4_488"
            //         }
            //     ]
            // ]
            values = getValues(0, 1, 2, 3);
            let C1 = values && values[0][1];
            let C2 = values && values[1][1];
            let C3 = values && values[2][1];
            let D1 = values && values[0][2];
            let D2 = values && values[1][2];
            let D3 = values && values[2][2];

            expect(C1?.f).toStrictEqual('=SUM(B1)');
            expect(C2?.f).toBeUndefined();
            expect(C1?.si).toEqual(D1?.si);

            expect(B2?.si).toEqual(C2?.si);
            expect(D2?.si).toEqual(C2?.si);

            expect(B3?.si).toEqual(C3?.si);
            expect(D3?.si).toEqual(C3?.si);

            // undo
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();

            values = getValues(0, 1, 2, 3);
            C1 = values && values[0][1];
            C2 = values && values[1][1];
            C3 = values && values[2][1];
            D1 = values && values[0][2];
            D2 = values && values[1][2];
            D3 = values && values[2][2];

            expect(C1).toStrictEqual({});
            expect(C2).toStrictEqual({});
            expect(C3).toStrictEqual({});
            expect(D1).toStrictEqual({});
            expect(D2).toStrictEqual({});
            expect(D3).toStrictEqual({});

            // redo
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            values = getValues(0, 1, 2, 3);
            C1 = values && values[0][1];
            C2 = values && values[1][1];
            C3 = values && values[2][1];
            D1 = values && values[0][2];
            D2 = values && values[1][2];
            D3 = values && values[2][2];

            expect(C1?.f).toStrictEqual('=SUM(B1)');
            expect(C2?.f).toBeUndefined();
            expect(C1?.si).toEqual(D1?.si);

            expect(B2?.si).toEqual(C2?.si);
            expect(D2?.si).toEqual(C2?.si);

            expect(B3?.si).toEqual(C3?.si);
            expect(D3?.si).toEqual(C3?.si);

            // Restore the original data
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        });
    });
});
