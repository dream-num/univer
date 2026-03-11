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
import type { ComponentManager } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { COMPONENT_IMAGE_POPUP_MENU } from '../../views/image-popup-menu/component-name';
import { DrawingUIController } from '../drawing-ui.controller';

describe('DrawingUIController', () => {
    it('registers popup components and drawing operations', () => {
        const register = vi.fn(() => ({ dispose: vi.fn() }));
        const registerCommand = vi.fn(() => ({ dispose: vi.fn() }));

        const controller = new DrawingUIController(
            { register } as unknown as ComponentManager,
            { registerCommand } as unknown as ICommandService
        );

        expect(controller).toBeTruthy();
        expect(registerCommand).toHaveBeenCalledTimes(5);
        expect(register).toHaveBeenCalledWith(COMPONENT_IMAGE_POPUP_MENU, expect.any(Function));
    });
});
