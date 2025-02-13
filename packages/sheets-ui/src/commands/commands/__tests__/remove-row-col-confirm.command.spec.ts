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

import type { IDisposable, Injector, Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService, RANGE_TYPE } from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    InsertColByRangeCommand,
    InsertRowByRangeCommand,
    RemoveColByRangeCommand,
    RemoveColCommand,
    RemoveColMutation,
    RemoveRowByRangeCommand,
    RemoveRowCommand,
    RemoveRowMutation,
    RemoveWorksheetMergeCommand,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
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
import { RemoveColConfirmCommand, RemoveRowConfirmCommand } from '../remove-row-col-confirm.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test remove row col confirm commands', () => {
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
        commandService.registerCommand(RemoveRowConfirmCommand);
        commandService.registerCommand(RemoveRowCommand);
        commandService.registerCommand(RemoveRowMutation);
        commandService.registerCommand(RemoveColConfirmCommand);
        commandService.registerCommand(RemoveColCommand);
        commandService.registerCommand(RemoveColMutation);
        commandService.registerCommand(SetSelectionsOperation);

        [
            RemoveColByRangeCommand,
            RemoveRowByRangeCommand,
            InsertRowByRangeCommand,
            InsertColByRangeCommand,
        ].forEach((command) => {
            commandService.registerCommand(command);
        });

        get(LocaleService).load({});
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('Remove row', () => {
        it('Will apply when select some rows', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: 1, startColumn: Number.NaN, endRow: 1, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            function getRowCount(): number | undefined {
                return get(IUniverInstanceService)
                    .getUniverSheetInstance('test')
                    ?.getSheetBySheetId('sheet1')
                    ?.getRowCount();
            }

            expect(getRowCount()).toBe(1000);
            expect(await commandService.executeCommand(RemoveRowConfirmCommand.id)).toBeTruthy();
            expect(getRowCount()).toBe(999);
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

            function getRowCount(): number | undefined {
                return get(IUniverInstanceService)
                    .getUniverSheetInstance('test')
                    ?.getSheetBySheetId('sheet1')
                    ?.getRowCount();
            }

            expect(getRowCount()).toBe(1000);
            expect(await commandService.executeCommand(RemoveRowConfirmCommand.id)).toBeFalsy();
            expect(getRowCount()).toBe(1000);
        });
    });

    describe('Remove col', () => {
        it('Will apply when select some cols', async () => {
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([
                {
                    range: { startRow: Number.NaN, startColumn: 1, endRow: Number.NaN, endColumn: 1, rangeType: RANGE_TYPE.COLUMN },
                    primary: null,
                    style: null,
                },
            ]);

            function getColumnCount(): number | undefined {
                return get(IUniverInstanceService)
                    .getUniverSheetInstance('test')
                    ?.getSheetBySheetId('sheet1')
                    ?.getColumnCount();
            }

            expect(getColumnCount()).toBe(20);
            expect(await commandService.executeCommand(RemoveColConfirmCommand.id)).toBeTruthy();
            expect(getColumnCount()).toBe(19);
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

            function getColumnCount(): number | undefined {
                return get(IUniverInstanceService)
                    .getUniverSheetInstance('test')
                    ?.getSheetBySheetId('sheet1')
                    ?.getColumnCount();
            }

            expect(getColumnCount()).toBe(20);
            expect(await commandService.executeCommand(RemoveColConfirmCommand.id)).toBeFalsy();
            expect(getColumnCount()).toBe(20);
        });
    });
});
