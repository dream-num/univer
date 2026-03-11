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

import { AddCommentMutation, DeleteCommentMutation, UpdateCommentRefMutation } from '@univerjs/thread-comment';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetsThreadCommentRefRangeController } from '../sheets-thread-comment-ref-range.controller';

const sheetsMocks = vi.hoisted(() => ({
    handleRangeChange: vi.fn(),
}));

vi.mock('@univerjs/sheets', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/sheets')>('@univerjs/sheets');
    return {
        ...actual,
        handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests: sheetsMocks.handleRangeChange,
    };
});

function createRoot(ref = 'A1', overrides: Record<string, unknown> = {}) {
    return {
        id: 'comment-1',
        threadId: 'thread-1',
        ref,
        dT: '2025-01-01T00:00:00.000Z',
        personId: 'user-1',
        text: { dataStream: 'hello\r\n', textRuns: [] },
        attachments: [],
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        ...overrides,
    } as any;
}

describe('SheetsThreadCommentRefRangeController', () => {
    it('should register initial comments and transform ref changes into undo/redo mutations', async () => {
        const registerDisposes: Array<ReturnType<typeof vi.fn>> = [];
        const watchDisposes: Array<ReturnType<typeof vi.fn>> = [];
        const registerCalls: Array<{ callback: (commandInfo: unknown) => unknown }> = [];
        const watchCalls: Array<{ callback: (before: unknown, after: any) => void }> = [];
        const executeCommand = vi.fn(async () => true);
        const root = createRoot('A1', { row: 0, column: 0 });
        const updates$ = new Subject<any>();

        const controller = new SheetsThreadCommentRefRangeController(
            {
                registerRefRange: (_range: unknown, callback: (commandInfo: unknown) => unknown) => {
                    const dispose = vi.fn();
                    registerDisposes.push(dispose);
                    registerCalls.push({ callback });
                    return { dispose };
                },
                watchRange: (_unitId: string, _subUnitId: string, _range: unknown, callback: (before: unknown, after: any) => void) => {
                    const dispose = vi.fn();
                    watchDisposes.push(dispose);
                    watchCalls.push({ callback });
                    return { dispose };
                },
            } as any,
            {
                commentUpdate$: updates$,
                getComment: vi.fn(),
            } as any,
            {
                getAll: () => [{ threads: [{ unitId: 'unit-1', subUnitId: 'sheet-1', root }] }],
            } as any,
            {} as any,
            { executeCommand } as any
        );

        expect(registerCalls).toHaveLength(1);
        expect(watchCalls).toHaveLength(1);

        sheetsMocks.handleRangeChange.mockReturnValueOnce({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 });
        expect(registerCalls[0].callback({})).toEqual({ redos: [], undos: [] });

        sheetsMocks.handleRangeChange.mockReturnValueOnce({ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 });
        expect(registerCalls[0].callback({})).toEqual({
            redos: [{
                id: UpdateCommentRefMutation.id,
                params: {
                    unitId: 'unit-1',
                    subUnitId: 'sheet-1',
                    payload: { ref: 'C3', commentId: 'comment-1' },
                    silent: false,
                },
            }],
            undos: [{
                id: UpdateCommentRefMutation.id,
                params: {
                    unitId: 'unit-1',
                    subUnitId: 'sheet-1',
                    payload: { ref: 'A1', commentId: 'comment-1' },
                    silent: false,
                },
            }],
        });

        sheetsMocks.handleRangeChange.mockReturnValueOnce(null);
        expect(registerCalls[0].callback({})).toEqual({
            redos: [{
                id: DeleteCommentMutation.id,
                params: { unitId: 'unit-1', subUnitId: 'sheet-1', commentId: 'comment-1' },
            }],
            undos: [{
                id: AddCommentMutation.id,
                params: expect.objectContaining({
                    unitId: 'unit-1',
                    subUnitId: 'sheet-1',
                    comment: expect.objectContaining(root),
                    sync: true,
                }),
            }],
        });

        await watchCalls[0].callback(null, { startRow: 4, endRow: 4, startColumn: 1, endColumn: 1 });
        expect(executeCommand).toHaveBeenCalledWith(UpdateCommentRefMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            payload: { ref: 'B5', commentId: 'comment-1' },
            silent: true,
        }, { onlyLocal: true });

        controller.dispose();
    });

    it('should react to add, delete and updateRef comment updates by maintaining watchers', () => {
        const registerDisposes: Array<ReturnType<typeof vi.fn>> = [];
        const watchDisposes: Array<ReturnType<typeof vi.fn>> = [];
        const updates$ = new Subject<any>();
        const movedComment = createRoot('D4');
        const getComment = vi.fn(() => movedComment);

        const controller = new SheetsThreadCommentRefRangeController(
            {
                registerRefRange: vi.fn(() => {
                    const dispose = vi.fn();
                    registerDisposes.push(dispose);
                    return { dispose };
                }),
                watchRange: vi.fn(() => {
                    const dispose = vi.fn();
                    watchDisposes.push(dispose);
                    return { dispose };
                }),
            } as any,
            {
                commentUpdate$: updates$,
                getComment,
            } as any,
            {
                getAll: () => [],
            } as any,
            {} as any,
            { executeCommand: vi.fn() } as any
        );

        updates$.next({
            type: 'add',
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            column: 0,
            payload: createRoot('A1'),
        });
        expect(registerDisposes).toHaveLength(1);
        expect(watchDisposes).toHaveLength(1);

        updates$.next({
            type: 'add',
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            column: 0,
            payload: createRoot('A1', { parentId: 'root-1' }),
        });
        expect(registerDisposes).toHaveLength(1);

        updates$.next({
            type: 'updateRef',
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 3,
            column: 3,
            silent: false,
            payload: { commentId: 'comment-1' },
        });
        expect(getComment).toHaveBeenCalledWith('unit-1', 'sheet-1', 'comment-1');
        expect(registerDisposes[0]).toHaveBeenCalledTimes(1);
        expect(watchDisposes[0]).toHaveBeenCalledTimes(1);
        expect(registerDisposes).toHaveLength(2);
        expect(watchDisposes).toHaveLength(2);

        updates$.next({
            type: 'updateRef',
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 3,
            column: 3,
            silent: true,
            payload: { commentId: 'comment-1' },
        });
        expect(watchDisposes[1]).toHaveBeenCalledTimes(0);
        expect(watchDisposes).toHaveLength(2);
        expect(registerDisposes).toHaveLength(3);

        updates$.next({
            type: 'delete',
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            payload: { commentId: 'comment-1' },
        });
        expect(registerDisposes[2]).toHaveBeenCalledTimes(1);
        expect(watchDisposes[1]).toHaveBeenCalledTimes(1);

        controller.dispose();
    });
});
