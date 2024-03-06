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
import {
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    RANGE_TYPE,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
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
import { createCommandTestBed } from './create-command-test-bed';

describe('Test add worksheet merge commands', () => {
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

        get(LocaleService).load({});
    });

    afterEach(() => {
        // univer.dispose();
    });

    describe('add merge all', () => {
        describe('correct situations', () => {
            it('will merge all cells of the selected range when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 5, endRow: 5, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                    {
                        range: { startRow: 10, startColumn: 10, endColumn: 10, endRow: 10, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getMerge(): IRange[] | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getConfig().mergeData;
                }

                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(AddWorksheetMergeAllCommand.id)).toBeTruthy();
                expect(getMerge()).toStrictEqual([
                    { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5, rangeType: RANGE_TYPE.NORMAL },
                ]);
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getMerge()).toStrictEqual([
                    { startRow: 0, startColumn: 0, endRow: 5, endColumn: 5, rangeType: RANGE_TYPE.NORMAL },
                ]);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(AddWorksheetMergeAllCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('add merge vertical', () => {
        describe('correct situations', () => {
            it('will merge all vertical cells of the selected range when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 5, endRow: 5, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                    {
                        range: { startRow: 10, startColumn: 10, endColumn: 15, endRow: 10, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getMerge(): IRange[] | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getConfig().mergeData;
                }

                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(AddWorksheetMergeVerticalCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(6);
                expect(getMerge()?.[0]).toStrictEqual({
                    startRow: 0,
                    startColumn: 0,
                    endColumn: 0,
                    endRow: 5,
                });
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(AddWorksheetMergeVerticalCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('add merge horizontal', () => {
        describe('correct situations', () => {
            it('will merge all horizontal cells of the selected range when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 5, endRow: 5, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                    {
                        range: { startRow: 10, startColumn: 10, endColumn: 10, endRow: 15, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getMerge(): IRange[] | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getConfig().mergeData;
                }

                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(AddWorksheetMergeHorizontalCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(6);
                expect(getMerge()?.[0]).toStrictEqual({ startRow: 0, startColumn: 0, endColumn: 5, endRow: 0 });
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(AddWorksheetMergeHorizontalCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('cancel merge', () => {
        describe('correct situations', () => {
            it('will cancel the merge of the selected range when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 5, endRow: 5, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getMerge(): IRange[] | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getConfig().mergeData;
                }

                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(AddWorksheetMergeHorizontalCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(6);
                expect(getMerge()?.[0]).toStrictEqual({ startRow: 0, startColumn: 0, endColumn: 5, endRow: 0 });
                expect(await commandService.executeCommand(RemoveWorksheetMergeCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(6);
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(0);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(RemoveWorksheetMergeCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
});
