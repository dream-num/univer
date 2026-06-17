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

import type { DocumentDataModel, ICommand, IDocumentData } from '@univerjs/core';
import { CustomRangeType, ICommandService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocStateEmitService, RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AddDocMentionCommand, DeleteDocMentionCommand } from '../doc-mention.command';

const unitId = 'mention-command-doc';

function createDocData(): IDocumentData {
    return {
        id: unitId,
        body: {
            dataStream: 'Hello @al and @Alice\r\n',
            customRanges: [{
                startIndex: 14,
                endIndex: 19,
                rangeId: 'existing-mention',
                rangeType: CustomRangeType.MENTION,
                wholeEntity: true,
                properties: {
                    id: 'existing-mention',
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

describe('doc mention commands', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let doc: DocumentDataModel;
    let selectionManager: DocSelectionManagerService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([DocSelectionManagerService]);
        injector.add([DocStateEmitService]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);

        doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createDocData());
        injector.get(IUniverInstanceService).focusUnit(unitId);

        commandService = injector.get(ICommandService);
        commandService.registerCommand(AddDocMentionCommand);
        commandService.registerCommand(DeleteDocMentionCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        selectionManager = injector.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId,
            subUnitId: unitId,
        });
    });

    afterEach(() => {
        univer.dispose();
    });

    it('replaces typed mention text with a mention entity', async () => {
        selectionManager.__TEST_ONLY_add([{
            startOffset: 6,
            endOffset: 9,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        const result = await commandService.executeCommand(AddDocMentionCommand.id, {
            unitId,
            startIndex: 6,
            mention: {
                id: 'new-mention',
                label: 'Alex',
                type: 'user',
                metadata: {
                    email: 'alex@example.invalid',
                },
            },
        });

        let mentionRange;
        for (const range of doc.getBody()?.customRanges ?? []) {
            if (range.rangeId === 'new-mention') {
                mentionRange = range;
                break;
            }
        }

        expect(result).toBeTruthy();
        expect(doc.getBody()?.dataStream).toBe('Hello @Alex and @Alice\r\n');
        expect(mentionRange).toMatchObject({
            startIndex: 6,
            endIndex: 10,
            rangeType: CustomRangeType.MENTION,
            wholeEntity: true,
            properties: {
                id: 'new-mention',
                label: 'Alex',
                type: 'user',
                email: 'alex@example.invalid',
            },
        });
    });

    it('removes an existing mention entity while keeping surrounding text', async () => {
        const result = await commandService.executeCommand(DeleteDocMentionCommand.id, {
            unitId,
            mentionId: 'existing-mention',
        });

        let existingRange;
        for (const range of doc.getBody()?.customRanges ?? []) {
            if (range.rangeId === 'existing-mention') {
                existingRange = range;
                break;
            }
        }

        expect(result).toBeTruthy();
        expect(existingRange).toBeUndefined();
        expect(doc.getBody()?.dataStream).toBe('Hello @al and @Alice\r\n');
    });

    it('does not add a mention without an active text range', async () => {
        const result = await commandService.executeCommand(AddDocMentionCommand.id, {
            unitId,
            startIndex: 6,
            mention: {
                id: 'missing-selection',
                label: 'Missing',
                type: 'user',
            },
        });

        expect(result).toBe(false);
        expect(doc.getBody()?.dataStream).toBe('Hello @al and @Alice\r\n');
    });
});
