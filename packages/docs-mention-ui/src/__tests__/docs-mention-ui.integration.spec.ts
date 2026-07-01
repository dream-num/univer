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

import type { DocumentDataModel, ICommand, IDisposable, IDocumentData, Univer } from '@univerjs/core';
import type { IInsertTextCommandParams } from '@univerjs/docs';
import { awaitTime, CustomRangeType, Direction, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import {
    DocSelectionManagerService,
    InsertTextCommand,
    RichTextEditingMutation,
    SetTextSelectionsOperation,
} from '@univerjs/docs';
import { DeleteLeftCommand, DocCanvasPopManagerService, MoveCursorOperation } from '@univerjs/docs-ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AddDocMentionCommand, DeleteDocMentionCommand } from '../commands/commands/doc-mention.command';
import {
    CloseMentionEditPopupOperation,
    ShowMentionEditPopupOperation,
} from '../commands/operations/mention-popup.operation';
import { DocMentionTriggerController } from '../controllers/doc-mention-trigger.controller';
import { DocMentionPopupService } from '../services/doc-mention-popup.service';
import { DocMentionService } from '../services/doc-mention.service';
import { createDocUiTestBed } from './create-doc-ui-test-bed';

function createTriggerDocData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Hello world\r\n',
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
}

function createMentionDraftDocData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Hello @al\r\n',
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
}

function createMentionDocData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Hello @Alice\r\n',
            customRanges: [{
                startIndex: 6,
                endIndex: 11,
                rangeId: 'mention-1',
                rangeType: CustomRangeType.MENTION,
                wholeEntity: true,
                properties: {
                    id: 'mention-1',
                    label: 'Alice',
                    type: 'user',
                },
            }],
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
}

function createPopupManagerStub() {
    const disposables: IDisposable[] = [];

    return {
        disposables,
        attachPopupToRange: vi.fn(() => {
            const disposable = {
                dispose: vi.fn(),
            };

            disposables.push(disposable);
            return disposable;
        }),
    };
}

function setupMentionTestBed(docData: IDocumentData) {
    const testBed = createDocUiTestBed(docData);
    const { univer, get, injector } = testBed;
    const popupManagerStub = createPopupManagerStub();

    injector.add([DocCanvasPopManagerService, { useValue: popupManagerStub as unknown as DocCanvasPopManagerService }]);
    injector.add([DocMentionService]);
    injector.add([DocMentionPopupService]);
    injector.add([DocMentionTriggerController]);

    const commandService = get(ICommandService);
    commandService.registerCommand(InsertTextCommand);
    commandService.registerCommand(MoveCursorOperation);
    commandService.registerCommand(SetTextSelectionsOperation);
    commandService.registerCommand(ShowMentionEditPopupOperation);
    commandService.registerCommand(CloseMentionEditPopupOperation);
    commandService.registerCommand(AddDocMentionCommand);
    commandService.registerCommand(DeleteDocMentionCommand);
    commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
    commandService.registerCommand({
        id: DeleteLeftCommand.id,
        type: DeleteDocMentionCommand.type,
        handler: () => true,
    });

    const selectionManager = get(DocSelectionManagerService);
    selectionManager.__TEST_ONLY_setCurrentSelection({
        unitId: 'test-doc',
        subUnitId: 'test-doc',
    });

    const popupService = injector.get(DocMentionPopupService);
    const mentionService = injector.get(DocMentionService);
    injector.get(DocMentionTriggerController);

    return {
        univer,
        get,
        commandService,
        selectionManager,
        popupService,
        mentionService,
        popupManagerStub,
    };
}

describe('docs-mention-ui integration', () => {
    let univer: Univer | null = null;

    afterEach(() => {
        univer?.dispose();
        univer = null;
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('opens the mention edit popup after inserting @ through the command pipeline', async () => {
        vi.useFakeTimers();
        const testBed = setupMentionTestBed(createTriggerDocData());
        univer = testBed.univer;

        testBed.selectionManager.__TEST_ONLY_add([{
            startOffset: 11,
            endOffset: 11,
            collapsed: true,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        expect(await testBed.commandService.executeCommand<IInsertTextCommandParams>(InsertTextCommand.id, {
            unitId: 'test-doc',
            segmentId: '',
            range: { startOffset: 11, endOffset: 11, collapsed: true },
            body: {
                dataStream: '@',
            },
        })).toBe(true);

        await Promise.resolve();
        await vi.runAllTimersAsync();

        expect(testBed.mentionService.editing).toBeUndefined();
        expect(testBed.popupService.editPopup?.unitId).toBe('test-doc');
        expect(testBed.popupManagerStub.attachPopupToRange).toHaveBeenCalledWith({
            startOffset: expect.any(Number),
            endOffset: expect.any(Number),
            collapsed: true,
        }, expect.objectContaining({
            componentKey: 'univer.popup.doc-mention-edit',
        }), 'test-doc');
    });

    it('replaces the typed trigger text with a mention entity via AddDocMentionCommand', async () => {
        const testBed = setupMentionTestBed(createMentionDraftDocData());
        univer = testBed.univer;

        testBed.selectionManager.__TEST_ONLY_add([{
            startOffset: 6,
            endOffset: 9,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        expect(await testBed.commandService.executeCommand(AddDocMentionCommand.id, {
            unitId: 'test-doc',
            startIndex: 6,
            mention: {
                id: 'mention-1',
                label: 'Alice',
                type: 'user',
                metadata: {
                    source: 'directory',
                },
            },
        })).toBeTruthy();
        await awaitTime(0);

        const documentBody = testBed.get(IUniverInstanceService)
            .getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            ?.getBody();

        expect(documentBody?.dataStream).toBe('Hello @Alice\r\n');
        expect(documentBody?.customRanges).toEqual([expect.objectContaining({
            rangeId: 'mention-1',
            rangeType: CustomRangeType.MENTION,
            properties: expect.objectContaining({
                id: 'mention-1',
                label: 'Alice',
                type: 'user',
                source: 'directory',
            }),
        })]);
    });

    it('deletes a mention entity and closes the popup on cursor movement and delete-left events', async () => {
        const testBed = setupMentionTestBed(createMentionDocData());
        univer = testBed.univer;

        expect(await testBed.commandService.executeCommand(ShowMentionEditPopupOperation.id, {
            unitId: 'test-doc',
            startIndex: 6,
        })).toBe(true);
        expect(testBed.popupService.editPopup).toMatchObject({ anchor: 6 });

        expect(await testBed.commandService.executeCommand(MoveCursorOperation.id, { direction: Direction.RIGHT })).toBe(true);
        expect(testBed.popupService.editPopup).toBeNull();

        expect(await testBed.commandService.executeCommand(ShowMentionEditPopupOperation.id, {
            unitId: 'test-doc',
            startIndex: 6,
        })).toBe(true);
        testBed.selectionManager.__TEST_ONLY_add([{
            startOffset: 5,
            endOffset: 5,
            collapsed: true,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        expect(await testBed.commandService.executeCommand(DeleteLeftCommand.id)).toBe(true);
        expect(testBed.popupService.editPopup).toBeNull();

        expect(await testBed.commandService.executeCommand(DeleteDocMentionCommand.id, {
            unitId: 'test-doc',
            mentionId: 'mention-1',
        })).toBeTruthy();
        await awaitTime(0);

        const docBody = testBed.get(IUniverInstanceService)
            .getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            ?.getBody();
        expect(docBody?.dataStream).toBe('Hello @Alice\r\n');
        expect(docBody?.customRanges).toEqual([]);
    });
});
