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
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { FWorkbookSheetsThreadCommentMixin } from '../f-workbook';

describe('FWorkbookSheetsThreadCommentMixin', () => {
    it('should lazily resolve the thread comment model and create workbook comment facades', async () => {
        const rootComment = { id: 'comment-1' };
        const deleteAsync = vi.fn(async () => true);
        const getUnit = vi.fn(() => [{ root: rootComment }]);
        const createInstance = vi.fn(() => ({ deleteAsync }));
        const get = vi.fn(() => ({ getUnit }));

        const instance = Object.create(FWorkbookSheetsThreadCommentMixin.prototype) as any;
        instance._injector = { get, createInstance };
        instance._workbook = { getUnitId: () => 'unit-1' };

        instance._initialize();

        expect(instance._threadCommentModel.getUnit('unit-1')).toEqual([{ root: rootComment }]);
        expect(instance.getComments()).toEqual([{ deleteAsync }]);
        expect(await instance.clearComments()).toBe(true);
        expect(deleteAsync).toHaveBeenCalledTimes(1);
        expect(createInstance).toHaveBeenCalledTimes(2);
    });

    it('should filter workbook comment update subscriptions to the current workbook', () => {
        const commentUpdate$ = new Subject<any>();
        const callback = vi.fn();
        const instance = Object.create(FWorkbookSheetsThreadCommentMixin.prototype) as any;
        instance._workbook = { getUnitId: () => 'unit-1' };
        instance._threadCommentModel = { commentUpdate$ };

        const disposable = instance.onThreadCommentChange(callback);

        commentUpdate$.next({ unitId: 'other', payload: 1 });
        commentUpdate$.next({ unitId: 'unit-1', payload: 2 });

        expect(callback).toHaveBeenCalledWith({ unitId: 'unit-1', payload: 2 });
        disposable.dispose();
        commentUpdate$.next({ unitId: 'unit-1', payload: 3 });
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should run deprecated before-command hooks for current workbook comments', () => {
        const beforeListeners: Array<(commandInfo: any, options?: any) => void> = [];
        const instance = Object.create(FWorkbookSheetsThreadCommentMixin.prototype) as any;
        instance._workbook = { getUnitId: () => 'unit-1' };
        instance._commandService = {
            beforeCommandExecuted: (listener: (commandInfo: any, options?: any) => void) => {
                beforeListeners.push(listener);
                return { dispose: vi.fn() };
            },
        };
        const beforeAdd = vi.fn();
        const beforeUpdate = vi.fn();
        const beforeDelete = vi.fn();

        instance.onBeforeAddThreadComment(beforeAdd);
        instance.onBeforeUpdateThreadComment(beforeUpdate);
        instance.onBeforeDeleteThreadComment(beforeDelete);

        beforeListeners.forEach((listener) => listener({ id: AddCommentCommand.id, params: { unitId: 'other' } }, { local: true }));
        beforeListeners.forEach((listener) => listener({ id: AddCommentCommand.id, params: { unitId: 'unit-1', comment: { id: 'comment-1' } } }, { local: true }));
        beforeListeners.forEach((listener) => listener({ id: UpdateCommentCommand.id, params: { unitId: 'unit-1', payload: { commentId: 'comment-1' } } }));
        beforeListeners.forEach((listener) => listener({ id: DeleteCommentCommand.id, params: { unitId: 'unit-1', commentId: 'comment-1' } }));

        expect(beforeAdd).toHaveBeenCalledTimes(1);
        expect(beforeAdd).toHaveBeenCalledWith({ unitId: 'unit-1', comment: { id: 'comment-1' } }, { local: true });
        expect(beforeUpdate).toHaveBeenCalledWith({ unitId: 'unit-1', payload: { commentId: 'comment-1' } }, undefined);
        expect(beforeDelete).toHaveBeenCalledWith({ unitId: 'unit-1', commentId: 'comment-1' }, undefined);

        const blocked = Object.create(FWorkbookSheetsThreadCommentMixin.prototype) as any;
        const blockedListeners: Array<(commandInfo: any) => void> = [];
        blocked._workbook = { getUnitId: () => 'unit-1' };
        blocked._commandService = {
            beforeCommandExecuted: (listener: (commandInfo: any) => void) => {
                blockedListeners.push(listener);
                return { dispose: vi.fn() };
            },
        };
        blocked.onBeforeAddThreadComment(() => false);

        expect(() => blockedListeners[0]({ id: AddCommentCommand.id, params: { unitId: 'unit-1' } })).toThrow('Command is stopped by the hook onBeforeAddThreadComment');
    });
});
