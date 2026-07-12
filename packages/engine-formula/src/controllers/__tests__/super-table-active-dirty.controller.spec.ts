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

import type { IDirtyConversionManagerParams } from '../../services/active-dirty-manager.service';
import { describe, expect, it, vi } from 'vitest';
import { RemoveSuperTableMutation, SetSuperTableMutation } from '../../commands/mutations/set-super-table.mutation';
import { SuperTableActiveDirtyController } from '../super-table-active-dirty.controller';

describe('SuperTableActiveDirtyController', () => {
    it('invalidates both the old and new table name when a registration changes', () => {
        const conversions = new Map<string, IDirtyConversionManagerParams>();
        const activeDirtyManagerService = {
            register: vi.fn((id: string, conversion: IDirtyConversionManagerParams) => conversions.set(id, conversion)),
            remove: vi.fn((id: string) => conversions.delete(id)),
        };
        const controller = new SuperTableActiveDirtyController(activeDirtyManagerService as never);

        const dirtyData = conversions.get(SetSuperTableMutation.id)?.getDirtyData({
            id: SetSuperTableMutation.id,
            params: {
                unitId: 'base-1',
                tableName: 'Costs',
                oldTableName: 'Pricing',
                reference: {
                    sheetId: 'table-1',
                    range: { startRow: 0, startColumn: 0, endRow: 9, endColumn: 2 },
                },
            },
        });

        expect(dirtyData).toEqual({
            dirtyRanges: [{
                unitId: 'base-1',
                sheetId: 'table-1',
                range: { startRow: 0, startColumn: 0, endRow: 9, endColumn: 2 },
            }],
            dirtySuperTableMap: { 'base-1': { Costs: '1', Pricing: '1' } },
            clearDependencyTreeCache: { 'base-1': { 'table-1': '1' } },
        });

        expect(conversions.get(RemoveSuperTableMutation.id)?.getDirtyData({
            id: RemoveSuperTableMutation.id,
            params: {
                unitId: 'base-1',
                tableName: 'Pricing',
                reference: {
                    sheetId: 'table-1',
                    range: { startRow: 0, startColumn: 0, endRow: 9, endColumn: 2 },
                },
            },
        })).toEqual({
            dirtyRanges: [{
                unitId: 'base-1',
                sheetId: 'table-1',
                range: { startRow: 0, startColumn: 0, endRow: 9, endColumn: 2 },
            }],
            dirtySuperTableMap: { 'base-1': { Pricing: '1' } },
            clearDependencyTreeCache: { 'base-1': { 'table-1': '1' } },
        });

        controller.dispose();
        expect(conversions.size).toBe(0);
    });
});
