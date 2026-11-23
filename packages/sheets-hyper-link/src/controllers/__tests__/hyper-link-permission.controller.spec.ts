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
import { AddHyperLinkCommand } from '../../commands/commands/add-hyper-link.command';
import { CancelHyperLinkCommand } from '../../commands/commands/remove-hyper-link.command';
import { SheetsHyperLinkPermissionController } from '../hyper-link-permission.controller';

describe('SheetsHyperLinkPermissionController', () => {
    it('checks insert permission for adding, updating and cancelling hyperlinks', () => {
        let beforeCommandExecuted: ((command: { id: string; params?: unknown }) => void) | undefined;
        const blockExecuteWithoutPermission = vi.fn();
        const permissionCheckWithRanges = vi.fn((_types: unknown) => false);

        const controller = new SheetsHyperLinkPermissionController(
            { t: (key: string) => key } as never,
            {
                beforeCommandExecuted: vi.fn((handler) => {
                    beforeCommandExecuted = handler;
                    return { dispose: vi.fn() };
                }),
            } as never,
            { permissionCheckWithRanges, blockExecuteWithoutPermission } as never
        );

        beforeCommandExecuted?.({
            id: AddHyperLinkCommand.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', link: { row: 0, column: 0 } },
        });
        beforeCommandExecuted?.({
            id: CancelHyperLinkCommand.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 0, column: 0, id: 'link-1' },
        });

        expect(permissionCheckWithRanges).toHaveBeenNthCalledWith(1, expect.objectContaining({
            worksheetTypes: expect.any(Array),
        }), [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }], 'unit-1', 'sheet-1');
        expect(permissionCheckWithRanges).toHaveBeenNthCalledWith(2, expect.objectContaining({
            worksheetTypes: expect.any(Array),
        }), [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }], 'unit-1', 'sheet-1');
        const firstTypes = (permissionCheckWithRanges.mock.calls[0][0] as { worksheetTypes: unknown[] }).worksheetTypes;
        const secondTypes = (permissionCheckWithRanges.mock.calls[1][0] as { worksheetTypes: unknown[] }).worksheetTypes;
        expect(firstTypes).toHaveLength(3);
        expect(secondTypes).toHaveLength(3);
        expect(blockExecuteWithoutPermission).toHaveBeenCalledTimes(2);
        expect(blockExecuteWithoutPermission).toHaveBeenCalledWith('sheets-hyper-link.permission.editErr');

        controller.dispose();
    });
});
