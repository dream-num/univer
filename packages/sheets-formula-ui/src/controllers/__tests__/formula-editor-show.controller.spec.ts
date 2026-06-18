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

import { BEFORE_CELL_EDIT, SetWorksheetRowAutoHeightMutation } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { FormulaEditorShowController } from '../formula-editor-show.controller';

function createController() {
    let editInterceptor: any;
    let beforeCommandHandler: ((command: { id: string; params?: unknown }) => void) | undefined;
    let commandExecutedHandler: ((command: { id: string; params?: unknown }, options?: unknown) => void) | undefined;
    const currentSkeleton$ = new Subject<any>();
    const worksheet = {
        getSheetId: () => 'sheet-1',
        unitId: 'unit-1',
        getCell: vi.fn(() => ({ f: '=SUM(A1:A2)' })),
    };
    const skeleton = { worksheet };

    const controller = new FormulaEditorShowController(
        { unitId: 'unit-1' } as never,
        {
            writeCellInterceptor: {
                intercept: vi.fn((point, config) => {
                    expect(point).toBe(BEFORE_CELL_EDIT);
                    editInterceptor = config;
                    return { dispose: vi.fn() };
                }),
            },
        } as never,
        { getSkeleton: vi.fn(() => skeleton) } as never,
        {
            getArrayFormulaRange: vi.fn(() => null),
            getArrayFormulaCellData: vi.fn(() => ({})),
            getFormulaStringByCell: vi.fn(() => '=SUM(A1:A2)'),
        } as never,
        { getColorFromTheme: vi.fn(() => '#fff') } as never,
        { getRenderById: vi.fn(() => null) } as never,
        {
            currentSkeleton$,
            getCurrentSkeleton: vi.fn(() => skeleton),
        } as never,
        {
            onCommandExecuted: vi.fn((handler) => {
                commandExecutedHandler = handler;
                return { dispose: vi.fn() };
            }),
            beforeCommandExecuted: vi.fn((handler) => {
                beforeCommandHandler = handler;
                return { dispose: vi.fn() };
            }),
        } as never,
        { debug: vi.fn() } as never
    );

    currentSkeleton$.next({ skeleton, unitId: 'unit-1', sheetId: 'sheet-1' });

    return {
        controller,
        editInterceptor: () => editInterceptor,
        beforeCommandHandler: () => beforeCommandHandler,
        commandExecutedHandler: () => commandExecutedHandler,
        worksheet,
    };
}

describe('FormulaEditorShowController', () => {
    it('preserves the formula string when starting to edit a calculated formula cell', () => {
        const { controller, editInterceptor, worksheet } = createController();
        const originalCell = { v: 3 };
        const result = editInterceptor().handler(
            originalCell,
            {
                row: 0,
                col: 1,
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                worksheet,
            },
            vi.fn((cell) => cell)
        );

        expect(result).toEqual({ v: 3, f: '=SUM(A1:A2)' });

        controller.dispose();
    });

    it('passes empty edit values through and registers row-height refresh listener', () => {
        const { controller, editInterceptor, beforeCommandHandler } = createController();
        const next = vi.fn((cell) => cell);

        expect(editInterceptor().handler(null, {
            row: 0,
            col: 1,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            worksheet: {},
        }, next)).toBeNull();
        expect(next).toHaveBeenCalledWith(null);

        beforeCommandHandler()?.({
            id: SetWorksheetRowAutoHeightMutation.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                rowsAutoHeightInfo: [{ row: 0 }],
            },
        });

        expect(beforeCommandHandler()).toBeDefined();

        controller.dispose();
    });
});
