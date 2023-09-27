import {
    FontItalic,
    FontWeight,
    ICommandService,
    ICurrentUniverService,
    RedoCommand,
    SELECTION_TYPE,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { SetRangeStyleMutation } from '../../mutations/set-range-styles.mutation';
import {
    SetBoldCommand,
    SetItalicCommand,
    SetStrikeThroughCommand,
    SetStyleCommand,
    SetUnderlineCommand,
} from '../set-style.command';
import { createCommandTestBed } from './create-command-test-bed';

describe("Test commands used for updating cells' styles", () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetBoldCommand);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetRangeStyleMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('bold', () => {
        beforeEach(() => {
            const testBed = createCommandTestBed();
            univer = testBed.univer;
            get = testBed.get;

            commandService = get(ICommandService);
            commandService.registerCommand(SetBoldCommand);
            commandService.registerCommand(SetStyleCommand);
            commandService.registerCommand(SetRangeStyleMutation);
        });

        describe('correct situations', () => {
            it('will toggle bold style when there is a selected range', async () => {
                const selectionManagerService = get(SelectionManagerService);
                selectionManagerService.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManagerService.add([
                    {
                        rangeData: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0 },
                        cellRange: {
                            startRow: 0,
                            startColumn: 0,
                            endColumn: 0,
                            endRow: 0,
                            column: 0,
                            row: 0,
                            isMerged: false,
                            isMergedMainCell: false,
                        },
                        selectionType: SELECTION_TYPE.NORMAL,
                        style: null,
                    },
                ]);

                function getFontBold(): FontWeight | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getFontWeight();
                }

                expect(await commandService.executeCommand(SetBoldCommand.id)).toBeTruthy();
                expect(getFontBold()).toBe(FontWeight.BOLD);
                expect(await commandService.executeCommand(SetBoldCommand.id)).toBeTruthy();
                expect(getFontBold()).toBe(FontWeight.NORMAL);
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getFontBold()).toBe(FontWeight.BOLD);
                // undo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getFontBold()).toBe(FontWeight.NORMAL);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetBoldCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('italic', () => {
        beforeEach(() => {
            const testBed = createCommandTestBed();
            univer = testBed.univer;
            get = testBed.get;

            commandService = get(ICommandService);
            commandService.registerCommand(SetItalicCommand);
            commandService.registerCommand(SetStyleCommand);
            commandService.registerCommand(SetRangeStyleMutation);
        });

        describe('correct situations', () => {
            it('will toggle italic style when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        rangeData: { startRow: 0, startColumn: 0, endColumn: 1, endRow: 0 },
                        cellRange: {
                            startRow: 0,
                            startColumn: 0,
                            endColumn: 0,
                            endRow: 0,
                            column: 0,
                            row: 0,
                            isMerged: false,
                            isMergedMainCell: false,
                        },
                        selectionType: SELECTION_TYPE.NORMAL,
                        style: null,
                    },
                ]);

                function getFontItalic(
                    startRow: number,
                    startColumn: number,
                    endRow: number,
                    endColumn: number
                ): boolean | undefined {
                    return (
                        get(ICurrentUniverService)
                            .getUniverSheetInstance('test')
                            ?.getWorkBook()
                            .getSheetBySheetId('sheet1')
                            ?.getRange(startRow, startColumn, endRow, endColumn)
                            .getFontStyle() === FontItalic.ITALIC
                    );
                }

                expect(await commandService.executeCommand(SetItalicCommand.id)).toBeTruthy();
                expect(getFontItalic(0, 0, 0, 0)).toBeTruthy(); // it should work for every cell in selection
                expect(getFontItalic(0, 0, 0, 1)).toBeTruthy();
            });
        });
    });

    describe('stroke-through', () => {
        beforeEach(() => {
            const testBed = createCommandTestBed();
            univer = testBed.univer;
            get = testBed.get;

            commandService = get(ICommandService);
            commandService.registerCommand(SetStrikeThroughCommand);
            commandService.registerCommand(SetStyleCommand);
            commandService.registerCommand(SetRangeStyleMutation);
        });

        describe('correct situations', () => {
            it('will toggle italic style when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        rangeData: { startRow: 0, startColumn: 0, endColumn: 1, endRow: 0 },
                        cellRange: {
                            startRow: 0,
                            startColumn: 0,
                            endColumn: 0,
                            endRow: 0,
                            column: 0,
                            row: 0,
                            isMerged: false,
                            isMergedMainCell: false,
                        },
                        selectionType: SELECTION_TYPE.NORMAL,
                        style: null,
                    },
                ]);

                function getStrokeThrough(
                    startRow: number,
                    startColumn: number,
                    endRow: number,
                    endColumn: number
                ): boolean | undefined {
                    return !!get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(startRow, startColumn, endRow, endColumn)
                        .getStrikeThrough().s;
                }

                expect(await commandService.executeCommand(SetStrikeThroughCommand.id)).toBeTruthy();
                expect(getStrokeThrough(0, 0, 0, 0)).toBeTruthy(); // it should work for every cell in selection
                expect(getStrokeThrough(0, 0, 0, 1)).toBeTruthy();
            });
        });
    });

    describe('underlined', () => {
        beforeEach(() => {
            const testBed = createCommandTestBed();
            univer = testBed.univer;
            get = testBed.get;

            commandService = get(ICommandService);
            commandService.registerCommand(SetUnderlineCommand);
            commandService.registerCommand(SetStyleCommand);
            commandService.registerCommand(SetRangeStyleMutation);
        });

        describe('correct situations', () => {
            it('will toggle italic style when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        rangeData: { startRow: 0, startColumn: 0, endColumn: 1, endRow: 0 },
                        cellRange: {
                            startRow: 0,
                            startColumn: 0,
                            endColumn: 0,
                            endRow: 0,
                            column: 0,
                            row: 0,
                            isMerged: false,
                            isMergedMainCell: false,
                        },
                        selectionType: SELECTION_TYPE.NORMAL,
                        style: null,
                    },
                ]);

                function getUnderlined(
                    startRow: number,
                    startColumn: number,
                    endRow: number,
                    endColumn: number
                ): boolean | undefined {
                    return !!get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(startRow, startColumn, endRow, endColumn)
                        .getUnderline().s;
                }

                expect(await commandService.executeCommand(SetUnderlineCommand.id)).toBeTruthy();
                expect(getUnderlined(0, 0, 0, 0)).toBeTruthy(); // it should work for every cell in selection
                expect(getUnderlined(0, 0, 0, 1)).toBeTruthy();
            });
        });
    });
});
