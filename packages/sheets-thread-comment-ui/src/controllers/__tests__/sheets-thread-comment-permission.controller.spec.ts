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

import { ICommandService, Injector, LocaleService } from '@univerjs/core';
import { SheetPermissionCheckController } from '@univerjs/sheets';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import {
    AddCommentCommand,
    DeleteCommentCommand,
    serializeThreadCommentAnchor,
    ThreadCommentAnchorKind,
    UpdateCommentCommand,
} from '@univerjs/thread-comment';
import { describe, expect, it, vi } from 'vitest';
import { AddSheetDrawingCommentOperation, ShowAddSheetCommentModalOperation } from '../../commands/operations/comment.operation';
import { SheetsThreadCommentPermissionController } from '../sheets-thread-comment-permission.controller';

type BeforeCommandHandler = (command: { id: string; params?: unknown }) => void;

function createTestBed(permissionCheck: object, commentModel: object = { getComment: vi.fn() }) {
    let beforeCommandHandler: BeforeCommandHandler | undefined;
    const injector = new Injector([
        [ICommandService, { useValue: {
            beforeCommandExecuted: vi.fn((handler: BeforeCommandHandler) => {
                beforeCommandHandler = handler;
                return { dispose: vi.fn() };
            }),
        } }],
        [LocaleService, { useValue: { t: (key: string) => key } }],
        [SheetPermissionCheckController, { useValue: permissionCheck }],
        [SheetsThreadCommentModel, { useValue: commentModel }],
        [SheetsThreadCommentPermissionController],
    ]);

    return {
        controller: injector.get(SheetsThreadCommentPermissionController),
        getBeforeCommandHandler: () => beforeCommandHandler,
    };
}

describe('SheetsThreadCommentPermissionController', () => {
    it('blocks comment panel, add, update and delete actions when comment permissions are denied', () => {
        const permissionCheck = {
            permissionCheckWithoutRange: vi.fn(() => false),
            permissionCheckWithRanges: vi.fn(() => false),
            blockExecuteWithoutPermission: vi.fn(),
        };
        const { controller, getBeforeCommandHandler } = createTestBed(
            permissionCheck,
            {
                getComment: vi.fn(() => ({ id: 'comment-1', ref: 'C4' })),
            }
        );
        const beforeCommandHandler = getBeforeCommandHandler();

        beforeCommandHandler?.({ id: ShowAddSheetCommentModalOperation.id });
        beforeCommandHandler?.({ id: AddSheetDrawingCommentOperation.id });
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

        expect(permissionCheck.permissionCheckWithoutRange).toHaveBeenCalledTimes(2);
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
        expect(permissionCheck.blockExecuteWithoutPermission).toHaveBeenCalledTimes(5);
        expect(permissionCheck.blockExecuteWithoutPermission).toHaveBeenLastCalledWith('sheets-thread-comment-ui.permission.commentErr');

        controller.dispose();
    });

    it('rechecks drawing comment permissions without creating an invalid cell range', () => {
        const permissionCheck = {
            permissionCheckWithoutRange: vi.fn()
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(false),
            permissionCheckWithRanges: vi.fn(),
            blockExecuteWithoutPermission: vi.fn(),
        };
        const { controller, getBeforeCommandHandler } = createTestBed(permissionCheck);
        const beforeCommandHandler = getBeforeCommandHandler();
        const command = {
            id: AddCommentCommand.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                comment: {
                    ref: serializeThreadCommentAnchor({
                        kind: ThreadCommentAnchorKind.SHEET_DRAWING,
                        elementId: 'drawing-1',
                    }),
                },
            },
        };

        beforeCommandHandler?.(command);
        beforeCommandHandler?.(command);

        expect(permissionCheck.permissionCheckWithoutRange).toHaveBeenCalledTimes(2);
        expect(permissionCheck.permissionCheckWithoutRange).toHaveBeenLastCalledWith(
            expect.any(Object),
            'unit-1',
            'sheet-1'
        );
        expect(permissionCheck.permissionCheckWithRanges).not.toHaveBeenCalled();
        expect(permissionCheck.blockExecuteWithoutPermission).toHaveBeenCalledTimes(1);
        controller.dispose();
    });
});
