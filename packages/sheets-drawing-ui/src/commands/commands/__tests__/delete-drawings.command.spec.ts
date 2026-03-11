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
import { ICommandService } from '@univerjs/core';
import { ISheetDrawingService } from '@univerjs/sheets-drawing';
import { describe, expect, it, vi } from 'vitest';
import { DeleteDrawingsCommand } from '../delete-drawings.command';
import { RemoveSheetDrawingCommand } from '../remove-sheet-drawing.command';

describe('DeleteDrawingsCommand', () => {
    it('forwards focused drawings to the remove command', async () => {
        const commandService = { executeCommand: vi.fn(() => true) };
        const drawingManagerService = {
            getFocusDrawings: vi.fn(() => [
                { unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'drawing-1', drawingType: 'image' },
            ]),
        };
        const accessor = {
            get(token: unknown) {
                if (token === ICommandService) return commandService;
                if (token === ISheetDrawingService) return drawingManagerService;
                throw new Error(`Unknown dependency: ${String(token)}`);
            },
        } as IAccessor;

        expect(await DeleteDrawingsCommand.handler(accessor)).toBe(true);
        expect(commandService.executeCommand).toHaveBeenCalledWith(RemoveSheetDrawingCommand.id, {
            unitId: 'book-1',
            drawings: [{ unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'drawing-1', drawingType: 'image' }],
        });
    });

    it('returns false when nothing is focused', async () => {
        const accessor = {
            get(token: unknown) {
                if (token === ICommandService) return { executeCommand: vi.fn() };
                if (token === ISheetDrawingService) return { getFocusDrawings: () => [] };
                throw new Error(`Unknown dependency: ${String(token)}`);
            },
        } as IAccessor;

        expect(await DeleteDrawingsCommand.handler(accessor)).toBe(false);
    });
});
