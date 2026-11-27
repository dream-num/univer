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

import { describe, expect, it, vi } from 'vitest';
import {
    AddSheetDataValidationCommand,
    ClearRangeDataValidationCommand,
    RemoveSheetAllDataValidationCommand,
    RemoveSheetDataValidationCommand,
    UpdateSheetDataValidationOptionsCommand,
    UpdateSheetDataValidationRangeCommand,
    UpdateSheetDataValidationSettingCommand,
} from '../../commands/commands/data-validation.command';
import { DataValidationPermissionController } from '../dv-permission.controller';

describe('DataValidationPermissionController', () => {
    it('blocks add, update and delete commands when range permissions fail', () => {
        let beforeCommandExecutedHandler: ((command: { id: string; params: unknown }) => void) | undefined;
        const permissionCheckWithRanges = vi.fn().mockReturnValue(false);
        const blockExecuteWithoutPermission = vi.fn();
        const rule = { ranges: [{ startRow: 4, endRow: 7, startColumn: 0, endColumn: 1 }] };

        const controller = new DataValidationPermissionController(
            { t: (key: string) => key } as never,
            {
                beforeCommandExecuted: vi.fn((handler) => {
                    beforeCommandExecutedHandler = handler;
                    return { dispose: vi.fn() };
                }),
            } as never,
            { permissionCheckWithRanges, blockExecuteWithoutPermission } as never,
            {
                getRuleById: vi.fn(() => rule),
                getRules: vi.fn(() => [rule]),
                getRuleObjectMatrix: vi.fn(() => ({
                    clone: () => ({
                        addRule: vi.fn(),
                        updateRange: vi.fn(),
                        diff: () => [{
                            type: 'update',
                            oldRanges: rule.ranges,
                            newRanges: rule.ranges,
                        }],
                    }),
                })),
            } as never
        );

        expect(controller).toBeTruthy();
        beforeCommandExecutedHandler!({
            id: AddSheetDataValidationCommand.id,
            params: {
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                rule: { ranges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }] },
            },
        });
        beforeCommandExecutedHandler!({
            id: UpdateSheetDataValidationRangeCommand.id,
            params: {
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                ruleId: 'rule-1',
                ranges: [{ startRow: 2, endRow: 3, startColumn: 0, endColumn: 1 }],
            },
        });
        beforeCommandExecutedHandler!({
            id: UpdateSheetDataValidationSettingCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', ruleId: 'rule-1', setting: { type: 'list' } },
        });
        beforeCommandExecutedHandler!({
            id: UpdateSheetDataValidationOptionsCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', ruleId: 'rule-1', options: {} },
        });
        beforeCommandExecutedHandler!({
            id: ClearRangeDataValidationCommand.id,
            params: {
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                ranges: [{ startRow: 6, endRow: 7, startColumn: 0, endColumn: 1 }],
            },
        });
        beforeCommandExecutedHandler!({
            id: RemoveSheetDataValidationCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1', ruleId: 'rule-1' },
        });
        beforeCommandExecutedHandler!({
            id: RemoveSheetAllDataValidationCommand.id,
            params: { unitId: 'book-1', subUnitId: 'sheet-1' },
        });

        expect(permissionCheckWithRanges).toHaveBeenCalledTimes(7);
        expect(permissionCheckWithRanges.mock.calls[0][1]).toEqual(expect.arrayContaining([
            { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
        ]));
        expect(blockExecuteWithoutPermission).toHaveBeenCalledTimes(7);
        expect(blockExecuteWithoutPermission).toHaveBeenCalledWith('sheets-data-validation.permission.dialog.setStyleErr');
    });
});
