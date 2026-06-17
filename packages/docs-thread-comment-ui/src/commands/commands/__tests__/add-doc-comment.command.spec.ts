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

import type { DocumentDataModel, ICommand, IDocumentData, Injector } from '@univerjs/core';
import type { IThreadComment } from '@univerjs/thread-comment';
import { ICommandService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocStateEmitService, RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import {
    AddCommentMutation,
    IThreadCommentDataSourceService,
    ThreadCommentDataSourceService,
    ThreadCommentModel,
} from '@univerjs/thread-comment';
import { SetActiveCommentOperation, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { DesktopSidebarService, ISidebarService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_DOC_SUBUNIT_ID } from '../../../common/const';
import { AddDocCommentComment } from '../add-doc-comment.command';

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
    let get: Injector['get'];
    let commandService: ICommandService;

    function getDocBody() {
        const univerInstanceService = get(IUniverInstanceService);
        return univerInstanceService.getUnit<DocumentDataModel>(DOC_ID, UniverInstanceType.UNIVER_DOC)?.getBody();
    }

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        get = injector.get.bind(injector);

        injector.add([DocSelectionManagerService]);
        injector.add([DocStateEmitService]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }]);
        injector.add([ThreadCommentModel]);
        injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
        injector.add([ThreadCommentPanelService]);

        univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocData());
        get(IUniverInstanceService).focusUnit(DOC_ID);

        commandService = get(ICommandService);
        commandService.registerCommand(AddDocCommentComment);
        commandService.registerCommand(AddCommentMutation);
        commandService.registerCommand(SetActiveCommentOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('adds a thread comment to the selected document text and makes it active', async () => {
        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: DOC_ID,
            subUnitId: DOC_ID,
        });
        selectionManager.__TEST_ONLY_add([
            {
                startOffset: 0,
                endOffset: 5,
                collapsed: false,
                isActive: true,
                segmentId: '',
                style: null as never,
            },
        ]);

        const comment = createComment();
        const result = await commandService.executeCommand(AddDocCommentComment.id, {
            unitId: DOC_ID,
            comment,
            range: {
                startOffset: 0,
                endOffset: 5,
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

    it('does not attach a comment when the document has no selected text', async () => {
        const comment = createComment('comment-without-selection');
        const result = await commandService.executeCommand(AddDocCommentComment.id, {
            unitId: DOC_ID,
            comment,
            range: {
                startOffset: 0,
                endOffset: 5,
            },
        });

        expect(result).toBe(false);
        expect(get(ThreadCommentModel).getThread(DOC_ID, DEFAULT_DOC_SUBUNIT_ID, comment.id)).toBeUndefined();
        expect(getDocBody()?.customDecorations).toEqual([]);
        expect(get(ThreadCommentPanelService).activeCommentId).toBeUndefined();
    });

    it('rejects an incomplete add-comment request without changing the document', async () => {
        const result = await commandService.executeCommand(AddDocCommentComment.id);

        expect(result).toBe(false);
        expect(get(ThreadCommentModel).getAll()).toEqual([]);
        expect(getDocBody()?.customDecorations).toEqual([]);
        expect(get(ThreadCommentPanelService).activeCommentId).toBeUndefined();
    });
});
