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

import type { ICellData, Injector, Nullable, Univer } from '@univerjs/core';
import {
    ICommandService,
    IUniverInstanceService,
    RANGE_TYPE,
    RedoCommand,
    set,
    ThemeService,
    UndoCommand,
} from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    RangeProtectionRenderModel,
    RangeProtectionService,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import {
    AutoFillCommand,
    AutoFillController,
    AutoFillService,
    IAutoFillService,
    ISheetSelectionRenderService,
    SheetSelectionRenderService,
    SheetsRenderService,
} from '@univerjs/sheets-ui';
import { IPlatformService, IShortcutService, PlatformService, ShortcutService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FormulaAutoFillController } from '../formula-auto-fill.controller';
import { createCommandTestBed } from './create-command-test-bed';

class mockSheetsRenderService {
    registerSkeletonChangingMutations(id: string) {
    }
}

describe('Test auto fill with formula', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let themeService: ThemeService;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [
            [ISheetSelectionRenderService, { useClass: SheetSelectionRenderService }],
            [AutoFillController],
            [IAutoFillService, { useClass: AutoFillService }],
            [IShortcutService, { useClass: ShortcutService }],
            [IPlatformService, { useClass: PlatformService }],
            [FormulaAutoFillController],
            [RangeProtectionService],
            [RangeProtectionRenderModel],
            [SheetsRenderService, { useClass: mockSheetsRenderService }],
        ]);

        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        themeService = get(ThemeService);
        const theme = themeService.getCurrentTheme();
        const newTheme = set(theme, 'black', '#35322b');
        themeService.setTheme(newTheme);

        get(AutoFillController);

        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(AutoFillCommand);

        get(FormulaAutoFillController);

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
            const selectionManager = get(SheetsSelectionsService);

            selectionManager.addSelections([
                {
                    range: { startRow: 0, startColumn: 1, endRow: 0, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);
            const sourceRange = {
                startColumn: 1,
                endColumn: 1,
                startRow: 0,
                endRow: 0,
            };

            const targetRange = {
                startColumn: 1,
                endColumn: 1,
                startRow: 0,
                endRow: 2,
            };

            commandService.executeCommand(AutoFillCommand.id, { sourceRange, targetRange });

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
            expect(B3).toBeNull();

            // redo
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            values = getValues(0, 1, 2, 1);
            B2 = values && values[1][0];
            B3 = values && values[2][0];

            expect(B2?.f).toStrictEqual('=SUM(A2)');
            expect(B2?.si).toEqual(B3?.si);

            commandService.executeCommand(AutoFillCommand.id, {
                sourceRange: {
                    startColumn: 1,
                    endColumn: 1,
                    startRow: 0,
                    endRow: 2,
                },
                targetRange: {
                    startColumn: 1,
                    endColumn: 3,
                    startRow: 0,
                    endRow: 2,
                },
            });

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

            expect(C1).toBeNull();
            expect(C2).toBeNull();
            expect(C3).toBeNull();
            expect(D1).toBeNull();
            expect(D2).toBeNull();
            expect(D3).toBeNull();

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

        it('fill up with formula', async () => {
            const selectionManager = get(SheetsSelectionsService);

            selectionManager.addSelections([
                {
                    range: { startRow: 9, startColumn: 0, endRow: 9, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            commandService.executeCommand(AutoFillCommand.id, {
                sourceRange: {
                    startColumn: 0,
                    endColumn: 0,
                    startRow: 9,
                    endRow: 9,
                },
                targetRange: {
                    startColumn: 0,
                    endColumn: 0,
                    startRow: 6,
                    endRow: 9,
                },
            });

            // B1:B3 values will be in the following format
            // [
            //     [ { f: '=B7', si: '1ZMZWH' } ],
            //     [ { si: '1ZMZWH' } ]
            //     [ { si: '1ZMZWH' } ]
            //     [ { f: '=B10' } ],
            //   ]
            let values = getValues(6, 0, 8, 0);
            let A7 = values && values[0][0];
            let A8 = values && values[1][0];
            let A9 = values && values[2][0];

            expect(A7?.f).toStrictEqual('=B7');
            expect(A7?.si).toEqual(A8?.si);
            expect(A7?.si).toEqual(A9?.si);

            // undo
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();

            values = getValues(6, 0, 8, 0);
            A7 = values && values[0][0];
            A8 = values && values[1][0];
            A9 = values && values[2][0];

            expect(A7).toBeNull();
            expect(A8).toBeNull();
            expect(A9).toBeNull();

            // redo
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            values = getValues(6, 0, 8, 0);
            A7 = values && values[0][0];
            A8 = values && values[1][0];
            A9 = values && values[2][0];

            expect(A7?.f).toStrictEqual('=B7');
            expect(A7?.si).toEqual(A8?.si);
            expect(A7?.si).toEqual(A9?.si);
        });

        it('fill up with formula and number', async () => {
            const selectionManager = get(SheetsSelectionsService);

            selectionManager.addSelections([
                {
                    range: { startRow: 19, startColumn: 0, endRow: 20, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            commandService.executeCommand(AutoFillCommand.id, {
                sourceRange: {
                    startColumn: 0,
                    endColumn: 0,
                    startRow: 19,
                    endRow: 20,
                },
                targetRange: {
                    startColumn: 0,
                    endColumn: 0,
                    startRow: 15,
                    endRow: 20,
                },
            });

            // B1:B3 values will be in the following format
            // [
            //     [ { v: 18 } ]
            //     [ { f: '=B17', si: '1ZMZWH' } ],
            //     [ { v: 19 } ]
            //     [ { si: '1ZMZWH' } ]
            //     [ { v: 20 } ]
            //     [ { f: '=B21' } ],
            //   ]
            let values = getValues(15, 0, 18, 0);
            let A16 = values && values[0][0];
            let A17 = values && values[1][0];
            let A18 = values && values[2][0];
            let A19 = values && values[3][0];

            expect(A16?.v).toStrictEqual(18);
            expect(A17?.f).toEqual('=B17');
            expect(A18?.v).toEqual(19);
            expect(A19?.si).toEqual(A17?.si);

            // undo
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();

            values = getValues(15, 0, 18, 0);
            A16 = values && values[0][0];
            A17 = values && values[1][0];
            A18 = values && values[2][0];
            A19 = values && values[3][0];

            expect(A16).toBeNull();
            expect(A17).toBeNull();
            expect(A18).toBeNull();
            expect(A19).toBeNull();

            // redo
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            values = getValues(15, 0, 18, 0);
            A16 = values && values[0][0];
            A17 = values && values[1][0];
            A18 = values && values[2][0];
            A19 = values && values[3][0];

            expect(A16?.v).toStrictEqual(18);
            expect(A17?.f).toEqual('=B17');
            expect(A18?.v).toEqual(19);
            expect(A19?.si).toEqual(A17?.si);
        });
    });
});
