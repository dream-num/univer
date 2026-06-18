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

import { ICommandService, Injector, RichTextBuilder } from '@univerjs/core';
import {
    AddCommentCommand,
    DeleteCommentCommand,
    DeleteCommentTreeCommand,
    ResolveCommentCommand,
    UpdateCommentCommand,
} from '@univerjs/thread-comment';
import { describe, expect, it, vi } from 'vitest';
import { FUniverSheetsThreadCommentMixin } from '../f-univer';
import '../f-event';

function createApi(cancelEvents = new Set<string>()) {
    const afterListeners: Array<(commandInfo: any) => void> = [];
    const beforeListeners: Array<(commandInfo: any) => void> = [];
    const commandService = {
        onCommandExecuted: (listener: (commandInfo: any) => void) => {
            afterListeners.push(listener);
            return { dispose: vi.fn() };
        },
        beforeCommandExecuted: (listener: (commandInfo: any) => void) => {
            beforeListeners.push(listener);
            return { dispose: vi.fn() };
        },
    };
    class TestCommandService {
        onCommandExecuted = commandService.onCommandExecuted;
        beforeCommandExecuted = commandService.beforeCommandExecuted;
    }
    const injector = new Injector();
    injector.add([ICommandService, { useClass: TestCommandService as never }]);

    const fired: Array<{ name: string; params: any }> = [];
    const range = { getRow: () => 2, getColumn: () => 3 };
    const threadComment = {
        getRange: () => range,
    };
    const workbook = {};
    const worksheet = {
        getCommentById: (commentId: string) => (commentId === 'missing' ? null : threadComment),
    };
    const api = Object.create(FUniverSheetsThreadCommentMixin.prototype) as any;
    Object.defineProperty(api, 'Event', {
        value: {
            CommentAdded: 'CommentAdded',
            BeforeCommentAdd: 'BeforeCommentAdd',
            CommentUpdated: 'CommentUpdated',
            BeforeCommentUpdate: 'BeforeCommentUpdate',
            CommentDeleted: 'CommentDeleted',
            BeforeCommentDelete: 'BeforeCommentDelete',
            CommentResolved: 'CommentResolved',
            BeforeCommentResolve: 'BeforeCommentResolve',
        },
    });
    api.disposeWithMe = vi.fn((disposable) => disposable);
    api.registerEventHandler = vi.fn((_name: string, register: () => unknown) => register());
    api.getSheetCommandTarget = vi.fn(() => ({ workbook, worksheet }));
    api.fireEvent = vi.fn((name: string, params: any) => {
        if (cancelEvents.has(name)) {
            params.cancel = true;
        }
        fired.push({ name, params });
    });
    api._initialize(injector);

    return { api, fired, afterListeners, beforeListeners, workbook, worksheet, threadComment };
}

describe('FUniverSheetsThreadCommentMixin', () => {
    it('creates thread comment builders', () => {
        const { api } = createApi();
        const builder = api.newTheadComment().setId('comment-1');

        expect(builder.id).toBe('comment-1');
    });

    it('fires public comment events from executed comment commands', () => {
        const { api, fired, afterListeners, workbook, worksheet, threadComment } = createApi();

        afterListeners.forEach((listener) => listener({ id: 'unrelated.command', params: {} }));
        api.getSheetCommandTarget.mockReturnValueOnce(null);
        afterListeners.forEach((listener) => listener({
            id: AddCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', comment: { id: 'comment-1' } },
        }));
        afterListeners.forEach((listener) => listener({
            id: AddCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', comment: { id: 'comment-1' } },
        }));
        afterListeners.forEach((listener) => listener({
            id: UpdateCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', payload: { commentId: 'comment-1' } },
        }));
        afterListeners.forEach((listener) => listener({
            id: DeleteCommentTreeCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', commentId: 'comment-1' },
        }));
        afterListeners.forEach((listener) => listener({
            id: ResolveCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', commentId: 'comment-1', resolved: true },
        }));
        afterListeners.forEach((listener) => listener({
            id: AddCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', comment: { id: 'missing' } },
        }));
        afterListeners.forEach((listener) => listener({
            id: UpdateCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', payload: { commentId: 'missing' } },
        }));
        afterListeners.forEach((listener) => listener({
            id: ResolveCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', commentId: 'missing', resolved: true },
        }));

        expect(fired).toEqual([
            { name: 'CommentAdded', params: { workbook, worksheet, row: 2, col: 3, comment: threadComment } },
            { name: 'CommentUpdated', params: { workbook, worksheet, row: 2, col: 3, comment: threadComment } },
            { name: 'CommentDeleted', params: { workbook, worksheet, commentId: 'comment-1' } },
            { name: 'CommentResolved', params: { workbook, worksheet, row: 2, col: 3, comment: threadComment, resolved: true } },
        ]);
    });

    it('fires before comment events and cancels commands when listeners request it', () => {
        const body = RichTextBuilder.newEmptyData().body!;
        const { api, fired, beforeListeners } = createApi();

        beforeListeners.forEach((listener) => listener({ id: 'unrelated.command', params: {} }));
        api.getSheetCommandTarget.mockReturnValueOnce(null);
        beforeListeners.forEach((listener) => listener({
            id: AddCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', comment: { id: 'comment-1', ref: 'B2', text: body } },
        }));
        beforeListeners.forEach((listener) => listener({
            id: AddCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', comment: { id: 'comment-1', ref: 'B2', text: body } },
        }));
        beforeListeners.forEach((listener) => listener({
            id: UpdateCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', payload: { commentId: 'comment-1', text: body } },
        }));
        beforeListeners.forEach((listener) => listener({
            id: DeleteCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', commentId: 'comment-1' },
        }));
        beforeListeners.forEach((listener) => listener({
            id: ResolveCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', commentId: 'comment-1', resolved: false },
        }));
        beforeListeners.forEach((listener) => listener({
            id: UpdateCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', payload: { commentId: 'missing', text: body } },
        }));
        beforeListeners.forEach((listener) => listener({
            id: DeleteCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', commentId: 'missing' },
        }));
        beforeListeners.forEach((listener) => listener({
            id: ResolveCommentCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', commentId: 'missing', resolved: false },
        }));

        expect(fired.map((event) => event.name)).toEqual([
            'BeforeCommentAdd',
            'BeforeCommentUpdate',
            'BeforeCommentDelete',
            'BeforeCommentResolve',
        ]);

        const canceled = createApi(new Set(['BeforeCommentAdd']));
        expect(() => {
            canceled.beforeListeners.forEach((listener) => listener({
                id: AddCommentCommand.id,
                params: { unitId: 'book-1', subUnitId: 'sheet-1', comment: { id: 'comment-1', ref: 'A1', text: body } },
            }));
        }).toThrow();
    });
});
