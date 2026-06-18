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

import { MoveRangeCommand } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SHEET_VIEW_KEY } from '../../common/keys';
import { HoverRenderController } from '../hover-render.controller';
import { MoveRangeRenderController } from '../move-range.controller';

function createEventSubject() {
    const handlers = new Set<(evt: any) => void>();

    return {
        subscribeEvent: vi.fn((handler: (evt: any) => void) => {
            handlers.add(handler);
            return { dispose: vi.fn(() => handlers.delete(handler)) };
        }),
        emit: (evt: any) => handlers.forEach((handler) => handler(evt)),
    };
}

describe('HoverRenderController', () => {
    it('forwards sheet body and header pointer events to hover manager services', () => {
        const currentSkeleton$ = new Subject<any>();
        const validViewportScrollInfo$ = new Subject<void>();
        const mainComponent = {
            onPointerEnter$: createEventSubject(),
            onPointerMove$: createEventSubject(),
            onPointerDown$: createEventSubject(),
            onPointerUp$: createEventSubject(),
            onClick$: createEventSubject(),
            onDblclick$: createEventSubject(),
            onPointerLeave$: createEventSubject(),
        };
        const rowHeader = {
            onPointerMove$: createEventSubject(),
            onPointerDown$: createEventSubject(),
            onPointerUp$: createEventSubject(),
            onDblclick$: createEventSubject(),
        };
        const colHeader = {
            onPointerMove$: createEventSubject(),
            onPointerDown$: createEventSubject(),
            onPointerUp$: createEventSubject(),
            onDblclick$: createEventSubject(),
        };
        const hoverManagerService = {
            triggerMouseMove: vi.fn(),
            triggerPointerDown: vi.fn(),
            triggerPointerUp: vi.fn(),
            triggerClick: vi.fn(),
            triggerDbClick: vi.fn(),
            triggerRowHeaderMouseMove: vi.fn(),
            triggerRowHeaderPoniterDown: vi.fn(),
            triggerRowHeaderPoniterUp: vi.fn(),
            triggerRowHeaderClick: vi.fn(),
            triggerRowHeaderDbClick: vi.fn(),
            triggerColHeaderMouseMove: vi.fn(),
            triggerColHeaderPoniterDown: vi.fn(),
            triggerColHeaderPoniterUp: vi.fn(),
            triggerColHeaderClick: vi.fn(),
            triggerColHeaderDbClick: vi.fn(),
            triggerScroll: vi.fn(),
        };
        const controller = new HoverRenderController(
            {
                unitId: 'unit-1',
                mainComponent,
                components: new Map([
                    [SHEET_VIEW_KEY.ROW, rowHeader],
                    [SHEET_VIEW_KEY.COLUMN, colHeader],
                ]),
            } as never,
            hoverManagerService as never,
            {
                getCurrentParam: vi.fn(() => ({ skeleton: {} })),
                currentSkeleton$,
            } as never,
            { validViewportScrollInfo$ } as never
        );

        mainComponent.onPointerEnter$.emit({});
        expect(controller.active).toBe(true);
        mainComponent.onPointerMove$.emit({ offsetX: 10, offsetY: 20 });
        mainComponent.onPointerDown$.emit({ offsetX: 11, offsetY: 21 });
        mainComponent.onPointerUp$.emit({ offsetX: 12, offsetY: 22 });
        mainComponent.onClick$.emit({ offsetX: 13, offsetY: 23 });
        mainComponent.onDblclick$.emit({ offsetX: 14, offsetY: 24 });
        mainComponent.onPointerLeave$.emit({});
        rowHeader.onPointerUp$.emit({ offsetX: 1, offsetY: 2 });
        colHeader.onDblclick$.emit({ offsetX: 3, offsetY: 4 });
        validViewportScrollInfo$.next();

        expect(controller.active).toBe(false);
        expect(hoverManagerService.triggerMouseMove).toHaveBeenCalledWith('unit-1', { offsetX: 10, offsetY: 20 });
        expect(hoverManagerService.triggerPointerDown).toHaveBeenCalledWith('unit-1', { offsetX: 11, offsetY: 21 });
        expect(hoverManagerService.triggerPointerUp).toHaveBeenCalledWith('unit-1', { offsetX: 12, offsetY: 22 });
        expect(hoverManagerService.triggerClick).toHaveBeenCalledWith('unit-1', 13, 23);
        expect(hoverManagerService.triggerDbClick).toHaveBeenCalledWith('unit-1', 14, 24);
        expect(hoverManagerService.triggerRowHeaderPoniterUp).toHaveBeenCalledWith('unit-1', 1, 2);
        expect(hoverManagerService.triggerRowHeaderClick).toHaveBeenCalledWith('unit-1', 1, 2);
        expect(hoverManagerService.triggerColHeaderDbClick).toHaveBeenCalledWith('unit-1', 3, 4);
        expect(hoverManagerService.triggerScroll).toHaveBeenCalled();

        controller.dispose();
    });
});

describe('MoveRangeRenderController', () => {
    it('executes move range command after dragging a selection to a valid different range', () => {
        const selectionMoveEnd$ = new Subject<void>();
        const controlMoveEnd$ = new Subject<any>();
        const commandService = { executeCommand: vi.fn() };
        const controller = new MoveRangeRenderController(
            {} as never,
            {
                getSelectionControls: vi.fn(() => [{
                    model: {
                        getRange: vi.fn(() => ({
                            startRow: 1,
                            startColumn: 2,
                            endRow: 3,
                            endColumn: 4,
                            rangeType: 0,
                        })),
                    },
                    selectionMoveEnd$: controlMoveEnd$,
                }]),
            } as never,
            { selectionMoveEnd$ } as never,
            commandService as never
        );

        selectionMoveEnd$.next();
        controlMoveEnd$.next({ startRow: 5, startColumn: 6, endRow: 7, endColumn: 8 });
        controlMoveEnd$.next({ startRow: 1, startColumn: 2, endRow: 3, endColumn: 4 });
        controlMoveEnd$.next({ startRow: -1, startColumn: 2, endRow: 3, endColumn: 4 });

        expect(commandService.executeCommand).toHaveBeenCalledTimes(1);
        expect(commandService.executeCommand).toHaveBeenCalledWith(MoveRangeCommand.id, {
            fromRange: {
                startRow: 1,
                startColumn: 2,
                endRow: 3,
                endColumn: 4,
                rangeType: 0,
            },
            toRange: {
                startRow: 5,
                startColumn: 6,
                endRow: 7,
                endColumn: 8,
                rangeType: 0,
            },
        });

        controller.dispose();
    });
});
