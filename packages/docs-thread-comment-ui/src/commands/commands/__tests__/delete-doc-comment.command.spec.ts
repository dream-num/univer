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
import { RichTextEditingMutation } from '@univerjs/docs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteDocCommentComment } from '../delete-doc-comment.command';

function createDocData(id: string): IDocumentData {
    return {
        id,
        body: {
            dataStream: 'Hello world\r\n',
            customDecorations: [{ id: 'c1', startIndex: 0, endIndex: 5, type: 1 as never }],
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

describe('DeleteDocCommentComment', () => {
    let univer: Univer;
    let injector: ReturnType<Univer['__getInjector']>;

    beforeEach(() => {
        univer = new Univer();
        injector = univer.__getInjector();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should delete decoration via sequenceExecute', async () => {
        const doc = univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocData('doc-1'));
        injector.get(IUniverInstanceService).focusUnit(doc.getUnitId());

        const executed: Array<{ id: string; params: unknown }> = [];
        const commandService = injector.get(ICommandService);
        commandService.registerCommand({
            id: RichTextEditingMutation.id,
            type: CommandType.MUTATION,
            handler: (_accessor, params) => {
                executed.push({ id: RichTextEditingMutation.id, params });
                return true;
            },
        });

        const ok = await DeleteDocCommentComment.handler(injector as any, { unitId: 'doc-1', commentId: 'c1' });
        expect(ok).toBe(true);
        expect(executed).toHaveLength(1);
        expect(executed[0]).toEqual(expect.objectContaining({ id: RichTextEditingMutation.id }));
        expect(executed[0].params).toEqual(expect.objectContaining({ unitId: 'doc-1' }));
    });

    it('should return false when missing params', async () => {
        const ok = await DeleteDocCommentComment.handler({ get: vi.fn() } as any, undefined as any);
        expect(ok).toBe(false);
    });
});
