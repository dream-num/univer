/* eslint-disable no-magic-numbers */

import {
    NORMAL_TEXT_SELECTION_PLUGIN_NAME,
    RichTextEditingMutation,
    TextSelectionManagerService,
} from '@univerjs/base-docs';
import {
    IInnerCutCommandParams,
    IInnerPasteCommandParams,
    InnerCutCommand,
    InnerPasteCommand,
} from '@univerjs/base-docs/commands/commands/clipboard.inner.command.js';
import {
    BooleanNumber,
    ICommand,
    ICommandService,
    IDocumentData,
    IStyleBase,
    IUniverInstanceService,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createCommandTestBed } from './create-command-test-bed';

const TEST_DOCUMENT_DATA_EN: IDocumentData = {
    id: 'test-doc',
    body: {
        dataStream: 'What’s New in the 2022\r Gartner Hype Cycle for Emerging Technologies\r\n',
        textRuns: [
            {
                st: 0,
                ed: 22,
                ts: {
                    bl: BooleanNumber.FALSE,
                    fs: 24,
                    cl: {
                        rgb: 'rgb(0, 40, 86)',
                    },
                },
            },
            {
                st: 23,
                ed: 68,
                ts: {
                    bl: BooleanNumber.TRUE,
                    fs: 24,
                    cl: {
                        rgb: 'rgb(0, 40, 86)',
                    },
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 22,
            },
            {
                startIndex: 68,
                paragraphStyle: {
                    spaceAbove: 20,
                    indentFirstLine: 20,
                },
            },
        ],
        sectionBreaks: [],
        customBlocks: [],
    },
    documentStyle: {
        pageSize: {
            width: 594.3,
            height: 840.51,
        },
        marginTop: 72,
        marginBottom: 72,
        marginRight: 90,
        marginLeft: 90,
    },
};

describe('test cases in clipboard', () => {
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

    function getTextByPosition(start: number, end: number) {
        const univerInstanceService = get(IUniverInstanceService);
        const docsModel = univerInstanceService.getUniverDocInstance('test-doc');

        return docsModel?.body?.dataStream.slice(start, end);
    }

    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_DOCUMENT_DATA_EN);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(InnerPasteCommand);
        commandService.registerCommand(InnerCutCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const selectionManager = get(TextSelectionManagerService);

        selectionManager.setCurrentSelection({
            pluginName: NORMAL_TEXT_SELECTION_PLUGIN_NAME,
            unitId: 'test-doc',
        });

        selectionManager.add([
            {
                startOffset: 0,
                endOffset: 5,
                collapsed: false,
                segmentId: '',
            },
        ]);

        selectionManager.add([
            {
                startOffset: 10,
                endOffset: 15,
                collapsed: false,
                segmentId: '',
            },
        ]);
    });

    afterEach(() => univer.dispose());

    describe('Test paste in multiple ranges', () => {
        it('Should paste content to each selection ranges', async () => {
            expect(getTextByPosition(0, 5)).toBe(`What’`);
            expect(getFormatValueAt('bl', 0)).toBe(BooleanNumber.FALSE);

            const commandParams: IInnerPasteCommandParams = {
                segmentId: '',
                body: {
                    dataStream: 'univer',
                    textRuns: [
                        {
                            st: 0,
                            ed: 6,
                            ts: {
                                bl: BooleanNumber.TRUE,
                            },
                        },
                    ],
                },
            };

            await commandService.executeCommand(InnerPasteCommand.id, commandParams);

            expect(getTextByPosition(0, 6)).toBe(`univer`);
            expect(getTextByPosition(11, 17)).toBe('univer');
            expect(getFormatValueAt('bl', 0)).toBe(BooleanNumber.TRUE);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        });
    });

    describe('Test cut in multiple ranges', () => {
        it('Should cut content to each selection ranges', async () => {
            expect(getTextByPosition(0, 5)).toBe(`What’`);
            expect(getFormatValueAt('bl', 0)).toBe(BooleanNumber.FALSE);

            const commandParams: IInnerCutCommandParams = {
                segmentId: '',
            };

            await commandService.executeCommand(InnerCutCommand.id, commandParams);

            expect(getTextByPosition(0, 5)).toBe(`s New`);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        });
    });
});
