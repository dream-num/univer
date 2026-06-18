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

import {
    ICommandService,
    ILogService,
    Injector,
    IUniverInstanceService,
    RichTextBuilder,
    UniverInstanceType,
    UserManagerService,
} from '@univerjs/core';
import { FormulaDataModel } from '@univerjs/engine-formula';
import { AddCommentCommand, DeleteCommentTreeCommand, ThreadCommentModel } from '@univerjs/thread-comment';
import { describe, expect, it, vi } from 'vitest';
import { SheetsThreadCommentModel } from '../../models/sheets-thread-comment.model';
import { FRangeSheetsThreadCommentMixin } from '../f-range';
import { FTheadCommentBuilder } from '../f-thread-comment';

function createComment(id: string, ref: string) {
    return {
        id,
        threadId: `thread-${id}`,
        ref,
        dT: '2025-01-01T00:00:00.000Z',
        personId: 'user-1',
        text: RichTextBuilder.newEmptyData().body!,
        attachments: [],
        unitId: 'book-1',
        subUnitId: 'sheet-1',
        children: [],
    };
}

describe('FRangeSheetsThreadCommentMixin', () => {
    it('gets, adds, and clears comments through injected services', async () => {
        const commandService = { executeCommand: vi.fn(async () => true) };
        const comments = new Map([
            ['comment-1', createComment('comment-1', 'A1')],
            ['comment-2', createComment('comment-2', 'B1')],
        ]);
        const locations = new Map([
            ['0:0', 'comment-1'],
            ['0:1', 'comment-2'],
        ]);

        class TestSheetsThreadCommentModel {
            getByLocation = (_unitId: string, _sheetId: string, row: number, col: number) => locations.get(`${row}:${col}`);
            getComment = (_unitId: string, _sheetId: string, commentId: string) => comments.get(commentId);
            getCommentWithChildren = (_unitId: string, _sheetId: string, commentId: string) => comments.get(commentId);
        }

        class TestUserManagerService {
            getCurrentUser = () => ({ userID: 'current-user' });
        }

        class TestUniverInstanceService {
            getUnit = (_unitId: string, type: UniverInstanceType) => (type === UniverInstanceType.UNIVER_SHEET ? workbook : null);
        }

        class TestThreadCommentModel {
            getCommentWithChildren = (_unitId: string, _subUnitId: string, commentId: string) => comments.get(commentId);
        }

        class TestFormulaDataModel {}
        class TestLogService {}

        const injector = new Injector();
        injector.add([SheetsThreadCommentModel, { useClass: TestSheetsThreadCommentModel as never }]);
        injector.add([ICommandService, { useClass: class { executeCommand = commandService.executeCommand; } as never }]);
        injector.add([UserManagerService, { useClass: TestUserManagerService as never }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([ThreadCommentModel, { useClass: TestThreadCommentModel as never }]);
        injector.add([FormulaDataModel, { useClass: TestFormulaDataModel as never }]);
        injector.add([ILogService, { useClass: TestLogService as never }]);

        const workbook = { getUnitId: () => 'book-1', getSheetBySheetId: () => worksheet };
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getRowCount: () => 100,
            getColumnCount: () => 100,
        };
        const range = injector.createInstance(
            FRangeSheetsThreadCommentMixin,
            workbook as never,
            worksheet as never,
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 }
        );

        expect(range.getComment()?.getCommentData().id).toBe('comment-1');
        expect(range.getComments().map((comment) => comment.getCommentData().id)).toEqual(['comment-1', 'comment-2']);

        await expect(range.addCommentAsync(FTheadCommentBuilder.create().setId('new-comment'))).resolves.toBe(true);
        expect(commandService.executeCommand).toHaveBeenCalledWith(AddCommentCommand.id, expect.objectContaining({
            comment: expect.objectContaining({
                id: 'new-comment',
                ref: 'A1',
                personId: 'current-user',
                parentId: 'comment-1',
                unitId: 'book-1',
                subUnitId: 'sheet-1',
            }),
        }));

        await expect(range.clearCommentAsync()).resolves.toBe(true);
        expect(commandService.executeCommand).toHaveBeenCalledWith(DeleteCommentTreeCommand.id, {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            threadId: 'thread-comment-1',
            commentId: 'comment-1',
        });

        await expect(range.clearCommentsAsync()).resolves.toBe(true);
        expect(commandService.executeCommand).toHaveBeenCalledWith(DeleteCommentTreeCommand.id, expect.objectContaining({ commentId: 'comment-2' }));
    });

    it('returns empty comment results and treats clearing an empty cell as successful', async () => {
        class TestSheetsThreadCommentModel {
            getByLocation = () => 'missing-comment';
            getComment = () => null;
        }

        const injector = new Injector();
        injector.add([SheetsThreadCommentModel, { useClass: TestSheetsThreadCommentModel as never }]);
        injector.add([ICommandService, { useClass: class { executeCommand = vi.fn(async () => true); } as never }]);
        injector.add([UserManagerService, { useClass: class { getCurrentUser = () => ({ userID: 'user' }); } as never }]);
        injector.add([IUniverInstanceService, { useClass: class { getUnit = () => null; } as never }]);
        injector.add([ThreadCommentModel, { useClass: class { getCommentWithChildren = () => null; } as never }]);
        injector.add([FormulaDataModel, { useClass: class {} as never }]);
        injector.add([ILogService, { useClass: class {} as never }]);

        const range = injector.createInstance(
            FRangeSheetsThreadCommentMixin,
            { getUnitId: () => 'book-1' } as never,
            { getSheetId: () => 'sheet-1', getRowCount: () => 10, getColumnCount: () => 10 } as never,
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }
        );

        expect(range.getComment()).toBeNull();
        expect(range.getComments()).toEqual([]);
        await expect(range.clearComment()).resolves.toBe(true);
    });
});
