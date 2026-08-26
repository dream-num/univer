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

import type { DocumentDataModel, IDocumentData, Injector } from '@univerjs/core';
import type { IThreadComment } from '@univerjs/thread-comment';
import { ICommandService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocStateEmitService, RichTextEditingMutation } from '@univerjs/docs';
import {
    AddDocCommentDecorationMutation,
    CreateDocTextRangeCommentCommand,
    DEFAULT_DOC_SUBUNIT_ID,
} from '@univerjs/docs-thread-comment';
import { FDocument } from '@univerjs/docs/facade';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import {
    AddCommentMutation,
    IThreadCommentDataSourceService,
    ThreadCommentDataSourceService,
    ThreadCommentFacadeService,
    ThreadCommentModel,
} from '@univerjs/thread-comment';
import { SetActiveCommentOperation, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { DesktopSidebarService, ISidebarService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AddDocCommentComment } from '../add-doc-comment.command';
import '@univerjs/docs-thread-comment/facade';

const DOC_ID = 'doc-add-comment-test';

function createDocData(): IDocumentData {
    return {
        id: DOC_ID,
        body: {
            dataStream: 'Hello world\r\n',
            textRuns: [],
            paragraphs: [],
            sectionBreaks: [],
            customBlocks: [],
            customDecorations: [],
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

function createComment(id = 'comment-1'): IThreadComment {
    return {
        id,
        threadId: '',
        ref: '',
        unitId: DOC_ID,
        subUnitId: DEFAULT_DOC_SUBUNIT_ID,
        dT: '2026-06-17T00:00:00.000Z',
        personId: 'user-1',
        text: {
            dataStream: 'Please revise this wording.\r\n',
        },
    };
}

describe('AddDocCommentComment', () => {
    let univer: Univer;
    let injector: Injector;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getDocBody() {
        const univerInstanceService = get(IUniverInstanceService);
        return univerInstanceService.getUnit<DocumentDataModel>(DOC_ID, UniverInstanceType.UNIVER_DOC)?.getBody();
    }

    beforeEach(() => {
        univer = new Univer();
        injector = univer.__getInjector();
        get = injector.get.bind(injector);

        injector.add([DocSelectionManagerService]);
        injector.add([DocStateEmitService]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }]);
        injector.add([ThreadCommentModel]);
        injector.add([ThreadCommentFacadeService]);
        injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
        injector.add([ThreadCommentPanelService]);

        univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocData());
        get(IUniverInstanceService).focusUnit(DOC_ID);

        commandService = get(ICommandService);
        commandService.registerCommand(AddDocCommentComment);
        commandService.registerCommand(CreateDocTextRangeCommentCommand);
        commandService.registerCommand(AddDocCommentDecorationMutation);
        commandService.registerCommand(AddCommentMutation);
        commandService.registerCommand(SetActiveCommentOperation);
        commandService.registerCommand(RichTextEditingMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('adds a thread comment to an explicit document range and makes it active', async () => {
        const comment = createComment();
        const result = await commandService.executeCommand(AddDocCommentComment.id, {
            unitId: DOC_ID,
            comment,
            range: {
                startOffset: 0,
                endOffset: 5,
                collapsed: false,
            },
        });

        expect(result).toBe(true);

        const thread = get(ThreadCommentModel).getThread(DOC_ID, DEFAULT_DOC_SUBUNIT_ID, comment.id);
        expect(thread?.root).toMatchObject({
            id: comment.id,
            threadId: comment.id,
            unitId: DOC_ID,
            subUnitId: DEFAULT_DOC_SUBUNIT_ID,
            personId: 'user-1',
            text: {
                dataStream: 'Please revise this wording.\r\n',
            },
        });

        expect(getDocBody()?.customDecorations).toEqual([
            expect.objectContaining({
                id: comment.id,
                startIndex: 0,
                endIndex: 4,
            }),
        ]);

        expect(get(ThreadCommentPanelService).activeCommentId).toEqual({
            unitId: DOC_ID,
            subUnitId: DEFAULT_DOC_SUBUNIT_ID,
            commentId: comment.id,
        });
    });

    it('uses the server-assigned id for the document anchor', async () => {
        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: DOC_ID,
            subUnitId: DOC_ID,
        });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 5,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);
        get(IThreadCommentDataSourceService).dataSource = {
            addComment: vi.fn(async (comment: IThreadComment) => ({
                ...comment,
                id: 'server-comment-id',
                threadId: 'server-comment-id',
            })),
            updateComment: vi.fn(),
            resolveComment: vi.fn(),
            deleteComment: vi.fn(),
            listComments: vi.fn(),
            saveCommentToSnapshot: (value) => value,
        };

        const result = await commandService.executeCommand(AddDocCommentComment.id, {
            unitId: DOC_ID,
            comment: createComment('client-comment-id'),
            range: { startOffset: 0, endOffset: 5, collapsed: false },
        });

        expect(result).toBe(true);
        expect(getDocBody()?.customDecorations).toEqual([
            expect.objectContaining({ id: 'server-comment-id' }),
        ]);
        expect(get(ThreadCommentModel).getThread(
            DOC_ID,
            DEFAULT_DOC_SUBUNIT_ID,
            'server-comment-id'
        )?.root.id).toBe('server-comment-id');
        expect(get(ThreadCommentPanelService).activeCommentId?.commentId).toBe('server-comment-id');
    });

    it('rejects a collapsed explicit range before writing to the data source', async () => {
        const comment = createComment('comment-without-range');
        const addComment = vi.fn(async (value: IThreadComment) => value);
        get(IThreadCommentDataSourceService).dataSource = {
            addComment,
            updateComment: vi.fn(),
            resolveComment: vi.fn(),
            deleteComment: vi.fn(),
            listComments: vi.fn(),
            saveCommentToSnapshot: (value) => value,
        };
        const result = await commandService.executeCommand(AddDocCommentComment.id, {
            unitId: DOC_ID,
            comment,
            range: {
                startOffset: 5,
                endOffset: 5,
                collapsed: true,
            },
        });
        const outOfBounds = await commandService.executeCommand(AddDocCommentComment.id, {
            unitId: DOC_ID,
            comment,
            range: {
                startOffset: 0,
                endOffset: 100,
                collapsed: false,
            },
        });

        expect(result).toBe(false);
        expect(outOfBounds).toBe(false);
        expect(get(ThreadCommentModel).getThread(DOC_ID, DEFAULT_DOC_SUBUNIT_ID, comment.id)).toBeUndefined();
        expect(getDocBody()?.customDecorations).toEqual([]);
        expect(get(ThreadCommentPanelService).activeCommentId).toBeUndefined();
        expect(addComment).not.toHaveBeenCalled();
    });

    it('creates an agent-supplied text-range comment with queryable offsets', async () => {
        const result = await commandService.executeCommand(CreateDocTextRangeCommentCommand.id, {
            unitId: DOC_ID,
            range: { startOffset: 0, endOffset: 5, collapsed: false },
            content: 'Check the greeting.',
            id: 'agent-comment-1',
            personId: 'agent-user-1',
        });

        expect(result).toBe(true);
        expect(get(ThreadCommentModel).getThread(
            DOC_ID,
            DEFAULT_DOC_SUBUNIT_ID,
            'agent-comment-1'
        )?.root).toMatchObject({
            id: 'agent-comment-1',
            threadId: 'agent-comment-1',
            personId: 'agent-user-1',
            ref: 'Hello',
            startOffset: 0,
            endOffset: 5,
            collapsed: false,
            text: { dataStream: 'Check the greeting.\r\n' },
        });
        expect(getDocBody()?.customDecorations).toEqual([
            expect.objectContaining({ id: 'agent-comment-1', startIndex: 0, endIndex: 4 }),
        ]);
    });

    it('creates and queries a comment through FDocumentTextRange', async () => {
        const documentModel = get(IUniverInstanceService).getUnit<DocumentDataModel>(DOC_ID, UniverInstanceType.UNIVER_DOC);
        if (!documentModel) {
            throw new Error('Test document was not created.');
        }
        const document = injector.createInstance(FDocument, documentModel);
        const range = document.getTextRange(6, 11);

        await expect(range.createCommentAsync('Review the noun.', {
            id: 'facade-comment-1',
            personId: 'agent-user-2',
        })).resolves.toBe(true);

        expect(range.getComments()).toHaveLength(1);
        expect(range.getComments()[0]).toMatchObject({
            threadId: 'facade-comment-1',
            root: {
                ref: 'world',
                startOffset: 6,
                endOffset: 11,
                personId: 'agent-user-2',
            },
        });
        expect(document.getTextRange(0, 5).getComments()).toEqual([]);
    });

    it('rejects an incomplete add-comment request without changing the document', async () => {
        const result = await commandService.executeCommand(AddDocCommentComment.id);

        expect(result).toBe(false);
        expect(get(ThreadCommentModel).getAll()).toEqual([]);
        expect(getDocBody()?.customDecorations).toEqual([]);
        expect(get(ThreadCommentPanelService).activeCommentId).toBeUndefined();
    });
});
