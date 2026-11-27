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

import { InsertColMutation, InsertRowMutation } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { SheetsFilterSyncController } from '../sheets-filter-sync.controller';

describe('SheetsFilterSyncController', () => {
    it('does not run the disabled-sync listener for a read-only workbook', () => {
        const onCommandExecutedHandlers: Array<(command: { id: string; params: unknown }, options?: { fromCollab?: boolean }) => void> = [];
        const insertCol = vi.fn(() => []);
        const controller = new SheetsFilterSyncController(
            {
                handleRemoteInsertCol: insertCol,
            } as never,
            {
                isRemoteFilterMutationsSuppressed: () => true,
                markRemoteFilterRecalc: vi.fn(),
            } as never,
            {
                beforeCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
                onCommandExecuted: vi.fn((handler) => {
                    onCommandExecutedHandlers.push(handler);
                    return { dispose: vi.fn() };
                }),
                syncExecuteCommand: vi.fn(() => true),
            } as never,
            { getConfig: () => undefined } as never,
            { getUnit: vi.fn() } as never,
            { getPermissionPoint: vi.fn(() => ({ value: false })) } as never
        );
        controller.setEnabled(false);

        onCommandExecutedHandlers.forEach((handler) => handler({
            id: InsertColMutation.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            },
        }, { fromCollab: true }));

        // The always-on remote structural listener handles the personal filter once; the old
        // disabled-sync listener must not handle the same read-only workbook again.
        expect(insertCol).toHaveBeenCalledTimes(1);
        controller.dispose();
    });

    it('updates a locally suppressed filter range from remote structural mutations', () => {
        let onCommandExecuted: ((command: { id: string; params: unknown }, options?: { fromCollab?: boolean }) => void) | undefined;
        const insertRow = vi.fn(() => [{ id: 'filter.range', params: {} }]);
        const syncExecuteCommand = vi.fn(() => true);
        const markRemoteFilterRecalc = vi.fn();
        const controller = new SheetsFilterSyncController(
            {
                handleRemoteInsertRow: insertRow,
            } as never,
            {
                isRemoteFilterMutationsSuppressed: () => true,
                markRemoteFilterRecalc,
            } as never,
            {
                onCommandExecuted: vi.fn((handler) => {
                    onCommandExecuted = handler;
                    return { dispose: vi.fn() };
                }),
                syncExecuteCommand,
            } as never,
            { getConfig: () => undefined } as never,
            { getUnit: vi.fn() } as never,
            { getPermissionPoint: vi.fn(() => undefined) } as never
        );
        const range = { startRow: 2, endRow: 4, startColumn: 0, endColumn: 1 };

        onCommandExecuted?.({
            id: InsertRowMutation.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', range },
        }, { fromCollab: true });

        expect(insertRow).toHaveBeenCalledWith(range, 'unit-1', 'sheet-1');
        expect(markRemoteFilterRecalc).toHaveBeenCalledWith('unit-1', 'sheet-1');
        expect(syncExecuteCommand).toHaveBeenCalledWith('filter.range', {}, expect.objectContaining({
            fromCollab: true,
            onlyLocal: true,
        }));
        controller.dispose();
    });
});
