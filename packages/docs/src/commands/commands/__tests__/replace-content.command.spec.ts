/* eslint-disable no-magic-numbers */

import {
    ICommand,
    ICommandService,
    IDocumentData,
    IUniverInstanceService,
    RedoCommand,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_TEXT_SELECTION_PLUGIN_NAME } from '../../../basics/docs-view-key';
import { TextSelectionManagerService } from '../../../services/text-selection-manager.service';
import { RichTextEditingMutation } from '../../mutations/core-editing.mutation';
import { CoverContentCommand, ReplaceContentCommand } from '../replace-content.command';
import { createCommandTestBed } from './create-command-test-bed';

const TEST_DOCUMENT_DATA_EN: IDocumentData = {
    id: 'test-doc',
    body: {
        dataStream: '=SUM(A2:B4)\r\n',
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

describe('replace or cover content of document', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getDataStream() {
        const univerInstanceService = get(IUniverInstanceService);
        const docsModel = univerInstanceService.getUniverDocInstance('test-doc');

        if (docsModel?.body?.dataStream == null) {
            return '';
        }

        return docsModel?.body?.dataStream;
    }

    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_DOCUMENT_DATA_EN);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(ReplaceContentCommand);
        commandService.registerCommand(CoverContentCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const selectionManager = get(TextSelectionManagerService);

        selectionManager.setCurrentSelection({
            pluginName: NORMAL_TEXT_SELECTION_PLUGIN_NAME,
            unitId: 'test-doc',
        });

        selectionManager.add([
            {
                startOffset: 5,
                endOffset: 5,
                collapsed: false,
                segmentId: '',
            },
        ]);
    });

    afterEach(() => univer.dispose());

    describe('replace content of document and reserve undo and redo stack', () => {
        it('Should pass the test case when replace content', async () => {
            expect(getDataStream().length).toBe(13);
            const commandParams = {
                unitId: 'test-doc',
                body: {
                    dataStream: '=AVERAGE(A4:B8)',
                }, // Do not contain `\r\n` at the end.
                textRanges: [],
                segmentId: '',
            };

            await commandService.executeCommand(ReplaceContentCommand.id, commandParams);

            expect(getDataStream().length).toBe(17);

            await commandService.executeCommand(UndoCommand.id);

            expect(getDataStream().length).toBe(13);

            await commandService.executeCommand(RedoCommand.id);

            expect(getDataStream().length).toBe(17);

            // recovery the doc.
            await commandService.executeCommand(UndoCommand.id);
        });
    });

    describe('cover content of document and clear undo and redo stack', () => {
        it('Should pass the test case when cover content', async () => {
            expect(getDataStream().length).toBe(13);
            const commandParams = {
                unitId: 'test-doc',
                body: {
                    dataStream: '=AVERAGE(A4:B8)',
                }, // Do not contain `\r\n` at the end.
                textRanges: [],
                segmentId: '',
            };

            await commandService.executeCommand(CoverContentCommand.id, commandParams);

            expect(getDataStream().length).toBe(17);

            await commandService.executeCommand(UndoCommand.id);

            expect(getDataStream().length).toBe(17);

            await commandService.executeCommand(RedoCommand.id);

            expect(getDataStream().length).toBe(17);
        });
    });
});
