import {
    ICellData,
    ICommandService,
    IRange,
    IStyleData,
    IUniverInstanceService,
    Nullable,
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
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { AddWorksheetMergeAllCommand, AddWorksheetMergeCommand } from '../add-worksheet-merge.command';
import { ClearSelectionAllCommand } from '../clear-selection-all.command';
import { ClearSelectionContentCommand } from '../clear-selection-content.command';
import { ClearSelectionFormatCommand } from '../clear-selection-format.command';
import { ISetRangeValuesCommandParams, SetRangeValuesCommand } from '../set-range-values.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test clear selection content commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(ClearSelectionContentCommand);
        commandService.registerCommand(ClearSelectionFormatCommand);
        commandService.registerCommand(AddWorksheetMergeAllCommand);
        commandService.registerCommand(AddWorksheetMergeCommand);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(ClearSelectionAllCommand);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('clear selection contents', () => {
        describe('correct situations', () => {
            it('will clear selection content when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getValue();
                }

                expect(await commandService.executeCommand(ClearSelectionContentCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({});
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({
                    v: 'A1',
                });
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({});

                // Restore the original data
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(ClearSelectionContentCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
    describe('clear selection formats', () => {
        describe('correct situations', () => {
            it('will clear selection format when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getValue();
                }

                function getStyle(): Nullable<IStyleData> {
                    const value = getValue();
                    const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
                    if (value && styles) {
                        return styles.getStyleByCell(value);
                    }
                }

                // set formats
                const paramsStyle: ISetRangeValuesCommandParams = {
                    value: {
                        s: {
                            ff: 'Arial',
                        },
                    },
                };

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, paramsStyle)).toBeTruthy();
                expect(getStyle()).toStrictEqual({
                    ff: 'Arial',
                });

                // clear formats
                expect(await commandService.executeCommand(ClearSelectionFormatCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({
                    v: 'A1',
                    t: 4,
                });

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getStyle()).toStrictEqual({
                    ff: 'Arial',
                });
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({
                    v: 'A1',
                    t: 4,
                });
            });
            it('clear formats with merged cells', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 1, endRow: 1, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getValue();
                }

                function getStyle(): Nullable<IStyleData> {
                    const value = getValue();
                    const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
                    if (value && styles) {
                        return styles.getStyleByCell(value);
                    }
                }

                function getMerge(): IRange[] | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getConfig().mergeData;
                }

                // set formats
                const paramsStyle: ISetRangeValuesCommandParams = {
                    value: {
                        s: {
                            ff: 'Arial',
                        },
                    },
                };

                // set style
                expect(await commandService.executeCommand(SetRangeValuesCommand.id, paramsStyle)).toBeTruthy();
                expect(getStyle()).toStrictEqual({
                    ff: 'Arial',
                });

                // set merge cell
                expect(await commandService.executeCommand(AddWorksheetMergeAllCommand.id)).toBeTruthy();
                expect(getMerge()).toStrictEqual([
                    { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                ]);

                // clear formats with merged cells
                expect(await commandService.executeCommand(ClearSelectionFormatCommand.id)).toBeTruthy();
                // clear formats
                expect(getValue()).toStrictEqual({
                    v: 'A1',
                    t: 4,
                });
                // remove merge
                expect(getMerge()).toStrictEqual([]);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getStyle()).toStrictEqual({
                    ff: 'Arial',
                });
                expect(getMerge()).toStrictEqual([
                    { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                ]);
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({
                    v: 'A1',
                    t: 4,
                });
                expect(getMerge()).toStrictEqual([]);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(ClearSelectionFormatCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
    describe('clear selection all', () => {
        describe('correct situations', () => {
            it('will clear selection all when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getValue();
                }

                function getStyle(): Nullable<IStyleData> {
                    const value = getValue();
                    const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
                    if (value && styles) {
                        return styles.getStyleByCell(value);
                    }
                }

                // set formats
                const paramsStyle: ISetRangeValuesCommandParams = {
                    value: {
                        s: {
                            ff: 'Arial',
                        },
                    },
                };

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, paramsStyle)).toBeTruthy();
                expect(getStyle()).toStrictEqual({
                    ff: 'Arial',
                });

                expect(await commandService.executeCommand(ClearSelectionAllCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({});
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getStyle()).toStrictEqual({
                    ff: 'Arial',
                });
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({});
            });
            it('clear all with merged cells', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 1, endRow: 1, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getValue();
                }

                function getStyle(): Nullable<IStyleData> {
                    const value = getValue();
                    const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
                    if (value && styles) {
                        return styles.getStyleByCell(value);
                    }
                }

                function getMerge(): IRange[] | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getConfig().mergeData;
                }

                // set formats
                const paramsStyle: ISetRangeValuesCommandParams = {
                    value: {
                        s: {
                            ff: 'Arial',
                        },
                    },
                };

                // set style
                expect(await commandService.executeCommand(SetRangeValuesCommand.id, paramsStyle)).toBeTruthy();
                expect(getStyle()).toStrictEqual({
                    ff: 'Arial',
                });

                // set merge cell
                expect(await commandService.executeCommand(AddWorksheetMergeAllCommand.id)).toBeTruthy();
                expect(getMerge()).toStrictEqual([
                    { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                ]);

                // clear all with merged cells
                expect(await commandService.executeCommand(ClearSelectionAllCommand.id)).toBeTruthy();
                // clear formats
                expect(getValue()).toStrictEqual({});
                // remove merge
                expect(getMerge()).toStrictEqual([]);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getStyle()).toStrictEqual({
                    ff: 'Arial',
                });
                expect(getMerge()).toStrictEqual([
                    { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                ]);
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({});
                expect(getMerge()).toStrictEqual([]);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(ClearSelectionAllCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
});
