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

import type { IDisposable, Injector, IRange, Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService, RANGE_TYPE } from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    RemoveWorksheetMergeCommand,
    RemoveWorksheetMergeMutation,
    SetColHiddenCommand,
    SetColHiddenMutation,
    SetRangeValuesMutation,
    SetRowHiddenCommand,
    SetRowHiddenMutation,
    SetSelectionsOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { type IConfirmPartMethodOptions, IConfirmService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
} from '../add-worksheet-merge.command';
import { HideColConfirmCommand, HideRowConfirmCommand } from '../hide-row-col-confirm.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test hide row col confirm commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [
            [
                IConfirmService,
                {
                    useClass: class MockConfirmService implements IConfirmService {
                        confirmOptions$: Subject<IConfirmPartMethodOptions[]> = new Subject();

                        open(params: IConfirmPartMethodOptions): IDisposable {
                            throw new Error('Method not implemented.');
                        }

                        confirm(params: IConfirmPartMethodOptions): Promise<boolean> {
                            return Promise.resolve(true);
                        }

                        close(id: string): void {
                            throw new Error('Method not implemented.');
                        }
                    },
                },
            ],
        ]);
        univer = testBed.univer;

        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(AddWorksheetMergeCommand);
        commandService.registerCommand(AddWorksheetMergeAllCommand);
        commandService.registerCommand(AddWorksheetMergeVerticalCommand);
        commandService.registerCommand(AddWorksheetMergeHorizontalCommand);
        commandService.registerCommand(RemoveWorksheetMergeCommand);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(HideColConfirmCommand);
        commandService.registerCommand(HideRowConfirmCommand);
        commandService.registerCommand(SetRowHiddenCommand);
        commandService.registerCommand(SetRowHiddenMutation);
        commandService.registerCommand(SetColHiddenCommand);
        commandService.registerCommand(SetColHiddenMutation);
        commandService.registerCommand(SetSelectionsOperation);

        get(LocaleService).load({});
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('Hide row', () => {
        it('Will apply when select some rows', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: 1, startColumn: Number.NaN, endRow: 1, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            function getHiddenRows(): IRange[] | undefined {
                return get(IUniverInstanceService)
                    .getUniverSheetInstance('test')
                    ?.getSheetBySheetId('sheet1')
                    ?.getRowManager()
                    .getHiddenRows();
            }

            expect(getHiddenRows()).toStrictEqual([]);
            expect(await commandService.executeCommand(HideRowConfirmCommand.id)).toBeTruthy();
            expect(getHiddenRows()).toStrictEqual([
                {
                    endColumn: 0,
                    endRow: 1,
                    rangeType: RANGE_TYPE.ROW,
                    startColumn: 0,
                    startRow: 1,
                },
            ]);
        });

        it('Will not apply when select all rows', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: 0, startColumn: Number.NaN, endRow: 999, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            function getHiddenRows(): IRange[] | undefined {
                return get(IUniverInstanceService)
                    .getUniverSheetInstance('test')
                    ?.getSheetBySheetId('sheet1')
                    ?.getRowManager()
                    .getHiddenRows();
            }

            expect(getHiddenRows()).toStrictEqual([]);
            expect(await commandService.executeCommand(HideRowConfirmCommand.id)).toBeFalsy();
        });
    });

    describe('Hide col', () => {
        it('Will apply when select some cols', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: Number.NaN, startColumn: 1, endRow: Number.NaN, endColumn: 1, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
            ]);

            function getHiddenCols(): IRange[] | undefined {
                return get(IUniverInstanceService)
                    .getUniverSheetInstance('test')
                    ?.getSheetBySheetId('sheet1')
                    ?.getColumnManager()
                    .getHiddenCols();
            }

            expect(getHiddenCols()).toStrictEqual([]);
            expect(await commandService.executeCommand(HideColConfirmCommand.id)).toBeTruthy();
            expect(getHiddenCols()).toStrictEqual([
                {
                    endColumn: 1,
                    endRow: 0,
                    rangeType: RANGE_TYPE.COLUMN,
                    startColumn: 1,
                    startRow: 0,
                },
            ]);
        });

        it('Will not apply when select all cols', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: Number.NaN, startColumn: 0, endRow: Number.NaN, endColumn: 19, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
            ]);

            function getHiddenCols(): IRange[] | undefined {
                return get(IUniverInstanceService)
                    .getUniverSheetInstance('test')
                    ?.getSheetBySheetId('sheet1')
                    ?.getColumnManager()
                    .getHiddenCols();
            }

            expect(getHiddenCols()).toStrictEqual([]);
            expect(await commandService.executeCommand(HideColConfirmCommand.id)).toBeFalsy();
        });
    });
});
