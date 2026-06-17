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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import { CustomDecorationType, ICommandService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocStateEmitService, RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DeleteDocCommentComment } from '../delete-doc-comment.command';

function createDocData(id: string): IDocumentData {
    return {
        id,
        body: {
            dataStream: 'Hello world\r\n',
            customDecorations: [{ id: 'c1', startIndex: 0, endIndex: 5, type: CustomDecorationType.COMMENT }],
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
    let commandService: ICommandService;

    beforeEach(() => {
        univer = new Univer();
        injector = univer.__getInjector();
        injector.add([DocSelectionManagerService]);
        injector.add([DocStateEmitService]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        commandService = injector.get(ICommandService);
        commandService.registerCommand(DeleteDocCommentComment);
        commandService.registerCommand(RichTextEditingMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('removes the comment decoration from the document', async () => {
        const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createDocData('doc-1'));
        injector.get(IUniverInstanceService).focusUnit(doc.getUnitId());

        const ok = await commandService.executeCommand(DeleteDocCommentComment.id, { unitId: 'doc-1', commentId: 'c1' });

        expect(ok).toBe(true);
        expect(doc.getBody()?.customDecorations).toEqual([]);
    });

    it('rejects an incomplete delete request without changing the document', async () => {
        const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createDocData('doc-1'));
        injector.get(IUniverInstanceService).focusUnit(doc.getUnitId());

        const ok = await commandService.executeCommand(DeleteDocCommentComment.id);

        expect(ok).toBe(false);
        expect(doc.getBody()?.customDecorations).toEqual([{ id: 'c1', startIndex: 0, endIndex: 5, type: CustomDecorationType.COMMENT }]);
    });
});
