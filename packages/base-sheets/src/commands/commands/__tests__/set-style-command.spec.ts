import {
    BooleanNumber,
    FontItalic,
    FontWeight,
    HorizontalAlign,
    ICommandService,
    ICurrentUniverService,
    ITextDecoration,
    ITextRotation,
    Nullable,
    RedoCommand,
    SELECTION_TYPE,
    UndoCommand,
    Univer,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { SetRangeStyleMutation } from '../../mutations/set-range-styles.mutation';
import {
    SetBackgroundColorCommand,
    SetBoldCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetHorizontalTextAlignCommand,
    SetItalicCommand,
    SetStrikeThroughCommand,
    SetStyleCommand,
    SetTextColorCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetUnderlineCommand,
    SetVerticalTextAlignCommand,
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
        commandService.registerCommand(SetItalicCommand);
        commandService.registerCommand(SetUnderlineCommand);
        commandService.registerCommand(SetStrikeThroughCommand);
        commandService.registerCommand(SetFontSizeCommand);
        commandService.registerCommand(SetFontFamilyCommand);
        commandService.registerCommand(SetTextColorCommand);
        commandService.registerCommand(SetBackgroundColorCommand);
        commandService.registerCommand(SetVerticalTextAlignCommand);
        commandService.registerCommand(SetHorizontalTextAlignCommand);
        commandService.registerCommand(SetTextWrapCommand);
        commandService.registerCommand(SetTextRotationCommand);
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

                function getFontUnderline(): ITextDecoration | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getUnderline();
                }

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

    describe('strike-through', () => {
        describe('correct situations', () => {
            it('will toggle strike-through style when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
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

                function getFontThroughLine(): ITextDecoration | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getStrikeThrough();
                }

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

    describe('font size', () => {
        describe('correct situations', () => {
            it('will change font size when there is a selected range', async () => {
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

                function getFontSize(): number | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getFontSize();
                }

                expect(await commandService.executeCommand(SetFontSizeCommand.id, { value: 18 })).toBeTruthy();
                expect(getFontSize()).toBe(18);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetFontSizeCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('font family', () => {
        describe('correct situations', () => {
            it('will change font family when there is a selected range', async () => {
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

                function getFontFamily(): string | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getFontFamily();
                }

                expect(await commandService.executeCommand(SetFontFamilyCommand.id, { value: 'Arial' })).toBeTruthy();
                expect(getFontFamily()).toBe('Arial');
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetFontFamilyCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('font color', () => {
        describe('correct situations', () => {
            it('will change font color when there is a selected range', async () => {
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

                function getFontColor(): Nullable<string> | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getTextStyle()?.cl?.rgb;
                }

                expect(await commandService.executeCommand(SetTextColorCommand.id, { value: '#abcdef' })).toBeTruthy();
                expect(getFontColor()).toBe('#abcdef');
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetTextColorCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('background color', () => {
        describe('correct situations', () => {
            it('will change background color when there is a selected range', async () => {
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

                function getBackgroundColor(): string | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getBackground();
                }

                expect(
                    await commandService.executeCommand(SetBackgroundColorCommand.id, { value: '#abcdef' })
                ).toBeTruthy();
                expect(getBackgroundColor()).toBe('#abcdef');
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetBackgroundColorCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('vertical text align', () => {
        describe('correct situations', () => {
            it('will change vertical text align when there is a selected range', async () => {
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

                function getVerticalAlignment(): VerticalAlign | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getVerticalAlignment();
                }

                expect(
                    await commandService.executeCommand(SetVerticalTextAlignCommand.id, { value: VerticalAlign.TOP })
                ).toBeTruthy();
                expect(getVerticalAlignment()).toBe(VerticalAlign.TOP);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetVerticalTextAlignCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('horizontal text align', () => {
        describe('correct situations', () => {
            it('will change horizontal text align when there is a selected range', async () => {
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

                function getHorizontalAlignment(): HorizontalAlign | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getHorizontalAlignment();
                }

                expect(
                    await commandService.executeCommand(SetHorizontalTextAlignCommand.id, {
                        value: HorizontalAlign.RIGHT,
                    })
                ).toBeTruthy();
                expect(getHorizontalAlignment()).toBe(HorizontalAlign.RIGHT);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetHorizontalTextAlignCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('text wrap', () => {
        describe('correct situations', () => {
            it('will change text wrap when there is a selected range', async () => {
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

                function getTextWrap(): BooleanNumber | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getWrap();
                }

                expect(
                    await commandService.executeCommand(SetTextWrapCommand.id, {
                        value: WrapStrategy.WRAP,
                    })
                ).toBeTruthy();
                expect(getTextWrap()).toBe(WrapStrategy.WRAP);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetTextWrapCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('text rotation', () => {
        describe('correct situations', () => {
            it('will change text rotation when there is a selected range', async () => {
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

                function getTextRotation(): ITextRotation | undefined {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getTextRotation();
                }

                expect(
                    await commandService.executeCommand(SetTextRotationCommand.id, {
                        value: 90,
                    })
                ).toBeTruthy();
                expect(getTextRotation()?.a).toBe(90);
                expect(
                    await commandService.executeCommand(SetTextRotationCommand.id, {
                        value: 'v',
                    })
                ).toBeTruthy();
                expect(getTextRotation()?.v).toBe(BooleanNumber.TRUE);
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetTextRotationCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
});
