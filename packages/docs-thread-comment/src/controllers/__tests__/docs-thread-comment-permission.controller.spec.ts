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
import { CustomCommandExecutionError, ErrorService, ICommandService, Injector, toDisposable } from '@univerjs/core';
import { AddCommentCommand, IThreadCommentAuthzService, ThreadCommentModel, UpdateCommentCommand } from '@univerjs/thread-comment';
import { describe, expect, it, vi } from 'vitest';
import { DocsThreadCommentPermissionController } from '../docs-thread-comment-permission.controller';

type BeforeCommandHandler = (command: ICommandInfo) => void;

function createTestBed(allowed: boolean) {
    let beforeCommandHandler: BeforeCommandHandler | undefined;
    const authzService = {
        canRead: vi.fn(() => allowed),
        canWrite: vi.fn(() => allowed),
    };
    const errorService = {
        emitPermissionDenied: vi.fn(),
    };
    const injector = new Injector([
        [ICommandService, { useValue: {
            beforeCommandExecuted: vi.fn((handler: BeforeCommandHandler) => {
                beforeCommandHandler = handler;

                return toDisposable(() => undefined);
            }),
        } as never }],
        [ErrorService, { useValue: errorService as never }],
        [ThreadCommentModel, { useValue: {
            getComment: vi.fn(() => ({ id: 'comment-1', ref: 'Range-1', personId: 'author-1' })),
            getCommentWithChildren: vi.fn(),
        } as never }],
        [IThreadCommentAuthzService, { useValue: authzService as never }],
        [DocsThreadCommentPermissionController],
    ]);

    const controller = injector.get(DocsThreadCommentPermissionController);

    return {
        authzService,
        client: () => beforeCommandHandler,
        controller,
        errorService,
    };
}

describe('DocsThreadCommentPermissionController', () => {
    it('denies a comment write and reports the permission denial', () => {
        const bed = createTestBed(false);

        expect(() => bed.client()?.({
            id: UpdateCommentCommand.id,
            params: {
                unitId: 'doc-1',
                subUnitId: 'doc-1',
                payload: { commentId: 'comment-1' },
            },
        } as ICommandInfo)).toThrow(CustomCommandExecutionError);

        expect(bed.authzService.canWrite).toHaveBeenCalledWith('update', {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            ref: 'Range-1',
            personId: 'author-1',
        });
        expect(bed.errorService.emitPermissionDenied).toHaveBeenCalledWith('doc-1');

        bed.controller.dispose();
    });

    it('allows a comment write when the authz service permits it', () => {
        const bed = createTestBed(true);

        expect(() => bed.client()?.({
            id: AddCommentCommand.id,
            params: {
                unitId: 'doc-1',
                subUnitId: 'doc-1',
                comment: { id: 'comment-1', ref: 'Range-1', personId: 'author-1' },
            },
        } as ICommandInfo)).not.toThrow();

        expect(bed.errorService.emitPermissionDenied).not.toHaveBeenCalled();

        bed.controller.dispose();
    });
});
