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

import type { DocumentDataModel, ICommand, Injector, ITextStyle, Univer } from '@univerjs/core';
import {
    BaselineOffset,
    BooleanNumber,
    DOC_RANGE_TYPE,
    ICommandService,
    IUniverInstanceService,
    RedoCommand,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    ResetInlineFormatTextBackgroundColorCommand,
    ResetInlineFormatTextColorCommand,
    SetInlineFormatBoldCommand,
    SetInlineFormatCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatTextFillCommand,
    SetInlineFormatUnderlineCommand,
} from '../inline-format.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test inline format commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getFormatValueAt(key: keyof ITextStyle, pos: number) {
        const univerInstanceService = get(IUniverInstanceService);
        const docsModel = univerInstanceService.getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC);

        if (docsModel?.getBody()?.textRuns == null) {
            return;
        }

        for (const textRun of docsModel.getBody()?.textRuns ?? []) {
            const { st, ed, ts = {} } = textRun;

            if (st <= pos && ed >= pos) {
                return ts[key];
            }
        }
    }

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetInlineFormatCommand);
        commandService.registerCommand(SetInlineFormatBoldCommand);
        commandService.registerCommand(SetInlineFormatItalicCommand);
        commandService.registerCommand(SetInlineFormatUnderlineCommand);
        commandService.registerCommand(SetInlineFormatStrikethroughCommand);
        commandService.registerCommand(SetInlineFormatSubscriptCommand);
        commandService.registerCommand(SetInlineFormatSuperscriptCommand);
        commandService.registerCommand(SetInlineFormatFontFamilyCommand);
        commandService.registerCommand(SetInlineFormatFontSizeCommand);
        commandService.registerCommand(SetInlineFormatTextColorCommand);
        commandService.registerCommand(SetInlineFormatTextFillCommand);
        commandService.registerCommand(SetInlineFormatTextBackgroundColorCommand);
        commandService.registerCommand(ResetInlineFormatTextColorCommand);
        commandService.registerCommand(ResetInlineFormatTextBackgroundColorCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const selectionManager = get(DocSelectionManagerService);

        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });

        selectionManager.__TEST_ONLY_add([
            {
                startOffset: 0,
                endOffset: 5,
                collapsed: false,
                isActive: true,
            },
        ]);

        selectionManager.__TEST_ONLY_add([
            {
                startOffset: 20,
                endOffset: 30,
                collapsed: false,
            },
        ]);
    });

    afterEach(() => univer.dispose());

    describe('Public inline format wrapper commands', () => {
        it('applies document text styles through the menu command wrappers', async () => {
            let appliedCommandCount = 0;

            try {
                await commandService.executeCommand(SetInlineFormatBoldCommand.id);
                appliedCommandCount++;
                await commandService.executeCommand(SetInlineFormatItalicCommand.id);
                appliedCommandCount++;
                await commandService.executeCommand(SetInlineFormatUnderlineCommand.id);
                appliedCommandCount++;
                await commandService.executeCommand(SetInlineFormatStrikethroughCommand.id);
                appliedCommandCount++;

                expect(getFormatValueAt('bl', 1)).toBe(BooleanNumber.TRUE);
                expect(getFormatValueAt('it', 1)).toBe(BooleanNumber.TRUE);
                expect(getFormatValueAt('ul', 1)).toStrictEqual({ s: BooleanNumber.TRUE });
                expect(getFormatValueAt('st', 1)).toStrictEqual({ s: BooleanNumber.TRUE });

                await commandService.executeCommand(SetInlineFormatSubscriptCommand.id);
                appliedCommandCount++;
                expect(getFormatValueAt('va', 1)).toBe(BaselineOffset.SUBSCRIPT);

                await commandService.executeCommand(SetInlineFormatSuperscriptCommand.id);
                appliedCommandCount++;
                expect(getFormatValueAt('va', 1)).toBe(BaselineOffset.SUPERSCRIPT);

                await commandService.executeCommand(SetInlineFormatSuperscriptCommand.id);
                appliedCommandCount++;
                expect(getFormatValueAt('va', 1)).toBe(BaselineOffset.NORMAL);

                await commandService.executeCommand(SetInlineFormatFontFamilyCommand.id, { value: 'Inter' });
                appliedCommandCount++;
                await commandService.executeCommand(SetInlineFormatFontSizeCommand.id, { value: 32 });
                appliedCommandCount++;
                expect(getFormatValueAt('ff', 1)).toBe('Inter');
                expect(getFormatValueAt('fs', 1)).toBe(32);

                await commandService.executeCommand(SetInlineFormatTextColorCommand.id, { value: '#224466' });
                appliedCommandCount++;
                await commandService.executeCommand(SetInlineFormatTextBackgroundColorCommand.id, { value: '#ffeeaa' });
                appliedCommandCount++;
                expect(getFormatValueAt('cl', 1)).toStrictEqual({ rgb: '#224466' });
                expect(getFormatValueAt('bg', 1)).toStrictEqual({ rgb: '#ffeeaa' });

                await commandService.executeCommand(ResetInlineFormatTextColorCommand.id);
                appliedCommandCount++;
                await commandService.executeCommand(ResetInlineFormatTextBackgroundColorCommand.id);
                appliedCommandCount++;
                expect(getFormatValueAt('cl', 1)).toStrictEqual({ rgb: null });
                expect(getFormatValueAt('bg', 1)).toStrictEqual({ rgb: null });

                await commandService.executeCommand(SetInlineFormatTextFillCommand.id, {
                    value: {
                        textFill: {
                            type: 'solid',
                            color: '#445566',
                            opacity: 0.8,
                        },
                    },
                });
                appliedCommandCount++;
                expect(getFormatValueAt('textFill', 1)).toStrictEqual({
                    type: 'solid',
                    color: '#445566',
                    opacity: 0.8,
                });
            } finally {
                for (let i = 0; i < appliedCommandCount; i++) {
                    await commandService.executeCommand(UndoCommand.id);
                }
            }
        });
    });

    describe('Set Bold by SetInlineFormatCommand', () => {
        it('Should change text in range(0, 5) to bold', async () => {
            expect(getFormatValueAt('bl', 1)).toBe(BooleanNumber.FALSE);
            expect(getFormatValueAt('bl', 21)).toBe(BooleanNumber.FALSE);
            expect(getFormatValueAt('bl', 25)).toBe(BooleanNumber.TRUE);

            const commandParams = {
                segmentId: '',
                preCommandId: SetInlineFormatBoldCommand.id,
            };

            await commandService.executeCommand(SetInlineFormatCommand.id, commandParams);

            expect(getFormatValueAt('bl', 1)).toBe(BooleanNumber.TRUE);
            expect(getFormatValueAt('bl', 21)).toBe(BooleanNumber.TRUE);
            expect(getFormatValueAt('bl', 25)).toBe(BooleanNumber.TRUE);

            await commandService.executeCommand(UndoCommand.id);
            expect(getFormatValueAt('bl', 1)).toBe(BooleanNumber.FALSE);
            expect(getFormatValueAt('bl', 21)).toBe(BooleanNumber.FALSE);
            expect(getFormatValueAt('bl', 25)).toBe(BooleanNumber.TRUE);

            await commandService.executeCommand(RedoCommand.id);
            expect(getFormatValueAt('bl', 1)).toBe(BooleanNumber.TRUE);
            expect(getFormatValueAt('bl', 21)).toBe(BooleanNumber.TRUE);
            expect(getFormatValueAt('bl', 25)).toBe(BooleanNumber.TRUE);
        });

        it('formats text ranges without applying stale table rect ranges', async () => {
            const selectionManager = get(DocSelectionManagerService);
            selectionManager.__replaceTextRangesWithNoRefresh({
                textRanges: [{
                    startOffset: 0,
                    endOffset: 5,
                    collapsed: false,
                    isActive: true,
                    rangeType: DOC_RANGE_TYPE.TEXT,
                }],
                rectRanges: [{
                    startOffset: 20,
                    endOffset: 30,
                    collapsed: false,
                    rangeType: DOC_RANGE_TYPE.RECT,
                    tableId: 'table-1',
                    startRow: 0,
                    endRow: 0,
                    startColumn: 0,
                    endColumn: 0,
                }],
                segmentId: '',
                segmentPage: -1,
                isEditing: true,
                style: {},
            } as never, {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
            });

            expect(getFormatValueAt('ff', 1)).toBe(undefined);
            expect(getFormatValueAt('ff', 21)).toBe(undefined);

            await commandService.executeCommand(SetInlineFormatCommand.id, {
                segmentId: '',
                preCommandId: SetInlineFormatFontFamilyCommand.id,
                value: 'Arial',
            });

            expect(getFormatValueAt('ff', 1)).toBe('Arial');
            expect(getFormatValueAt('ff', 21)).toBe(undefined);

            await commandService.executeCommand(UndoCommand.id);
        });
    });

    describe('Set Italic by SetInlineFormatCommand', () => {
        it('Should change text in range(0, 5) to italic', async () => {
            expect(getFormatValueAt('it', 1)).toBe(undefined);

            const commandParams = {
                segmentId: '',
                preCommandId: SetInlineFormatItalicCommand.id,
            };

            await commandService.executeCommand(SetInlineFormatCommand.id, commandParams);

            expect(getFormatValueAt('it', 1)).toBe(BooleanNumber.TRUE);

            await commandService.executeCommand(UndoCommand.id);
            expect(getFormatValueAt('it', 1)).toBe(undefined);

            await commandService.executeCommand(RedoCommand.id);
            expect(getFormatValueAt('it', 1)).toBe(BooleanNumber.TRUE);
        });
    });

    describe('Set Underline by SetInlineFormatCommand', () => {
        it('Should change text in range(0, 5) to underline', async () => {
            expect(getFormatValueAt('ul', 1)).toBe(undefined);

            const commandParams = {
                segmentId: '',
                preCommandId: SetInlineFormatUnderlineCommand.id,
            };

            await commandService.executeCommand(SetInlineFormatCommand.id, commandParams);

            expect(getFormatValueAt('ul', 1)).toStrictEqual({ s: BooleanNumber.TRUE });

            await commandService.executeCommand(UndoCommand.id);
            expect(getFormatValueAt('ul', 1)).toStrictEqual(undefined);

            await commandService.executeCommand(RedoCommand.id);
            expect(getFormatValueAt('ul', 1)).toStrictEqual({ s: BooleanNumber.TRUE });
        });
    });

    describe('Set Strickthrough by SetInlineFormatCommand', () => {
        it('Should change text in range(0, 5) to stroke', async () => {
            expect(getFormatValueAt('st', 1)).toBe(undefined);

            const commandParams = {
                segmentId: '',
                preCommandId: SetInlineFormatStrikethroughCommand.id,
            };

            await commandService.executeCommand(SetInlineFormatCommand.id, commandParams);

            expect(getFormatValueAt('st', 1)).toStrictEqual({ s: BooleanNumber.TRUE });

            await commandService.executeCommand(UndoCommand.id);
            expect(getFormatValueAt('st', 1)).toStrictEqual(undefined);

            await commandService.executeCommand(RedoCommand.id);
            expect(getFormatValueAt('st', 1)).toStrictEqual({ s: BooleanNumber.TRUE });
        });
    });

    describe('Set FontFamily by SetInlineFormatCommand', () => {
        it('Should change text in range(0, 5) to Arial', async () => {
            expect(getFormatValueAt('ff', 1)).toBe(undefined);

            const commandParams = {
                segmentId: '',
                preCommandId: SetInlineFormatFontFamilyCommand.id,
                value: 'Arial',
            };

            await commandService.executeCommand(SetInlineFormatCommand.id, commandParams);

            expect(getFormatValueAt('ff', 1)).toBe('Arial');

            await commandService.executeCommand(UndoCommand.id);
            expect(getFormatValueAt('ff', 1)).toBe(undefined);

            await commandService.executeCommand(RedoCommand.id);
            expect(getFormatValueAt('ff', 1)).toBe('Arial');
        });
    });

    describe('Set FontSize by SetInlineFormatCommand', () => {
        it('Should change text in range(0, 5) to 28', async () => {
            expect(getFormatValueAt('fs', 1)).toBe(24);

            const commandParams = {
                segmentId: '',
                preCommandId: SetInlineFormatFontSizeCommand.id,
                value: 28,
            };

            await commandService.executeCommand(SetInlineFormatCommand.id, commandParams);

            expect(getFormatValueAt('fs', 1)).toBe(28);

            await commandService.executeCommand(UndoCommand.id);
            expect(getFormatValueAt('fs', 1)).toBe(24);

            await commandService.executeCommand(RedoCommand.id);
            expect(getFormatValueAt('fs', 1)).toBe(28);
        });
    });

    describe('Set Text color by SetInlineFormatCommand', () => {
        it('Should change text in range(0, 5) to #000000', async () => {
            expect(getFormatValueAt('cl', 1)).toStrictEqual({
                rgb: 'rgb(0, 40, 86)',
            });

            const commandParams = {
                segmentId: '',
                preCommandId: SetInlineFormatTextColorCommand.id,
                value: '#000000',
            };

            await commandService.executeCommand(SetInlineFormatCommand.id, commandParams);

            expect(getFormatValueAt('cl', 1)).toStrictEqual({
                rgb: '#000000',
            });

            await commandService.executeCommand(UndoCommand.id);
            expect(getFormatValueAt('cl', 1)).toStrictEqual({
                rgb: 'rgb(0, 40, 86)',
            });

            await commandService.executeCommand(RedoCommand.id);
            expect(getFormatValueAt('cl', 1)).toStrictEqual({
                rgb: '#000000',
            });
        });

        it('Should reset text color in selected ranges', async () => {
            await commandService.executeCommand(SetInlineFormatCommand.id, {
                segmentId: '',
                preCommandId: SetInlineFormatTextColorCommand.id,
                value: '#123456',
            });

            await commandService.executeCommand(ResetInlineFormatTextColorCommand.id);

            expect(getFormatValueAt('cl', 1)).toStrictEqual({
                rgb: null,
            });

            await commandService.executeCommand(UndoCommand.id);
            expect(getFormatValueAt('cl', 1)).toStrictEqual({
                rgb: '#123456',
            });

            await commandService.executeCommand(RedoCommand.id);
            expect(getFormatValueAt('cl', 1)).toStrictEqual({
                rgb: null,
            });
        });
    });
});
