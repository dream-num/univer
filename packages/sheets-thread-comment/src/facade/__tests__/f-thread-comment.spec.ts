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

import { RichTextValue, UniverInstanceType } from '@univerjs/core';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, ResolveCommentCommand, UpdateCommentCommand } from '@univerjs/thread-comment';
import { describe, expect, it, vi } from 'vitest';
import { FTheadCommentBuilder, FTheadCommentItem, FThreadComment } from '../f-thread-comment';
import { FWorksheetCommentMixin } from '../f-worksheet';

function createBody(text: string) {
    return RichTextValue.create({
        id: 'doc-1',
        body: {
            dataStream: `${text}\r\n`,
            textRuns: [],
        },
        documentStyle: {},
    });
}

function createThread(overrides: Record<string, unknown> = {}) {
    return {
        id: 'comment-1',
        threadId: 'thread-1',
        ref: 'A1',
        dT: '2025-01-01T00:00:00.000Z',
        personId: 'user-1',
        text: createBody('hello').getData().body!,
        attachments: [],
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        resolved: false,
        children: [],
        ...overrides,
    } as any;
}

describe('thread comment facade', () => {
    it('should build comment payloads with rich text and keep copies isolated', () => {
        const richText = createBody('hello univer');
        const builder = FTheadCommentBuilder.create()
            .setContent(richText)
            .setPersonId('user-2')
            .setDateTime(new Date('2025-02-21T14:22:22.000Z'))
            .setId('comment-2')
            .setThreadId('thread-2');

        const cloned = builder.copy().setPersonId('user-3');

        expect(builder.content.getData().body).toEqual(richText.getData().body);
        expect(builder.personId).toBe('user-2');
        expect(builder.id).toBe('comment-2');
        expect(builder.threadId).toBe('thread-2');
        expect(builder.dateTime).toBe(builder.build().dT);
        expect(cloned.personId).toBe('user-3');
        expect(builder.personId).toBe('user-2');

        const item = FTheadCommentItem.create(builder.build());
        expect(item.content.getData().body).toEqual(builder.build().text);
    });

    it('should expose thread comment behaviors and execute comment commands with business payloads', async () => {
        const commandService = {
            executeCommand: vi.fn(async () => true),
        };
        const child = createThread({ id: 'reply-1', parentId: 'comment-1', ref: '' });
        const root = createThread({ children: [child] });
        const injector = {
            createInstance: vi.fn((cls: unknown, ...args: any[]) => {
                if ((cls as { name?: string }).name === 'FRange') {
                    return { workbook: args[0], worksheet: args[1], range: args[2] };
                }
                if (cls === FThreadComment) {
                    return { comment: args[0] };
                }
                return null;
            }),
        };
        const workbook = {
            getSheetBySheetId: (sheetId: string) => (sheetId === 'sheet-1' ? { getSheetId: () => 'sheet-1' } : null),
        };
        const univerInstanceService = {
            getUnit: (_unitId: string, type: UniverInstanceType) => (type === UniverInstanceType.UNIVER_SHEET ? workbook : null),
        };
        const threadCommentModel = {
            getCommentWithChildren: () => ({ ...root, children: [child] }),
        };
        const userManagerService = {
            getCurrentUser: () => ({ userID: 'current-user' }),
        };

        const rootComment = new FThreadComment(
            root,
            undefined,
            injector as any,
            commandService as any,
            univerInstanceService as any,
            threadCommentModel as any,
            userManagerService as any
        );
        const replyComment = new FThreadComment(
            child,
            root,
            injector as any,
            commandService as any,
            univerInstanceService as any,
            threadCommentModel as any,
            userManagerService as any
        );

        expect(rootComment.getIsRoot()).toBe(true);
        expect(replyComment.getIsRoot()).toBe(false);
        expect(rootComment.getCommentData()).not.toHaveProperty('children');
        expect(rootComment.getReplies()).toEqual([{ comment: child }]);
        expect(rootComment.getRange()).toEqual(expect.objectContaining({
            workbook,
            worksheet: { getSheetId: expect.any(Function) },
            range: expect.objectContaining({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }),
        }));
        expect(rootComment.getRichText().getData().body).toEqual(root.text);

        await rootComment.deleteAsync();
        await replyComment.deleteAsync();
        await rootComment.updateAsync(createBody('updated'));
        await rootComment.resolveAsync();
        await rootComment.resolveAsync(true);
        await rootComment.replyAsync(FTheadCommentBuilder.create().setContent(createBody('reply')));

        expect(commandService.executeCommand).toHaveBeenCalledWith(DeleteCommentTreeCommand.id, expect.objectContaining({ commentId: root.id }));
        expect(commandService.executeCommand).toHaveBeenCalledWith(DeleteCommentCommand.id, expect.objectContaining({ commentId: child.id }));
        expect(commandService.executeCommand).toHaveBeenCalledWith(UpdateCommentCommand.id, expect.objectContaining({
            payload: expect.objectContaining({
                commentId: root.id,
                updated: true,
                text: createBody('updated').getData().body,
            }),
        }));
        expect(commandService.executeCommand).toHaveBeenCalledWith(ResolveCommentCommand.id, expect.objectContaining({ resolved: true }));
        expect(commandService.executeCommand).toHaveBeenCalledWith(ResolveCommentCommand.id, expect.objectContaining({ resolved: true }));
        expect(commandService.executeCommand).toHaveBeenCalledWith(AddCommentCommand.id, expect.objectContaining({
            comment: expect.objectContaining({
                parentId: root.id,
                threadId: root.threadId,
                ref: root.ref,
                personId: 'current-user',
            }),
        }));
    });

    it('worksheet facade should list, clear and subscribe to sheet comments', async () => {
        const root = createThread();
        const deleteAsync = vi.fn(async () => true);
        const commandListeners: Array<(command: { id: string; params: unknown }) => void> = [];

        const instance = Object.create(FWorksheetCommentMixin.prototype) as any;
        instance._workbook = { getUnitId: () => 'unit-1' };
        instance._worksheet = { getSheetId: () => 'sheet-1' };
        instance._injector = {
            get: (token: unknown) => {
                if (typeof token === 'function' && token.name === 'SheetsThreadCommentModel') {
                    return {
                        getSubUnitAll: () => [root],
                        getComment: (_unitId: string, _subUnitId: string, commentId: string) => (commentId === root.id ? root : undefined),
                    };
                }
                return {
                    onCommandExecuted: (listener: (command: { id: string; params: unknown }) => void) => {
                        commandListeners.push(listener);
                        return { dispose: vi.fn() };
                    },
                };
            },
            createInstance: vi.fn(() => ({ deleteAsync })),
        };

        expect(instance.getComments()).toHaveLength(1);
        expect(await instance.clearComments()).toBe(true);
        expect(deleteAsync).toHaveBeenCalledTimes(1);

        const callback = vi.fn();
        instance.onCommented(callback);
        commandListeners.forEach((listener) => listener({ id: AddCommentCommand.id, params: { comment: root } }));
        commandListeners.forEach((listener) => listener({ id: UpdateCommentCommand.id, params: { comment: root } }));

        expect(callback).toHaveBeenCalledTimes(1);
        expect(instance.getCommentById(root.id)).toEqual({ deleteAsync });
        expect(instance.getCommentById('missing')).toBeUndefined();
    });
});
