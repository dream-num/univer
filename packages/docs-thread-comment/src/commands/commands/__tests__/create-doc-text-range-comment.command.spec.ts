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
import {

    ICommandService,

    IUniverInstanceService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FDocument } from '@univerjs/docs/facade';
import {
    AddCommentMutation,
    IThreadCommentDataSourceService,
    ThreadCommentDataSourceService,
    ThreadCommentFacadeService,
    ThreadCommentModel,
} from '@univerjs/thread-comment';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_DOC_SUBUNIT_ID } from '../../../common/const';
import {
    AddDocCommentDecorationMutation,
    CreateDocTextRangeCommentCommand,
} from '../create-doc-text-range-comment.command';
import '@univerjs/docs-thread-comment/facade';

const DOC_ID = 'headless-doc-comment-test';

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
            pageSize: { width: 594.3, height: 840.51 },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

describe('CreateDocTextRangeCommentCommand', () => {
    let univer: Univer;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }]);
        injector.add([ThreadCommentModel]);
        injector.add([ThreadCommentFacadeService]);
        univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocData());

        const commandService = injector.get(ICommandService);
        commandService.registerCommand(CreateDocTextRangeCommentCommand);
        commandService.registerCommand(AddCommentMutation);
        commandService.registerCommand(AddDocCommentDecorationMutation);
    });

    afterEach(() => univer.dispose());

    it('creates and queries a fixed text comment without UI services', async () => {
        const injector = univer.__getInjector();
        const commandService = injector.get(ICommandService);
        await expect(commandService.executeCommand(CreateDocTextRangeCommentCommand.id, {
            unitId: DOC_ID,
            range: { startOffset: 0, endOffset: 5 },
            content: 'Check the greeting.',
            id: 'agent-comment-1',
            personId: 'agent-user-1',
        })).resolves.toBe(true);

        const documentModel = injector.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>(DOC_ID, UniverInstanceType.UNIVER_DOC);
        if (!documentModel) {
            throw new Error('Test document was not created.');
        }
        const range = injector.createInstance(FDocument, documentModel).getTextRange(0, 5);
        expect(range.getComments()).toHaveLength(1);
        expect(injector.get(ThreadCommentModel).getThread(
            DOC_ID,
            DEFAULT_DOC_SUBUNIT_ID,
            'agent-comment-1'
        )?.root).toMatchObject({
            ref: 'Hello',
            startOffset: 0,
            endOffset: 5,
            personId: 'agent-user-1',
        });
    });
});
