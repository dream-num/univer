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

import { AddCommentCommand, DeleteCommentCommand, UpdateCommentCommand } from '@univerjs/thread-comment';
import { describe, expect, it, vi } from 'vitest';
import { ShowAddSheetCommentModalOperation } from '../../commands/operations/comment.operation';
import { SheetsThreadCommentPermissionController } from '../sheets-thread-comment-permission.controller';

describe('SheetsThreadCommentPermissionController', () => {
    it('blocks comment panel, add, update and delete actions when comment permissions are denied', () => {
        let beforeCommandHandler: ((command: { id: string; params?: unknown }) => void) | undefined;
        const permissionCheck = {
            permissionCheckWithoutRange: vi.fn(() => false),
            permissionCheckWithRanges: vi.fn(() => false),
            blockExecuteWithoutPermission: vi.fn(),
        };
        const controller = new SheetsThreadCommentPermissionController(
            { t: (key: string) => key } as never,
            {
                beforeCommandExecuted: vi.fn((handler) => {
                    beforeCommandHandler = handler;
                    return { dispose: vi.fn() };
                }),
            } as never,
            permissionCheck as never,
            {
                getComment: vi.fn(() => ({ id: 'comment-1', ref: 'C4' })),
            } as never
        );

        beforeCommandHandler?.({ id: ShowAddSheetCommentModalOperation.id });
        beforeCommandHandler?.({
            id: AddCommentCommand.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                comment: { ref: 'B2' },
            },
        });
        beforeCommandHandler?.({
            id: UpdateCommentCommand.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                payload: { commentId: 'comment-1' },
            },
        });
        beforeCommandHandler?.({
            id: DeleteCommentCommand.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                commentId: 'comment-1',
            },
        });

        expect(permissionCheck.permissionCheckWithoutRange).toHaveBeenCalledTimes(1);
        expect(permissionCheck.permissionCheckWithRanges).toHaveBeenCalledWith(expect.any(Object), [{
            startRow: 1,
            startColumn: 1,
            endRow: 1,
            endColumn: 1,
        }], 'unit-1', 'sheet-1');
        expect(permissionCheck.permissionCheckWithRanges).toHaveBeenCalledWith(expect.any(Object), [{
            startRow: 3,
            startColumn: 2,
            endRow: 3,
            endColumn: 2,
        }], 'unit-1', 'sheet-1');
        expect(permissionCheck.blockExecuteWithoutPermission).toHaveBeenCalledTimes(4);
        expect(permissionCheck.blockExecuteWithoutPermission).toHaveBeenLastCalledWith('sheets-thread-comment-ui.permission.commentErr');

        controller.dispose();
    });
});
