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

import type { IAccessor } from '@univerjs/core';
import { ICommandService, IContextService, IUniverInstanceService } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { IRefSelectionsService } from '../../../services/selections/ref-selections.service';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { SelectRangeCommand, SetSelectionsOperation } from '../selection.operation';

function createAccessor(values: Map<unknown, unknown>): IAccessor {
    return {
        get: (token: unknown) => values.get(token) as never,
        has: () => true,
    } as unknown as IAccessor;
}

describe('selection.operation', () => {
    it('SetSelectionsOperation returns false without params', () => {
        const accessor = createAccessor(new Map());
        expect(SetSelectionsOperation.handler(accessor, undefined as never)).toBe(false);
    });

    it('SetSelectionsOperation sets selection with copied array', () => {
        const selectionService = {
            setSelections: vi.fn(),
        };
        const contextService = {
            getContextValue: vi.fn(() => false),
        };
        const accessor = createAccessor(
            new Map<unknown, unknown>([
                [IContextService, contextService],
                [SheetsSelectionsService, selectionService],
            ])
        );
        const selections = [
            {
                range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                primary: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0, actualRow: 0, actualColumn: 0, isMerged: false, isMergedMainCell: false },
                style: null,
            },
        ];

        expect(
            SetSelectionsOperation.handler(accessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                selections,
            })
        ).toBe(true);

        expect(selectionService.setSelections).toHaveBeenCalledTimes(1);
        const callArgs = selectionService.setSelections.mock.calls[0];
        expect(callArgs[0]).toBe('unit-1');
        expect(callArgs[1]).toBe('sheet-1');
        expect(callArgs[2]).toEqual(selections);
        expect(callArgs[2]).not.toBe(selections);
    });

    it('SetSelectionsOperation uses ref selection service in ref mode', () => {
        const refSelectionService = {
            setSelections: vi.fn(),
        };
        const contextService = {
            getContextValue: vi.fn(() => true),
        };
        const accessor = createAccessor(
            new Map<unknown, unknown>([
                [IContextService, contextService],
                [IRefSelectionsService, refSelectionService],
            ])
        );

        expect(
            SetSelectionsOperation.handler(accessor, {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                selections: [],
            })
        ).toBe(true);
        expect(refSelectionService.setSelections).toHaveBeenCalledWith('unit-1', 'sheet-1', [], undefined);
    });

    it('SelectRangeCommand returns false without params or target', () => {
        const commandService = {
            syncExecuteCommand: vi.fn(),
        };
        const accessorWithoutParams = createAccessor(
            new Map<unknown, unknown>([
                [ICommandService, commandService],
            ])
        );
        expect(SelectRangeCommand.handler(accessorWithoutParams, undefined as never)).toBe(false);

        const instanceService = {
            getCurrentUnitOfType: vi.fn(() => null),
            getUnit: vi.fn(() => null),
        };
        const accessorWithoutTarget = createAccessor(
            new Map<unknown, unknown>([
                [ICommandService, commandService],
                [IUniverInstanceService, instanceService],
            ])
        );
        expect(
            SelectRangeCommand.handler(accessorWithoutTarget, {
                unitId: 'unit-1',
                subUnit: 'sheet-1',
                range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            })
        ).toBe(false);
    });

    it('SelectRangeCommand dispatches SetSelectionsOperation', () => {
        const commandService = {
            syncExecuteCommand: vi.fn(() => true),
        };
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getMergedCell: () => null,
        };
        const workbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: () => worksheet,
        };
        const instanceService = {
            getCurrentUnitOfType: () => workbook,
            getUnit: () => workbook,
        };
        const accessor = createAccessor(
            new Map<unknown, unknown>([
                [ICommandService, commandService],
                [IUniverInstanceService, instanceService],
            ])
        );

        expect(
            SelectRangeCommand.handler(accessor, {
                unitId: 'unit-1',
                subUnit: 'sheet-1',
                range: { startRow: 2, endRow: 4, startColumn: 3, endColumn: 5 },
            })
        ).toBe(true);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledTimes(1);

        const [commandId, params] = commandService.syncExecuteCommand.mock.calls[0] as unknown as [string, {
            unitId: string;
            subUnitId: string;
            selections: Array<{
                range: { startRow: number; endRow: number; startColumn: number; endColumn: number };
                primary: {
                    startRow: number;
                    endRow: number;
                    startColumn: number;
                    endColumn: number;
                    actualRow: number;
                    actualColumn: number;
                    rangeType: number;
                    isMerged: boolean;
                    isMergedMainCell: boolean;
                };
            }>;
        }];
        expect(commandId).toBe(SetSelectionsOperation.id);
        expect(params.unitId).toBe('unit-1');
        expect(params.subUnitId).toBe('sheet-1');
        expect(params.selections[0].range).toEqual({ startRow: 2, endRow: 4, startColumn: 3, endColumn: 5 });
        expect(params.selections[0].primary).toEqual({
            startRow: 2,
            endRow: 2,
            startColumn: 3,
            endColumn: 3,
            actualRow: 2,
            actualColumn: 3,
            rangeType: 0,
            isMerged: false,
            isMergedMainCell: false,
        });
    });
});
