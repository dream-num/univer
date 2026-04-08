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

import type { IAccessor, IDrawingSearch } from '@univerjs/core';
import { ICommandService } from '@univerjs/core';
import { SetDrawingSelectedOperation } from '@univerjs/drawing';
import { describe, expect, it, vi } from 'vitest';
import { EditSheetDrawingOperation } from '../edit-sheet-drawing.operation';
import { SidebarSheetDrawingOperation } from '../open-drawing-panel.operation';

describe('EditSheetDrawingOperation', () => {
    it('returns false when there is no selected drawing', () => {
        const commandService = {
            syncExecuteCommand: vi.fn(),
            executeCommand: vi.fn(),
        };
        const accessor = {
            get(token: unknown) {
                if (token === ICommandService) {
                    return commandService;
                }

                throw new Error(`Unknown dependency: ${String(token)}`);
            },
        } as IAccessor;

        expect(EditSheetDrawingOperation.handler(accessor, null as never)).toBe(false);
        expect(commandService.syncExecuteCommand).not.toHaveBeenCalled();
        expect(commandService.executeCommand).not.toHaveBeenCalled();
    });

    it('selects the drawing and opens the sheet sidebar editor', () => {
        const commandService = {
            syncExecuteCommand: vi.fn(() => true),
            executeCommand: vi.fn(),
        };
        const accessor = {
            get(token: unknown) {
                if (token === ICommandService) {
                    return commandService;
                }

                throw new Error(`Unknown dependency: ${String(token)}`);
            },
        } as IAccessor;
        const drawing: IDrawingSearch = {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            drawingId: 'drawing-1',
        };

        expect(EditSheetDrawingOperation.handler(accessor, drawing)).toBe(true);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(SetDrawingSelectedOperation.id, [drawing]);
        expect(commandService.executeCommand).toHaveBeenCalledWith(SidebarSheetDrawingOperation.id, { value: 'open' });
    });
});
