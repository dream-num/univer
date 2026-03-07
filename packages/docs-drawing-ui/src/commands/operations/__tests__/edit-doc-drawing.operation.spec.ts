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
import { IDrawingManagerService } from '@univerjs/drawing';
import { describe, expect, it, vi } from 'vitest';
import { EditDocDrawingOperation } from '../edit-doc-drawing.operation';
import { SidebarDocDrawingOperation } from '../open-drawing-panel.operation';

describe('EditDocDrawingOperation', () => {
    it('returns false when no drawing is provided', () => {
        const drawingManagerService = {
            focusDrawing: vi.fn(),
        };
        const commandService = {
            executeCommand: vi.fn(),
        };
        const accessor = {
            get(token: unknown) {
                if (token === IDrawingManagerService) {
                    return drawingManagerService;
                }

                if (token === ICommandService) {
                    return commandService;
                }

                throw new Error('Unknown dependency');
            },
        } as IAccessor;

        expect(EditDocDrawingOperation.handler(accessor, null as unknown as IDrawingSearch)).toBe(false);
        expect(drawingManagerService.focusDrawing).not.toHaveBeenCalled();
        expect(commandService.executeCommand).not.toHaveBeenCalled();
    });

    it('focuses the drawing and opens the sidebar when a drawing is provided', () => {
        const drawingManagerService = {
            focusDrawing: vi.fn(),
        };
        const commandService = {
            executeCommand: vi.fn(),
        };
        const accessor = {
            get(token: unknown) {
                if (token === IDrawingManagerService) {
                    return drawingManagerService;
                }

                if (token === ICommandService) {
                    return commandService;
                }

                throw new Error('Unknown dependency');
            },
        } as IAccessor;
        const params: IDrawingSearch = {
            unitId: 'unit-1',
            subUnitId: 'doc-1',
            drawingId: 'drawing-1',
        };

        expect(EditDocDrawingOperation.handler(accessor, params)).toBe(true);
        expect(drawingManagerService.focusDrawing).toHaveBeenCalledWith([params]);
        expect(commandService.executeCommand).toHaveBeenCalledWith(SidebarDocDrawingOperation.id, { value: 'open' });
    });
});
