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

import type { ISelectionWithStyle } from '@univerjs/sheets';
import { ICommandService, RANGE_TYPE } from '@univerjs/core';
import { SelectionMoveType, SheetsSelectionsService } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { MoveRangeConfirmCommand } from '../../commands/commands/move-range-confirm.command';
import { ISheetSelectionRenderService } from '../../services/selection/base-selection-render.service';
import { MoveRangeRenderController } from '../move-range.controller';
import { createRenderTestBed } from '../render-controllers/__tests__/render-test-bed';

describe('MoveRangeRenderController', () => {
    it('executes the confirmation command after dragging a selection to a valid different range', () => {
        const controlMoveEnd$ = new Subject<{ startRow: number; startColumn: number; endRow: number; endColumn: number }>();
        const testBed = createRenderTestBed({
            dependencies: [
                [ISheetSelectionRenderService, {
                    useValue: {
                        getSelectionControls: () => [{
                            model: {
                                getRange: () => ({
                                    startRow: 1,
                                    startColumn: 2,
                                    endRow: 3,
                                    endColumn: 4,
                                    rangeType: RANGE_TYPE.NORMAL,
                                }),
                            },
                            selectionMoveEnd$: controlMoveEnd$,
                        }],
                    },
                }],
            ],
        });
        const commandService = testBed.injector.get(ICommandService);
        const executeCommand = vi.spyOn(commandService, 'executeCommand').mockResolvedValue(true);
        const controller = testBed.injector.createInstance(MoveRangeRenderController, testBed.context);
        const selectionManagerService = testBed.injector.get(SheetsSelectionsService);
        const selection: ISelectionWithStyle = {
            range: {
                startRow: 1,
                startColumn: 2,
                endRow: 3,
                endColumn: 4,
                rangeType: RANGE_TYPE.NORMAL,
            },
            primary: null,
            style: null,
        };

        selectionManagerService.setSelections([selection], SelectionMoveType.MOVE_END);
        controlMoveEnd$.next({ startRow: 5, startColumn: 6, endRow: 7, endColumn: 8 });
        controlMoveEnd$.next({ startRow: 1, startColumn: 2, endRow: 3, endColumn: 4 });
        controlMoveEnd$.next({ startRow: -1, startColumn: 2, endRow: 3, endColumn: 4 });

        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(MoveRangeConfirmCommand.id, {
            fromRange: {
                startRow: 1,
                startColumn: 2,
                endRow: 3,
                endColumn: 4,
                rangeType: RANGE_TYPE.NORMAL,
            },
            toRange: {
                startRow: 5,
                startColumn: 6,
                endRow: 7,
                endColumn: 8,
                rangeType: RANGE_TYPE.NORMAL,
            },
        });

        controller.dispose();
        testBed.univer.dispose();
    });
});
