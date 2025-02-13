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

import type { DocumentDataModel, ICommand, IDocumentData, Injector, Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, RedoCommand, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CoverContentCommand, ReplaceContentCommand } from '../replace-content.command';
import { createCommandTestBed } from './create-command-test-bed';

function getDocumentData() {
    const TEST_DOCUMENT_DATA_EN: IDocumentData = {
        id: 'test-doc',
        body: {
            dataStream: '=SUM(A2:B4)\r\n',
            textRuns: [],
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

    return TEST_DOCUMENT_DATA_EN;
}

describe('replace or cover content of document', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getDataStream() {
        const univerInstanceService = get(IUniverInstanceService);
        const docsModel = univerInstanceService.getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC);
        const dataStream = docsModel?.getBody()?.dataStream;

        return typeof dataStream === 'string' ? dataStream : '';
    }

    beforeEach(() => {
        const testBed = createCommandTestBed(getDocumentData());
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(ReplaceContentCommand);
        commandService.registerCommand(CoverContentCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const selectionManager = get(DocSelectionManagerService);

        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: '',
        });

        selectionManager.__TEST_ONLY_add([
            {
                startOffset: 5,
                endOffset: 5,
                collapsed: true,
            },
        ]);
    });

    afterEach(() => {
        univer.dispose();
    });

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
            expect(getDataStream()!.length).toBe(13);
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
