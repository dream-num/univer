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

import type { IRange, Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService, RANGE_TYPE } from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    NORMAL_SELECTION_PLUGIN_NAME,
    RemoveWorksheetMergeCommand,
    RemoveWorksheetMergeMutation,
    SelectionManagerService,
    SetRangeValuesMutation,
} from '@univerjs/sheets';
import { type IConfirmPartMethodOptions, IConfirmService } from '@univerjs/ui';
import type { IDisposable, Injector } from '@wendellhu/redi';
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

        get(LocaleService).load({});
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('hide row', () => {
        it('will apply when select some rows', async () => {
            const selectionManager = get(SelectionManagerService);
            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });
            selectionManager.add([
                {
                    range: { startRow: 1, startColumn: NaN, endRow: 1, endColumn: NaN, rangeType: RANGE_TYPE.ROW },
                    primary: null,
                    style: null,
                },
            ]);

            function getHiddenRows(): IRange[] | undefined {
                return get(IUniverInstanceService)
                    .getUniverSheetInstance('test')
                    ?.getSheetBySheetId('sheet1')
                    ?.getRowManager()
                    .getVisibleRows();
            }

            // expect(getHiddenRows()).toBe(0);
            // expect(await commandService.executeCommand(HideRowConfirmCommand.id)).toBeTruthy();
            // expect(getMerge()).toStrictEqual([
            //     { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5, rangeType: RANGE_TYPE.NORMAL },
            // ]);
            // expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            // expect(getMerge()?.length).toBe(0);
            // expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            // expect(getMerge()).toStrictEqual([
            //     { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5, rangeType: RANGE_TYPE.NORMAL },
            // ]);
        });

        it('will not apply when select all rows', async () => {
            const result = await commandService.executeCommand(AddWorksheetMergeAllCommand.id);
            expect(result).toBeFalsy();
        });
    });
});
