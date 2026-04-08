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

import type { IDocumentBody, Injector, IWorkbookData } from '@univerjs/core';
import type { IThreadComment } from '../../types/interfaces/i-thread-comment';
import {
    IResourceManagerService,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThreadCommentModel } from '../../models/thread-comment.model';
import { UniverThreadCommentPlugin } from '../../plugin';
import { SHEET_UNIVER_THREAD_COMMENT_PLUGIN } from '../tc-resource.controller';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'unit-1',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: '',
        sheetOrder: ['sheet-1'],
        styles: {},
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                name: 'Sheet1',
                cellData: {},
            },
        },
    };
}

function createBody(text: string): IDocumentBody {
    return {
        dataStream: `${text}\r\n`,
    };
}

function createComment(overrides: Partial<IThreadComment> = {}): IThreadComment {
    const id = overrides.id ?? 'comment-1';

    return {
        id,
        threadId: overrides.threadId ?? overrides.parentId ?? id,
        ref: overrides.ref ?? 'A1',
        dT: overrides.dT ?? '2024-01-01T00:00:00.000Z',
        personId: overrides.personId ?? 'user-1',
        text: overrides.text ?? createBody(id),
        unitId: overrides.unitId ?? 'unit-1',
        subUnitId: overrides.subUnitId ?? 'sheet-1',
        attachments: overrides.attachments,
        children: overrides.children,
        mentions: overrides.mentions,
        parentId: overrides.parentId,
        resolved: overrides.resolved,
        updateT: overrides.updateT,
        updated: overrides.updated,
    };
}

describe('ThreadCommentResourceController', () => {
    let univer: Univer;
    let get: Injector['get'];
    let resourceManagerService: IResourceManagerService;
    let threadCommentModel: ThreadCommentModel;

    beforeEach(() => {
        univer = new Univer();
        univer.registerPlugin(UniverThreadCommentPlugin);
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, createWorkbookData());

        const injector = univer.__getInjector();
        get = injector.get.bind(injector);
        get(IUniverInstanceService).focusUnit('unit-1');
        get(LifecycleService).stage = LifecycleStages.Rendered;

        resourceManagerService = get(IResourceManagerService);
        threadCommentModel = get(ThreadCommentModel);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('serializes thread comments by sub unit with children preserved', () => {
        const root = createComment({ id: 'root-1', ref: 'A1' });
        const reply = createComment({ id: 'reply-1', parentId: root.id, threadId: root.id, ref: '' });
        const sideThread = createComment({ id: 'root-2', subUnitId: 'sheet-2', ref: 'B2' });

        threadCommentModel.addComment('unit-1', 'sheet-1', root);
        threadCommentModel.addComment('unit-1', 'sheet-1', reply);
        threadCommentModel.addComment('unit-1', 'sheet-2', sideThread);

        const resource = resourceManagerService.getResourcesByType('unit-1', UniverInstanceType.UNIVER_SHEET)
            .find((item) => item.name === SHEET_UNIVER_THREAD_COMMENT_PLUGIN);

        expect(resource).toBeDefined();
        expect(JSON.parse(resource!.data)).toEqual({
            'sheet-1': [
                {
                    ...root,
                    children: [reply],
                },
            ],
            'sheet-2': [
                {
                    ...sideThread,
                    children: [],
                },
            ],
        });
    });

    it('loads serialized comments and clears them on unload', async () => {
        const root = createComment({ id: 'root-3', ref: 'C3' });
        const reply = createComment({ id: 'reply-3', parentId: root.id, threadId: root.id, ref: '' });

        resourceManagerService.loadResources('unit-1', [{
            name: SHEET_UNIVER_THREAD_COMMENT_PLUGIN,
            data: JSON.stringify({
                'sheet-1': [
                    {
                        ...root,
                        children: [reply],
                    },
                ],
            }),
        }]);

        await Promise.resolve();

        expect(threadCommentModel.getThread('unit-1', 'sheet-1', root.id)).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            threadId: root.id,
            root,
            children: [reply],
            relativeUsers: new Set(['user-1']),
        });

        resourceManagerService.unloadResources('unit-1', UniverInstanceType.UNIVER_SHEET);

        expect(threadCommentModel.getUnit('unit-1')).toEqual([]);
    });

    it('ignores invalid snapshot payloads', async () => {
        resourceManagerService.loadResources('unit-1', [{
            name: SHEET_UNIVER_THREAD_COMMENT_PLUGIN,
            data: '{invalid-json',
        }]);

        await Promise.resolve();

        expect(threadCommentModel.getUnit('unit-1')).toEqual([]);
    });
});
