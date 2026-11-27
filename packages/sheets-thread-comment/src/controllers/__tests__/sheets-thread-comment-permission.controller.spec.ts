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

import type { ICommandInfo } from '@univerjs/core';
import { ICommandService, Injector, LocaleService, toDisposable } from '@univerjs/core';
import { SheetPermissionCheckController } from '@univerjs/sheets';
import {
    AddCommentCommand,
    DeleteCommentTreeCommand,
    IThreadCommentAuthzService,
    ThreadCommentModel,
    UpdateCommentCommand,
} from '@univerjs/thread-comment';
import { describe, expect, it, vi } from 'vitest';
import { SheetsThreadCommentPermissionController } from '../sheets-thread-comment-permission.controller';

type BeforeCommandHandler = (command: ICommandInfo) => void;

function createTestBed(options: { comment?: unknown; root?: unknown; allowed?: boolean } = {}) {
    let beforeCommandHandler: BeforeCommandHandler | undefined;
    const authzService = {
        canRead: vi.fn(() => options.allowed ?? true),
        canWrite: vi.fn(() => options.allowed ?? true),
    };
    const permissionCheck = {
        blockExecuteWithoutPermission: vi.fn(),
    };
    const commentModel = {
        getComment: vi.fn(() => options.comment),
        getCommentWithChildren: vi.fn(() => options.root),
    };
    const injector = new Injector([
        [ICommandService, { useValue: {
            beforeCommandExecuted: vi.fn((handler: BeforeCommandHandler) => {
                beforeCommandHandler = handler;

                return toDisposable(() => undefined);
            }),
        } as never }],
        [LocaleService, { useValue: { t: (key: string) => key } as never }],
        [SheetPermissionCheckController, { useValue: permissionCheck as never }],
        [ThreadCommentModel, { useValue: commentModel as never }],
        [IThreadCommentAuthzService, { useValue: authzService as never }],
        [SheetsThreadCommentPermissionController],
    ]);

    const controller = injector.get(SheetsThreadCommentPermissionController);

    return {
        authzService,
        client: () => beforeCommandHandler,
        commentModel,
        controller,
        permissionCheck,
    };
}

describe('SheetsThreadCommentPermissionController', () => {
    it('blocks an update the authz service refuses and reports the comment target', () => {
        const bed = createTestBed({
            allowed: false,
            comment: { id: 'comment-1', ref: 'C4', personId: 'author-1' },
        });

        bed.client()?.({
            id: UpdateCommentCommand.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                payload: { commentId: 'comment-1' },
            },
        } as ICommandInfo);

        expect(bed.authzService.canWrite).toHaveBeenCalledWith('update', {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ref: 'C4',
            personId: 'author-1',
        });
        expect(bed.permissionCheck.blockExecuteWithoutPermission).toHaveBeenCalledWith(
            'sheets-thread-comment.permission.commentErr'
        );

        bed.controller.dispose();
    });

    it('checks the root comment when deleting a whole thread', () => {
        const bed = createTestBed({
            allowed: false,
            root: { root: { id: 'root-1', ref: 'A1', personId: 'owner-1' } },
        });

        bed.client()?.({
            id: DeleteCommentTreeCommand.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', commentId: 'reply-1' },
        } as ICommandInfo);

        expect(bed.commentModel.getCommentWithChildren).toHaveBeenCalledWith('unit-1', 'sheet-1', 'reply-1');
        expect(bed.authzService.canWrite).toHaveBeenCalledWith('delete', {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ref: 'A1',
            personId: 'owner-1',
        });

        bed.controller.dispose();
    });

    it('checks a root comment as an add and a reply as a reply', () => {
        const bed = createTestBed({ root: { root: { id: 'root-1', ref: 'A1', personId: 'owner-1' } } });

        bed.client()?.({
            id: AddCommentCommand.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                comment: { id: 'root-1', ref: 'A1', personId: 'owner-1' },
            },
        } as ICommandInfo);
        bed.client()?.({
            id: AddCommentCommand.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                comment: { id: 'reply-1', ref: 'A1', parentId: 'root-1', personId: 'user-1' },
            },
        } as ICommandInfo);

        expect(bed.authzService.canWrite).toHaveBeenNthCalledWith(1, 'add', expect.objectContaining({ ref: 'A1' }));
        expect(bed.authzService.canWrite).toHaveBeenNthCalledWith(2, 'reply', expect.objectContaining({ ref: 'A1' }));

        bed.controller.dispose();
    });

    it('does not block when the authz service allows the write', () => {
        const bed = createTestBed({
            comment: { id: 'comment-1', ref: 'C4', personId: 'author-1' },
        });

        bed.client()?.({
            id: UpdateCommentCommand.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                payload: { commentId: 'comment-1' },
            },
        } as ICommandInfo);

        expect(bed.permissionCheck.blockExecuteWithoutPermission).not.toHaveBeenCalled();

        bed.controller.dispose();
    });
});
