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

import { EventSubject } from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SetCellEditVisibleOperation } from '../../../../commands/operations/cell-edit.operation';
import { SHEET_VIEW_KEY } from '../../../../common/keys';
import { MobileCellEditRenderController } from '../mobile-cell-edit.render-controller';

describe('MobileCellEditRenderController', () => {
    it('opens the current sheet editor from a mobile double tap', () => {
        const currentDbClickedCell$ = new Subject<{ location: { unitId: string } }>();
        const currentPointerDownCell$ = new Subject<never>();
        const commandService = { executeCommand: vi.fn() };
        const controller = new MobileCellEditRenderController(
            { unitId: 'unit-1' } as never,
            commandService as never,
            { getEditCellState: vi.fn(() => null) } as never,
            { currentDbClickedCell$, currentPointerDownCell$ } as never
        );

        currentDbClickedCell$.next({ location: { unitId: 'unit-2' } });
        expect(commandService.executeCommand).not.toHaveBeenCalled();

        currentDbClickedCell$.next({ location: { unitId: 'unit-1' } });
        expect(commandService.executeCommand).toHaveBeenCalledExactlyOnceWith(SetCellEditVisibleOperation.id, {
            visible: true,
            eventType: DeviceInputEventType.Dblclick,
            unitId: 'unit-1',
        });

        controller.dispose();
    });

    it('keeps editing the current cell and closes the editor when another cell is pressed', () => {
        const currentDbClickedCell$ = new Subject<{ location: { unitId: string } }>();
        const currentPointerDownCell$ = new Subject<{
            unitId: string;
            subUnitId: string;
            row: number;
            col: number;
        }>();
        const spreadsheetPointerDown$ = new EventSubject<unknown>();
        const rowHeaderPointerDown$ = new EventSubject<unknown>();
        const columnHeaderPointerDown$ = new EventSubject<unknown>();
        const leftTopPointerDown$ = new EventSubject<unknown>();
        const workbook = { getUnitId: vi.fn(() => 'unit-1') };
        const commandService = {
            executeCommand: vi.fn(),
            syncExecuteCommand: vi.fn(),
        };
        const controller = new MobileCellEditRenderController(
            {
                unitId: 'unit-1',
                isMainScene: true,
                unit: { getCurrentUnitOfType: vi.fn(() => workbook) },
                mainComponent: { onPointerDown$: spreadsheetPointerDown$ },
                components: new Map([
                    [SHEET_VIEW_KEY.ROW, { onPointerDown$: rowHeaderPointerDown$ }],
                    [SHEET_VIEW_KEY.COLUMN, { onPointerDown$: columnHeaderPointerDown$ }],
                    [SHEET_VIEW_KEY.LEFT_TOP, { onPointerDown$: leftTopPointerDown$ }],
                ]),
                scene: {},
                engine: {},
            } as never,
            commandService as never,
            {
                getEditCellState: vi.fn(() => null),
                getEditLocation: vi.fn(() => ({
                    unitId: 'unit-1',
                    sheetId: 'sheet-1',
                    row: 5,
                    column: 0,
                })),
                isForceKeepVisible: vi.fn(() => false),
                isVisible: vi.fn(() => ({ visible: true })),
            } as never,
            { currentDbClickedCell$, currentPointerDownCell$ } as never
        );

        currentPointerDownCell$.next({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 5,
            col: 0,
        });
        expect(commandService.syncExecuteCommand).not.toHaveBeenCalled();

        currentPointerDownCell$.next({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 6,
            col: 0,
        });

        expect(commandService.syncExecuteCommand).toHaveBeenCalledExactlyOnceWith(
            SetCellEditVisibleOperation.id,
            {
                visible: false,
                eventType: DeviceInputEventType.PointerDown,
                unitId: 'unit-1',
            }
        );

        controller.dispose();
    });
});
