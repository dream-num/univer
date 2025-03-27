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

import type { ICellData, Injector, IRange, IStyleData, Nullable, Univer } from '@univerjs/core';
import type { ISetRangeValuesCommandParams } from '../set-range-values.command';
import {
    CellValueType,
    ICommandService,
    IUniverInstanceService,
    RANGE_TYPE,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MergeCellController } from '../../../controllers/merge-cell.controller';
import { RefRangeService } from '../../../services/ref-range/ref-range.service';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { AddWorksheetMergeAllCommand, AddWorksheetMergeCommand } from '../add-worksheet-merge.command';
import { ClearSelectionAllCommand } from '../clear-selection-all.command';
import { ClearSelectionContentCommand } from '../clear-selection-content.command';
import { ClearSelectionFormatCommand } from '../clear-selection-format.command';
import { SetRangeValuesCommand } from '../set-range-values.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test clear selection content commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [[MergeCellController], [RefRangeService]]);
        univer = testBed.univer;
        get = testBed.get;
        get(MergeCellController);
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
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
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
                expect(getValue()).toStrictEqual(null);
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({
                    v: 'A1',
                    t: CellValueType.STRING,
                });
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual(null);

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
                const selectionManager = get(SheetsSelectionsService);

                selectionManager.addSelections([
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
                    t: 1,
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
                    t: 1,
                });
            });
            it('clear formats with merged cells', async () => {
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
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
                        ?.getConfig()
                        .mergeData;
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
                    t: 1,
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
                    t: 1,
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
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
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
                expect(getValue()).toStrictEqual(null);
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getStyle()).toStrictEqual({
                    ff: 'Arial',
                });
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual(null);
            });
            it('clear all with merged cells', async () => {
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
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
                        ?.getConfig()
                        .mergeData;
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
                expect(getValue()).toStrictEqual(null);
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
                expect(getValue()).toStrictEqual(null);
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
