import {
    ICommandService,
    ICurrentUniverService,
    IRange,
    RANGE_TYPE,
    RedoCommand,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
} from '../add-worksheet-merge.command';
import { RemoveWorksheetMergeCommand } from '../remove-worksheet-merge.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test style commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;

        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(AddWorksheetMergeCommand);
        commandService.registerCommand(AddWorksheetMergeAllCommand);
        commandService.registerCommand(AddWorksheetMergeVerticalCommand);
        commandService.registerCommand(AddWorksheetMergeHorizontalCommand);
        commandService.registerCommand(RemoveWorksheetMergeCommand);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
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
                ]);

                function getMerge(): IRange[] | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getConfig().mergeData;
                }

                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(AddWorksheetMergeAllCommand.id)).toBeTruthy();
                expect(getMerge()).toStrictEqual([{ startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 }]);
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getMerge()).toStrictEqual([{ startRow: 0, startColumn: 0, endRow: 5, endColumn: 5 }]);
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
                ]);

                function getMerge(): IRange[] | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getConfig().mergeData;
                }

                expect(getMerge()?.length).toBe(0);
                expect(await commandService.executeCommand(AddWorksheetMergeVerticalCommand.id)).toBeTruthy();
                expect(getMerge()?.length).toBe(6);
                expect(getMerge()?.[0]).toStrictEqual({ startRow: 0, startColumn: 0, endColumn: 0, endRow: 5 });
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
                ]);

                function getMerge(): IRange[] | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')

                        .getSheetBySheetId('sheet1')
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
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')

                        .getSheetBySheetId('sheet1')
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
