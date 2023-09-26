import {
    BooleanNumber,
    FontItalic,
    FontWeight,
    ICommandService,
    ICurrentUniverService,
    ITextDecoration,
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

describe('Test style commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let currentUniverService: ICurrentUniverService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetBoldCommand);
        commandService.registerCommand(SetItalicCommand);
        commandService.registerCommand(SetUnderlineCommand);
        commandService.registerCommand(SetStrikeThroughCommand);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetRangeStyleMutation);

        currentUniverService = get(ICurrentUniverService);
        currentUniverService.focusUniverInstance('test'); // used in undo
    });

    afterEach(() => {
        // univer.dispose();
    });

    describe('bold', () => {
        describe('correct situations', () => {
            it('will toggle bold style when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        rangeData: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0 },
                        cellRange: null,
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
                        rangeData: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0 },
                        cellRange: null,
                        selectionType: SELECTION_TYPE.NORMAL,
                        style: null,
                    },
                ]);

                function getFontStyle(): FontItalic | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getFontStyle();
                }

                expect(await commandService.executeCommand(SetItalicCommand.id)).toBeTruthy();
                expect(getFontStyle()).toBe(FontItalic.ITALIC);
                expect(await commandService.executeCommand(SetItalicCommand.id)).toBeTruthy();
                expect(getFontStyle()).toBe(FontItalic.NORMAL);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetItalicCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('underline', () => {
        describe('correct situations', () => {
            it('will toggle underline style when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        rangeData: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0 },
                        cellRange: null,
                        selectionType: SELECTION_TYPE.NORMAL,
                        style: null,
                    },
                ]);

                function getFontUnderline(): ITextDecoration | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getUnderline();
                }
                if (!getFontUnderline()) throw new Error('Underline Error');
                expect(await commandService.executeCommand(SetUnderlineCommand.id)).toBeTruthy();
                expect(getFontUnderline()?.s).toBe(BooleanNumber.TRUE);
                expect(await commandService.executeCommand(SetUnderlineCommand.id)).toBeTruthy();
                expect(getFontUnderline()?.s).toBe(BooleanNumber.FALSE);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetUnderlineCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('throughLine', () => {
        describe('correct situations', () => {
            it('will toggle through-line style when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        rangeData: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0 },
                        cellRange: null,
                        selectionType: SELECTION_TYPE.NORMAL,
                        style: null,
                    },
                ]);

                function getFontThroughLine(): ITextDecoration | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getStrikeThrough();
                }
                if (!getFontThroughLine()) throw new Error('ThroughLine Error');
                expect(await commandService.executeCommand(SetStrikeThroughCommand.id)).toBeTruthy();
                expect(getFontThroughLine()?.s).toBe(BooleanNumber.TRUE);
                expect(await commandService.executeCommand(SetStrikeThroughCommand.id)).toBeTruthy();
                expect(getFontThroughLine()?.s).toBe(BooleanNumber.FALSE);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetStrikeThroughCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
});
