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

import type { ICommandService } from '@univerjs/core';
import type { ComponentManager, IMenuManagerService, IShortcutService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { COMPONENT_DOC_DRAWING_PANEL } from '../../views/doc-image-panel/component-name';
import { DocDrawingUIController } from '../doc-drawing.controller';

describe('DocDrawingUIController', () => {
    it('registers drawing commands, sidebar component, menus, and shortcuts', () => {
        const register = vi.fn(() => ({ dispose: vi.fn() }));
        const mergeMenu = vi.fn();
        const registerCommand = vi.fn(() => ({ dispose: vi.fn() }));
        const registerShortcut = vi.fn(() => ({ dispose: vi.fn() }));

        const controller = new DocDrawingUIController(
            { register } as unknown as ComponentManager,
            { mergeMenu } as unknown as IMenuManagerService,
            { registerCommand } as unknown as ICommandService,
            { registerShortcut } as unknown as IShortcutService
        );

        expect(controller).toBeTruthy();
        expect(registerCommand).toHaveBeenCalledTimes(17);
        expect(register).toHaveBeenCalledWith(COMPONENT_DOC_DRAWING_PANEL, expect.any(Function));
        expect(mergeMenu).toHaveBeenCalledTimes(1);
        expect(registerShortcut).toHaveBeenCalledTimes(5);
    });
});
