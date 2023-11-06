/* eslint-disable no-magic-numbers */

import {
    BooleanNumber,
    ICommand,
    ICommandService,
    IStyleBase,
    IUniverInstanceService,
    RedoCommand,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_TEXT_SELECTION_PLUGIN_NAME } from '../../../Basics/docs-view-key';
import { TextSelectionManagerService } from '../../../services/text-selection-manager.service';
import { RichTextEditingMutation } from '../../mutations/core-editing.mutation';
import {
    SetInlineFormatBoldCommand,
    SetInlineFormatCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from '../inline-format.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test inline format commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getFormatValueAt(key: keyof IStyleBase, pos: number) {
        const univerInstanceService = get(IUniverInstanceService);
        const docsModel = univerInstanceService.getUniverDocInstance('test-doc');

        if (docsModel?.body?.textRuns == null) {
            return;
        }

        for (const textRun of docsModel.body?.textRuns) {
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
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const selectionManager = get(TextSelectionManagerService);

        selectionManager.setCurrentSelection({
            pluginName: NORMAL_TEXT_SELECTION_PLUGIN_NAME,
            unitId: 'test-doc',
        });

        selectionManager.add([
            {
                cursorStart: 0,
                cursorEnd: 5,
                isCollapse: false,
                segmentId: '',
            },
        ]);
    });

    afterEach(() => univer.dispose());

    describe('Set Bold by SetInlineFormatCommand', () => {
        it('Should change text in range(0, 5) to bold', async () => {
            expect(getFormatValueAt('bl', 1)).toBe(BooleanNumber.FALSE);

            const commandParams = {
                segmentId: '',
                preCommandId: SetInlineFormatBoldCommand.id,
            };

            await commandService.executeCommand(SetInlineFormatCommand.id, commandParams);

            expect(getFormatValueAt('bl', 1)).toBe(BooleanNumber.TRUE);

            await commandService.executeCommand(UndoCommand.id);
            expect(getFormatValueAt('bl', 1)).toBe(BooleanNumber.FALSE);

            await commandService.executeCommand(RedoCommand.id);
            expect(getFormatValueAt('bl', 1)).toBe(BooleanNumber.TRUE);
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
    });
});
