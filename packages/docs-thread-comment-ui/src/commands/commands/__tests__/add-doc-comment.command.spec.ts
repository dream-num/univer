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

import type { IDocumentData } from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { AddCommentMutation, IThreadCommentDataSourceService, ThreadCommentDataSourceService } from '@univerjs/thread-comment';
import { SetActiveCommentOperation } from '@univerjs/thread-comment-ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AddDocCommentComment } from '../add-doc-comment.command';

function createDocData(id: string): IDocumentData {
    return {
        id,
        body: {
            dataStream: 'Hello world\r\n',
            customDecorations: [],
        },
        documentStyle: {
            pageSize: { width: 100, height: 100 },
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
        },
    };
}

describe('AddDocCommentComment', () => {
    let univer: Univer;
    let injector: ReturnType<Univer['__getInjector']>;

    beforeEach(() => {
        univer = new Univer();
        injector = univer.__getInjector();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should add comment and attach decoration via sequenceExecute', async () => {
        const dataSource = new ThreadCommentDataSourceService();
        vi.spyOn(dataSource, 'addComment').mockImplementation(async (c) => ({ ...c, id: 'comment-1', threadId: 'thread-1' }));

        injector.add([IThreadCommentDataSourceService, { useValue: dataSource }]);
        injector.add([DocSelectionManagerService]);

        const doc = univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocData('doc-1'));
        injector.get(IUniverInstanceService).focusUnit(doc.getUnitId());

        const selectionManager = injector.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: doc.getUnitId(), subUnitId: doc.getUnitId() });
        selectionManager.__TEST_ONLY_add([{ startOffset: 0, endOffset: 5, collapsed: false, isActive: true }] as never);

        const executed: Array<{ id: string; params: unknown }> = [];
        const commandService = injector.get(ICommandService);
        commandService.registerCommand({
            id: AddCommentMutation.id,
            type: CommandType.MUTATION,
            handler: (_accessor, params) => {
                executed.push({ id: AddCommentMutation.id, params });
                return true;
            },
        });
        commandService.registerCommand({
            id: RichTextEditingMutation.id,
            type: CommandType.MUTATION,
            handler: (_accessor, params) => {
                executed.push({ id: RichTextEditingMutation.id, params });
                return true;
            },
        });
        commandService.registerCommand({
            id: SetActiveCommentOperation.id,
            type: CommandType.OPERATION,
            handler: (_accessor, params) => {
                executed.push({ id: SetActiveCommentOperation.id, params });
                return true;
            },
        });

        const ok = await AddDocCommentComment.handler(injector as any, {
            unitId: 'doc-1',
            range: { startOffset: 1, endOffset: 2, collapsed: false },
            comment: { id: '', threadId: '', unitId: 'doc-1', subUnitId: 'default_doc', ref: '' } as any,
        });

        expect(ok).toBe(true);
        expect(dataSource.addComment).toHaveBeenCalled();
        expect(executed.map((command) => command.id)).toEqual([
            AddCommentMutation.id,
            RichTextEditingMutation.id,
            SetActiveCommentOperation.id,
        ]);
        expect(executed[0].params).toEqual(expect.objectContaining({
            unitId: 'doc-1',
            comment: expect.objectContaining({ id: 'comment-1', threadId: 'thread-1' }),
        }));
        expect(executed[1].params).toEqual(expect.objectContaining({ unitId: 'doc-1' }));
    });

    it('should return false when missing params', async () => {
        const ok = await AddDocCommentComment.handler({ get: vi.fn() } as any, undefined as any);
        expect(ok).toBe(false);
    });
});
