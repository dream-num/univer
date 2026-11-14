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
import {
    CustomDecorationType,
    DocumentFlavor,
    IResourceLoaderService,
    IUniverInstanceService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    IThreadCommentDataSourceService,
    ThreadCommentDataSourceService,
    ThreadCommentModel,
} from '@univerjs/thread-comment';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_DOC_SUBUNIT_ID } from '../../common/const';
import {
    DOC_UNIVER_THREAD_COMMENT_PLUGIN,
    DocsThreadCommentResourceController,
} from '../docs-thread-comment-resource.controller';

describe('DocsThreadCommentResourceController', () => {
    let univer: Univer | undefined;

    afterEach(() => univer?.dispose());

    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])(
        'loads and saves editable Word comment data in document flavor %s',
        (documentFlavor) => {
            univer = new Univer();
            const injector = univer.__getInjector();
            injector.add([IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }]);
            injector.add([ThreadCommentModel]);
            injector.add([DocsThreadCommentResourceController]);
            const loader = injector.get(IResourceLoaderService);
            injector.get(DocsThreadCommentResourceController);
            const root = {
                id: 'word-comment-0',
                threadId: 'word-comment-0',
                dT: '2026-10-20T10:00:00Z',
                personId: '',
                authorName: 'Reader',
                text: { dataStream: 'Review\r\n', paragraphs: [{ startIndex: 6 }] },
                unitId: 'imported-word-unit',
                subUnitId: DEFAULT_DOC_SUBUNIT_ID,
                ref: 'A😀',
                startOffset: 0,
                endOffset: 3,
                segmentId: '',
                collapsed: false,
                resolved: true,
                children: [{
                    id: 'word-comment-3',
                    threadId: 'word-comment-0',
                    parentId: 'word-comment-0',
                    dT: '2026-10-20T11:00:00Z',
                    personId: '',
                    authorName: 'Reply author',
                    unitId: 'imported-word-unit',
                    subUnitId: DEFAULT_DOC_SUBUNIT_ID,
                    text: { dataStream: 'Reply\r\n', paragraphs: [{ startIndex: 5 }] },
                }],
            };
            const snapshot: IDocumentData = {
                id: 'edited-unit',
                documentStyle: { documentFlavor },
                body: {
                    dataStream: 'A😀Z\r\n',
                    paragraphs: [{ startIndex: 4, paragraphId: 'body-paragraph' }],
                    customDecorations: [{
                        id: root.id,
                        type: CustomDecorationType.COMMENT,
                        startIndex: 0,
                        endIndex: 2,
                    }],
                },
                resources: [{
                    name: DOC_UNIVER_THREAD_COMMENT_PLUGIN,
                    data: JSON.stringify({ [DEFAULT_DOC_SUBUNIT_ID]: [root] }),
                }],
            };
            univer.createUnit(UniverInstanceType.UNIVER_DOC, snapshot);
            const model = injector.get(ThreadCommentModel);
            const thread = model.getThread(snapshot.id, DEFAULT_DOC_SUBUNIT_ID, root.threadId);
            const { children, ...rootData } = root;
            expect(thread?.root).toMatchObject({ ...rootData, unitId: snapshot.id });
            expect(thread?.children).toMatchObject([{ ...children[0], unitId: snapshot.id }]);
            const saved = loader.saveUnit<IDocumentData>(snapshot.id);
            const data = saved?.resources?.find((resource) => resource.name === DOC_UNIVER_THREAD_COMMENT_PLUGIN)?.data;
            const savedComments = JSON.parse(data ?? '{}')[DEFAULT_DOC_SUBUNIT_ID];
            expect(savedComments[0]).toMatchObject({
                id: root.id,
                authorName: root.authorName,
                resolved: true,
                startOffset: 0,
                endOffset: 3,
                children: [{ id: root.children[0].id, threadId: root.id }],
            });
            expect(saved?.body?.customDecorations).toEqual(snapshot.body?.customDecorations);
            injector.get(IUniverInstanceService).disposeUnit(snapshot.id);
            expect(model.getThread(snapshot.id, DEFAULT_DOC_SUBUNIT_ID, root.id)).toBeUndefined();
        }
    );
});
