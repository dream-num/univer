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

import { UniverInstanceType } from '@univerjs/core';
import { CopySheetCommand, RemoveSheetCommand } from '@univerjs/sheets';
import {
    AddCommentMutation,
    DeleteCommentMutation,
} from '@univerjs/thread-comment';
import { describe, expect, it, vi } from 'vitest';
import { SHEET_UNIVER_THREAD_COMMENT_PLUGIN } from '../../types/const';
import { SheetsThreadCommentResourceController } from '../sheets-thread-comment-resource.controller';

function createRootComment() {
    return {
        id: 'comment-1',
        threadId: 'thread-1',
        ref: 'A1',
        dT: '2025-01-01T00:00:00.000Z',
        personId: 'user-1',
        text: { dataStream: 'hello\r\n', textRuns: [] },
        attachments: [],
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        children: [{ id: 'reply-1', parentId: 'comment-1' }],
    } as any;
}

describe('SheetsThreadCommentResourceController', () => {
    it('should create undo/redo mutations when removing a sheet', () => {
        let interceptorConfig: any;
        const rootComment = createRootComment();

        const controller = new SheetsThreadCommentResourceController(
            {
                registerPluginResource: () => ({ dispose: vi.fn() }),
            } as any,
            {
                getCurrentUnitOfType: () => ({
                    getUnitId: () => 'unit-1',
                    getActiveSheet: () => ({ getSheetId: () => 'sheet-1' }),
                }),
            } as any,
            {
                interceptCommand: (config: any) => {
                    interceptorConfig = config;
                    return { dispose: vi.fn() };
                },
            } as any,
            {
                ensureMap: () => new Map([
                    [rootComment.id, rootComment],
                    ['reply-1', { id: 'reply-1', parentId: rootComment.id }],
                ]),
            } as any,
            {
                syncUpdateMutationToColla: true,
            } as any
        );

        const result = interceptorConfig.getMutations({
            id: RemoveSheetCommand.id,
            params: {},
        });

        expect(result.redos).toEqual([
            {
                id: DeleteCommentMutation.id,
                params: { unitId: 'unit-1', subUnitId: 'sheet-1', commentId: 'comment-1' },
            },
        ]);
        expect(result.undos).toEqual([
            {
                id: AddCommentMutation.id,
                params: {
                    unitId: 'unit-1',
                    subUnitId: 'sheet-1',
                    comment: rootComment,
                    sync: false,
                },
            },
        ]);

        controller.dispose();
    });

    it('should clone root comments onto the copied sheet and omit children when sync is disabled', () => {
        let interceptorConfig: any;
        const rootComment = createRootComment();

        const controller = new SheetsThreadCommentResourceController(
            {
                registerPluginResource: () => ({ dispose: vi.fn() }),
            } as any,
            {} as any,
            {
                interceptCommand: (config: any) => {
                    interceptorConfig = config;
                    return { dispose: vi.fn() };
                },
            } as any,
            {
                ensureMap: () => new Map([
                    [rootComment.id, rootComment],
                    ['reply-1', { id: 'reply-1', parentId: rootComment.id }],
                ]),
            } as any,
            {
                syncUpdateMutationToColla: false,
            } as any
        );

        const result = interceptorConfig.getMutations({
            id: CopySheetCommand.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                targetSubUnitId: 'sheet-2',
            },
        });

        expect(result.redos).toHaveLength(1);
        expect(result.redos[0]).toEqual(expect.objectContaining({
            id: AddCommentMutation.id,
            params: expect.objectContaining({
                unitId: 'unit-1',
                subUnitId: 'sheet-2',
                sync: true,
            }),
        }));
        expect(result.redos[0].params.comment).toEqual(expect.objectContaining({
            subUnitId: 'sheet-2',
            children: undefined,
        }));
        expect(result.redos[0].params.comment.id).not.toBe(rootComment.id);
        expect(result.redos[0].params.comment.threadId).not.toBe(rootComment.threadId);
        expect(result.undos).toEqual([
            {
                id: DeleteCommentMutation.id,
                params: {
                    unitId: 'unit-1',
                    subUnitId: 'sheet-2',
                    commentId: result.redos[0].params.comment.id,
                },
            },
        ]);

        controller.dispose();
    });

    it('registers sheet thread comment snapshot resources for sheet units', () => {
        let hook: any;
        const controller = new SheetsThreadCommentResourceController(
            {
                registerPluginResource: (nextHook: any) => {
                    hook = nextHook;
                    return { dispose: vi.fn() };
                },
            } as any,
            {} as any,
            { interceptCommand: () => ({ dispose: vi.fn() }) } as any,
            { getUnit: () => [] } as any,
            { saveToSnapshot: (value: unknown) => value } as any
        );

        expect(hook.pluginName).toBe(SHEET_UNIVER_THREAD_COMMENT_PLUGIN);
        expect(hook.businesses).toEqual([UniverInstanceType.UNIVER_SHEET]);
        controller.dispose();
    });
});
