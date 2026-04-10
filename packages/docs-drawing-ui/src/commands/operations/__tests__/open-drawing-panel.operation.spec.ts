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
import { LocaleService } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { ISidebarService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { COMPONENT_DOC_DRAWING_PANEL } from '../../../views/doc-image-panel/component-name';
import { SidebarDocDrawingOperation } from '../open-drawing-panel.operation';

function createAccessor() {
    const sidebarService = { open: vi.fn(), close: vi.fn() };
    const drawingManagerService = { focusDrawing: vi.fn() };
    const accessor = {
        get(token: unknown) {
            if (token === ISidebarService) {
                return sidebarService;
            }

            if (token === LocaleService) {
                return { t: (key: string) => key };
            }

            if (token === IDrawingManagerService) {
                return drawingManagerService;
            }

            throw new Error(`Unknown dependency: ${String(token)}`);
        },
    } as IAccessor;

    return { accessor, sidebarService, drawingManagerService };
}

describe('SidebarDocDrawingOperation', () => {
    it('opens the doc drawing sidebar and clears focus when closed', async () => {
        const { accessor, sidebarService, drawingManagerService } = createAccessor();
        await expect(SidebarDocDrawingOperation.handler(accessor, { value: 'open' })).resolves.toBe(true);
        expect(sidebarService.open).toHaveBeenCalledWith(expect.objectContaining({
            header: { title: 'docImage.panel.title' },
            children: { label: COMPONENT_DOC_DRAWING_PANEL },
            width: 360,
        }));
        const onClose = sidebarService.open.mock.calls[0][0].onClose;
        onClose();
        expect(drawingManagerService.focusDrawing).toHaveBeenCalledWith(null);
    });

    it('closes the sidebar for close and default actions', async () => {
        const { accessor, sidebarService } = createAccessor();
        await expect(SidebarDocDrawingOperation.handler(accessor, { value: 'close' })).resolves.toBe(true);
        await expect(SidebarDocDrawingOperation.handler(accessor, { value: 'anything-else' })).resolves.toBe(true);
        expect(sidebarService.close).toHaveBeenCalledTimes(2);
    });
});
