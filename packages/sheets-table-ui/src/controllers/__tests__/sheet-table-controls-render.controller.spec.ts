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

import { CommandType } from '@univerjs/core';
import { SelectRangeCommand } from '@univerjs/sheets';
import { MoveSelectionCommand, SelectAllCommand } from '@univerjs/sheets-ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetTableControlsRenderController } from '../sheet-table-controls-render.controller';

function createController(hasSkeleton = true) {
    const activeSheet$ = new Subject();
    const currentSkeleton$ = new Subject();
    const tableAdd$ = new Subject();
    const selectionChanged$ = new Subject();
    const sceneMakeDirty = vi.fn();
    const skeleton = hasSkeleton ? { gapConfig: { rowGaps: {} } } : null;
    let commandListener: ((command: { id: string; type: CommandType }) => void) | undefined;

    const controller = new SheetTableControlsRenderController(
        {
            unit: {
                activeSheet$,
                getActiveSheet: () => ({ getSheetId: () => 'sheet-1' }),
                getUnitId: () => 'unit-1',
            },
            scene: {
                addObjects: vi.fn(),
                removeObjects: vi.fn(),
                makeDirty: sceneMakeDirty,
                setCursor: vi.fn(),
                resetCursor: vi.fn(),
            },
            components: { get: vi.fn() },
        } as never,
        {} as never,
        {
            currentSkeleton$,
            getCurrentSkeleton: () => skeleton,
        } as never,
        {
            onCommandExecuted: (listener: (command: { id: string; type: CommandType }) => void) => {
                commandListener = listener;
                return { dispose: vi.fn() };
            },
        } as never,
        {
            tableAdd$,
            tableDelete$: new Subject(),
            tableNameChanged$: new Subject(),
            tableRangeChanged$: new Subject(),
            tableThemeChanged$: new Subject(),
            getTablesBySubunitId: () => [],
        } as never,
        { getRangeThemeStyle: vi.fn() } as never,
        { unitPermissionInitStateChange$: new Subject() } as never,
        {
            permissionPointUpdate$: new Subject(),
            getPermissionPoint: () => ({ value: true }),
        } as never,
        {
            selectionChanged$,
            getCurrentSelections: () => [],
        } as never,
        { resetSelectionsByModelData: vi.fn() } as never,
        { refreshTable$: new Subject() } as never,
        { t: (key: string) => key } as never,
        {} as never,
        {} as never
    );

    sceneMakeDirty.mockClear();
    return {
        controller,
        sceneMakeDirty,
        selectionChanged$,
        tableAdd$,
        executeCommand: (command: { id: string; type: CommandType }) => commandListener?.(command),
    };
}

describe('SheetTableControlsRenderController', () => {
    it('keeps sheet caches for selection refreshes and invalidates them for table refreshes', () => {
        const { controller, sceneMakeDirty, selectionChanged$, tableAdd$, executeCommand } = createController();

        selectionChanged$.next({});
        executeCommand({ id: MoveSelectionCommand.id, type: CommandType.COMMAND });
        executeCommand({ id: SelectAllCommand.id, type: CommandType.COMMAND });
        executeCommand({ id: SelectRangeCommand.id, type: CommandType.COMMAND });
        executeCommand({ id: 'doc.mutation.rich-text-editing', type: CommandType.MUTATION });
        expect(sceneMakeDirty).not.toHaveBeenCalled();

        tableAdd$.next({});
        expect(sceneMakeDirty).toHaveBeenCalledOnce();

        controller.dispose();
    });

    it('clears unavailable controls without invalidating sheet caches on selection changes', () => {
        const { controller, sceneMakeDirty, selectionChanged$ } = createController(false);
        const shape = Reflect.get(controller, '_shape') as {
            setItems: (items: unknown[]) => void;
            refreshBounds: () => void;
        };
        const setItems = vi.spyOn(shape, 'setItems');
        const refreshBounds = vi.spyOn(shape, 'refreshBounds');

        selectionChanged$.next({});

        expect(setItems).toHaveBeenCalledWith([]);
        expect(refreshBounds).toHaveBeenCalledOnce();
        expect(sceneMakeDirty).not.toHaveBeenCalled();

        controller.dispose();
    });
});
