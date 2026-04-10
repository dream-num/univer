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

import { SheetsHyperLinkUIController } from '../ui.controller';

describe('SheetsHyperLinkUIController', () => {
    it('should register components, commands, menu and shortcut', () => {
        const componentManager = { register: vi.fn() } as any;
        const commandService = { registerCommand: vi.fn() } as any;
        const menuManagerService = { mergeMenu: vi.fn() } as any;
        const injector = {} as any;
        const shortcutService = { registerShortcut: vi.fn() } as any;

        const controller = new SheetsHyperLinkUIController(
            componentManager,
            commandService,
            menuManagerService,
            injector,
            shortcutService
        );

        expect(componentManager.register).toHaveBeenCalled();
        expect(commandService.registerCommand).toHaveBeenCalled();
        expect(menuManagerService.mergeMenu).toHaveBeenCalled();
        expect(shortcutService.registerShortcut).toHaveBeenCalled();

        controller.dispose();
    });
});
