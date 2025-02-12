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

import type { IColorStyle, Injector, ITextDecoration, ITextRotation, Univer, Workbook } from '@univerjs/core';
import type { ISetStyleCommandParams } from '../set-style.command';
import {
    BooleanNumber,
    FontItalic,
    FontWeight,
    HorizontalAlign,
    ICommandService,
    IUniverInstanceService,
    RANGE_TYPE,
    RedoCommand,
    UndoCommand,
    UniverInstanceType,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { InsertSheetMutation } from '../../mutations/insert-sheet.mutation';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { InsertSheetCommand } from '../insert-sheet.command';
import {
    SetBackgroundColorCommand,
    SetBoldCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetHorizontalTextAlignCommand,
    SetItalicCommand,
    SetOverlineCommand,
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
        commandService.registerCommand(SetOverlineCommand);
        commandService.registerCommand(SetFontSizeCommand);
        commandService.registerCommand(SetFontFamilyCommand);
        commandService.registerCommand(SetTextColorCommand);
        commandService.registerCommand(SetBackgroundColorCommand);
        commandService.registerCommand(SetVerticalTextAlignCommand);
        commandService.registerCommand(SetHorizontalTextAlignCommand);
        commandService.registerCommand(SetTextWrapCommand);
        commandService.registerCommand(SetTextRotationCommand);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(InsertSheetCommand);
        commandService.registerCommand(InsertSheetMutation);
    });

    afterEach(() => univer.dispose());

    it('set array of style', async () => {
        const range = { startRow: 1, startColumn: 1, endColumn: 3, endRow: 3, rangeType: RANGE_TYPE.NORMAL };

        function getFontColor(row: number, col: number) {
            return get(IUniverInstanceService)
                .getUniverSheetInstance('test')!
                .getSheetBySheetId('sheet1')!
                .getRange(row, col)
                .getFontColor();
        }

        const defaultColor = '#000';
        const color1 = '#aaa';
        const color2 = '#bbb';
        const color3 = '#ccc';
        const commandParams: ISetStyleCommandParams<IColorStyle[][]> = {
            range,
            /** Set style by array */
            style: {
                type: 'cl',
                value: [
                    [{ rgb: color1 }, { rgb: color1 }, { rgb: color1 }],
                    [{ rgb: color2 }, { rgb: color2 }, { rgb: color2 }],
                    [{ rgb: color3 }, { rgb: color3 }, { rgb: color3 }],
                ],
            },
        };
        expect(await commandService.executeCommand(SetStyleCommand.id, commandParams)).toBeTruthy();
        expect(getFontColor(0, 0)).toBe(defaultColor);
        expect(getFontColor(1, 1)).toBe(color1);
        expect(getFontColor(2, 1)).toBe(color2);
        expect(getFontColor(3, 1)).toBe(color3);
        // undo
        expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        expect(getFontColor(1, 1)).toBe(defaultColor);
        expect(getFontColor(2, 1)).toBe(defaultColor);
        expect(getFontColor(3, 1)).toBe(defaultColor);
        // redo
        expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
        expect(getFontColor(1, 1)).toBe(color1);
        expect(getFontColor(2, 1)).toBe(color2);
        expect(getFontColor(3, 1)).toBe(color3);
    });

    describe('bold', () => {
        describe('correct situations', () => {
            it('will toggle bold style when there is a selected range', async () => {
                const selectionManagerService = get(SheetsSelectionsService);
                selectionManagerService.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: {
                            startRow: 0,
                            startColumn: 0,
                            endColumn: 0,
                            endRow: 0,
                            actualColumn: 0,
                            actualRow: 0,
                            isMerged: false,
                            isMergedMainCell: false,
                        },
                        style: null,
                    },
                ]);

                function getFontBold(): FontWeight | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
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
                // redo
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
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 1, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: {
                            startRow: 0,
                            startColumn: 0,
                            endColumn: 0,
                            endRow: 0,
                            actualColumn: 0,
                            actualRow: 0,
                            isMerged: false,
                            isMergedMainCell: false,
                        },
                        style: null,
                    },
                ]);

                function getFontItalic(
                    startRow: number,
                    startColumn: number,
                    endRow: number,
                    endColumn: number
                ): FontItalic | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(startRow, startColumn, endRow, endColumn)
                        .getFontStyle();
                }

                expect(await commandService.executeCommand(SetItalicCommand.id)).toBeTruthy();
                expect(getFontItalic(0, 0, 0, 0)).toBe(FontItalic.ITALIC); // it should work for every cell in selection
                expect(getFontItalic(0, 0, 0, 1)).toBe(FontItalic.ITALIC);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getFontItalic(0, 0, 0, 0)).toBe(FontItalic.NORMAL);
                expect(getFontItalic(0, 0, 0, 1)).toBe(FontItalic.NORMAL);
                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getFontItalic(0, 0, 0, 0)).toBe(FontItalic.ITALIC);
                expect(getFontItalic(0, 0, 0, 1)).toBe(FontItalic.ITALIC);
            });
        });
    });

    describe('underline', () => {
        describe('correct situations', () => {
            it('will toggle underline style when there is a selected range', async () => {
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: {
                            startRow: 0,
                            startColumn: 0,
                            endColumn: 0,
                            endRow: 0,
                            actualColumn: 0,
                            actualRow: 0,
                            isMerged: false,
                            isMergedMainCell: false,
                        },
                        style: null,
                    },
                ]);

                function getFontUnderline(): ITextDecoration | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getUnderline();
                }

                expect(await commandService.executeCommand(SetUnderlineCommand.id)).toBeTruthy();
                expect(getFontUnderline()?.s).toBe(BooleanNumber.TRUE);
                expect(await commandService.executeCommand(SetUnderlineCommand.id)).toBeTruthy();
                expect(getFontUnderline()?.s).toBe(BooleanNumber.FALSE);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getFontUnderline()?.s).toBe(BooleanNumber.TRUE);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
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
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: {
                            startRow: 0,
                            startColumn: 0,
                            endColumn: 0,
                            endRow: 0,
                            actualColumn: 0,
                            actualRow: 0,
                            isMerged: false,
                            isMergedMainCell: false,
                        },
                        style: null,
                    },
                ]);

                function getFontThroughLine(): ITextDecoration | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getStrikeThrough();
                }

                expect(await commandService.executeCommand(SetStrikeThroughCommand.id)).toBeTruthy();
                expect(getFontThroughLine()?.s).toBe(BooleanNumber.TRUE);
                expect(await commandService.executeCommand(SetStrikeThroughCommand.id)).toBeTruthy();
                expect(getFontThroughLine()?.s).toBe(BooleanNumber.FALSE);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getFontThroughLine()?.s).toBe(BooleanNumber.TRUE);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
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
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getFontSize(): number | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getFontSize();
                }

                expect(await commandService.executeCommand(SetFontSizeCommand.id, { value: 18 })).toBeTruthy();
                expect(getFontSize()).toBe(18);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getFontSize()).toBe(11);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
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
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getFontFamily(): string | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getFontFamily();
                }

                expect(await commandService.executeCommand(SetFontFamilyCommand.id, { value: 'Times New Roman' })).toBeTruthy();
                expect(getFontFamily()).toBe('Times New Roman');

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getFontFamily()).toBe('Arial');

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getFontFamily()).toBe('Times New Roman');
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
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: {
                            startRow: 0,
                            startColumn: 0,
                            endColumn: 0,
                            endRow: 0,
                            actualColumn: 0,
                            actualRow: 0,
                            isMerged: false,
                            isMergedMainCell: false,
                        },
                        style: null,
                    },
                ]);

                function getFontColor(): string | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getFontColor();
                }
                function getFontThroughLine(): ITextDecoration | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getStrikeThrough();
                }
                function getFontUnderline(): ITextDecoration | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getUnderline();
                }
                function getFontOverline(): ITextDecoration | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getOverline();
                }

                expect(await commandService.executeCommand(SetStrikeThroughCommand.id)).toBeTruthy();
                expect(getFontThroughLine()?.s).toBe(BooleanNumber.TRUE);

                expect(await commandService.executeCommand(SetUnderlineCommand.id)).toBeTruthy();
                expect(getFontUnderline()?.s).toBe(BooleanNumber.TRUE);

                expect(await commandService.executeCommand(SetOverlineCommand.id)).toBeTruthy();
                expect(getFontOverline()?.s).toBe(BooleanNumber.TRUE);

                expect(await commandService.executeCommand(SetTextColorCommand.id, { value: '#abcdef' })).toBeTruthy();
                expect(getFontColor()).toBe('#abcdef');

                // You need to ensure that the color of the strike through/underline/overline will also be changed
                expect(getFontThroughLine()?.cl?.rgb).toBe('#abcdef');
                expect(getFontUnderline()?.cl?.rgb).toBe('#abcdef');
                expect(getFontOverline()?.cl?.rgb).toBe('#abcdef');

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getFontColor()).toBe('#000');
                expect(getFontThroughLine()).toStrictEqual({
                    s: BooleanNumber.TRUE,
                }); // no color
                expect(getFontUnderline()).toStrictEqual({
                    s: BooleanNumber.TRUE,
                });
                expect(getFontOverline()).toStrictEqual({
                    s: BooleanNumber.TRUE,
                });

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getFontColor()).toBe('#abcdef');
                expect(getFontThroughLine()?.cl?.rgb).toBe('#abcdef');
                expect(getFontUnderline()?.cl?.rgb).toBe('#abcdef');
                expect(getFontOverline()?.cl?.rgb).toBe('#abcdef');
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
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getBackgroundColor(): string | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getBackground();
                }

                expect(
                    await commandService.executeCommand(SetBackgroundColorCommand.id, { value: '#abcdef' })
                ).toBeTruthy();
                expect(getBackgroundColor()).toBe('#abcdef');

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getBackgroundColor()).toBe('#fff');

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
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
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getVerticalAlignment(): VerticalAlign | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getVerticalAlignment();
                }

                expect(
                    await commandService.executeCommand(SetVerticalTextAlignCommand.id, { value: VerticalAlign.TOP })
                ).toBeTruthy();
                expect(getVerticalAlignment()).toBe(VerticalAlign.TOP);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getVerticalAlignment()).toBe(VerticalAlign.UNSPECIFIED);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
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
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getHorizontalAlignment(): HorizontalAlign | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getHorizontalAlignment();
                }

                expect(
                    await commandService.executeCommand(SetHorizontalTextAlignCommand.id, {
                        value: HorizontalAlign.RIGHT,
                    })
                ).toBeTruthy();
                expect(getHorizontalAlignment()).toBe(HorizontalAlign.RIGHT);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getHorizontalAlignment()).toBe(HorizontalAlign.UNSPECIFIED);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
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
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getTextWrap(): BooleanNumber | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getWrap();
                }

                expect(
                    await commandService.executeCommand(SetTextWrapCommand.id, {
                        value: WrapStrategy.WRAP,
                    })
                ).toBeTruthy();
                expect(getTextWrap()).toBe(BooleanNumber.TRUE);

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getTextWrap()).toBe(BooleanNumber.FALSE);

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getTextWrap()).toBe(BooleanNumber.TRUE);
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
                const selectionManager = get(SheetsSelectionsService);
                selectionManager.addSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                function getTextRotation(): ITextRotation | undefined {
                    return get(IUniverInstanceService)
                        .getUniverSheetInstance('test')
                        ?.getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getTextRotation();
                }

                expect(
                    await commandService.executeCommand(SetTextRotationCommand.id, {
                        value: 90,
                    })
                ).toBeTruthy();

                expect(getTextRotation()).toStrictEqual({
                    a: 90,
                });
                expect(
                    await commandService.executeCommand(SetTextRotationCommand.id, {
                        value: 'v',
                    })
                ).toBeTruthy();
                expect(getTextRotation()).toStrictEqual({
                    a: 0,
                    v: BooleanNumber.TRUE,
                });

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getTextRotation()).toStrictEqual({
                    a: 90,
                });

                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getTextRotation()).toStrictEqual({
                    a: 0,
                    v: BooleanNumber.FALSE,
                }); // default value

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getTextRotation()).toStrictEqual({
                    a: 90,
                });
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getTextRotation()).toStrictEqual({
                    a: 0,
                    v: BooleanNumber.TRUE,
                });
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetTextRotationCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('set style with specific range', () => {
        it('should use the correct unitId and subUnitId when range is provided', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;

            // Insert a new sheet
            expect(await commandService.executeCommand(InsertSheetCommand.id)).toBeTruthy();

            const newSheet = workbook.getSheets()[1]; // Get the newly inserted sheet
            const unitId = workbook.getUnitId();
            const subUnitId = newSheet.getSheetId();

            const range = { startRow: 0, startColumn: 0, endColumn: 1, endRow: 1, rangeType: RANGE_TYPE.NORMAL };

            const commandParams: ISetStyleCommandParams<IColorStyle> = {
                range,
                unitId,
                subUnitId,
                style: {
                    type: 'bg',
                    value: { rgb: '#FF0000' },
                },
            };

            expect(await commandService.executeCommand(SetStyleCommand.id, commandParams)).toBeTruthy();

            // Verify that the background color was set correctly
            const getBackgroundColor = (row: number, col: number) =>
                workbook.getSheetBySheetId(subUnitId)!
                    .getRange(row, col)
                    .getBackground();

            expect(getBackgroundColor(0, 0)).toBe('#FF0000');
            expect(getBackgroundColor(0, 1)).toBe('#FF0000');
            expect(getBackgroundColor(1, 0)).toBe('#FF0000');
            expect(getBackgroundColor(1, 1)).toBe('#FF0000');

            // undo
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getBackgroundColor(0, 0)).toBe('#fff');
            expect(getBackgroundColor(1, 1)).toBe('#fff');

            // redo
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getBackgroundColor(0, 0)).toBe('#FF0000');
            expect(getBackgroundColor(1, 1)).toBe('#FF0000');
        });
    });
});
