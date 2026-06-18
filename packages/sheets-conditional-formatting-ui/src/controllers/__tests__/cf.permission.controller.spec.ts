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

import { AddCfCommand } from '@univerjs/sheets-conditional-formatting';
import { describe, expect, it, vi } from 'vitest';
import { ConditionalFormattingPermissionController } from '../cf.permission.controller';

describe('ConditionalFormattingPermissionController', () => {
    it('blocks adding conditional formatting when target ranges cannot edit cell style', () => {
        let beforeCommandHandler: ((command: { id: string; params?: unknown }) => void) | undefined;
        const permissionCheck = {
            permissionCheckWithRanges: vi.fn(() => false),
            blockExecuteWithoutPermission: vi.fn(),
        };
        const controller = new ConditionalFormattingPermissionController(
            { t: (key: string) => key } as never,
            {
                beforeCommandExecuted: vi.fn((handler) => {
                    beforeCommandHandler = handler;
                    return { dispose: vi.fn() };
                }),
            } as never,
            permissionCheck as never
        );
        const ranges = [{ startRow: 1, endRow: 2, startColumn: 3, endColumn: 4 }];

        beforeCommandHandler?.({
            id: AddCfCommand.id,
            params: {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                rule: { ranges },
            },
        });

        expect(permissionCheck.permissionCheckWithRanges).toHaveBeenCalledWith(expect.objectContaining({
            workbookTypes: expect.any(Array),
            worksheetTypes: expect.any(Array),
            rangeTypes: expect.any(Array),
        }), ranges, 'unit-1', 'sheet-1');
        expect(permissionCheck.blockExecuteWithoutPermission).toHaveBeenCalledWith('sheets-conditional-formatting-ui.permission.dialog.setStyleErr');

        controller.dispose();
    });
});
