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

import { COPY_TYPE } from '@univerjs/sheets-ui';
import { AddCommentMutation, DeleteCommentMutation } from '@univerjs/thread-comment';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createThreadCommentUiTestBed } from '../../__tests__/create-thread-comment-ui-test-bed';
import { SheetsThreadCommentCopyPasteController } from '../sheets-thread-comment-copy-paste.controller';

function createRootComment() {
    return {
        id: 'comment-1',
        threadId: 'thread-1',
        ref: 'A1',
        dT: '2025-01-01T00:00:00.000Z',
        personId: 'user-1',
        text: { dataStream: 'hello\r\n' },
        attachments: [],
        unitId: 'test',
        subUnitId: 'sheet1',
    };
}

describe('SheetsThreadCommentCopyPasteController', () => {
    let testBed: ReturnType<typeof createThreadCommentUiTestBed>;

    beforeEach(() => {
        testBed = createThreadCommentUiTestBed();
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('creates delete/add mutations when cutting comments to another sheet', async () => {
        await testBed.commandService.executeCommand(AddCommentMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            comment: createRootComment(),
        });

        const controller = testBed.injector.createInstance(SheetsThreadCommentCopyPasteController);
        const hook = testBed.getClipboardHook();

        expect(hook).toBeDefined();

        hook!.onBeforeCopy('test', 'sheet1', {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        });

        const result = hook!.onPasteCells(
            null,
            {
                unitId: 'test',
                subUnitId: 'sheet2',
                range: {
                    rows: [2],
                    cols: [3],
                },
            },
            null,
            {
                copyType: COPY_TYPE.CUT,
            }
        );

        expect(result.redos).toEqual([
            {
                id: DeleteCommentMutation.id,
                params: {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    commentId: 'comment-1',
                },
            },
            {
                id: AddCommentMutation.id,
                params: expect.objectContaining({
                    unitId: 'test',
                    subUnitId: 'sheet2',
                    sync: true,
                    comment: expect.objectContaining({
                        id: 'comment-1',
                        ref: expect.stringContaining('D3'),
                        unitId: 'test',
                        subUnitId: 'sheet2',
                    }),
                }),
            },
        ]);
        expect(result.undos).toEqual([
            {
                id: DeleteCommentMutation.id,
                params: {
                    unitId: 'test',
                    subUnitId: 'sheet2',
                    commentId: 'comment-1',
                },
            },
            {
                id: AddCommentMutation.id,
                params: expect.objectContaining({
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    sync: true,
                    comment: expect.objectContaining({
                        id: 'comment-1',
                        ref: 'A1',
                    }),
                }),
            },
        ]);

        controller.dispose();
    });
});
