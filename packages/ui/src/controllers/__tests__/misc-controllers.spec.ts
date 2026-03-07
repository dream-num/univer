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

import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ToggleShortcutPanelOperation } from '../../commands/operations/toggle-shortcut-panel.operation';
import { RibbonStartGroup } from '../../services/menu/types';
import { ErrorController } from '../error/error.controller';
import { menuSchema } from '../menus/menu.schema';
import { ShortcutPanelMenuItemFactory } from '../shortcut-display/menu';
import { ShortcutPanelController } from '../shortcut-display/shortcut-panel.controller';
import { IUIController } from '../ui/ui.controller';

describe('ErrorController', () => {
    it('should forward errors to message service', () => {
        const error$ = new Subject<{ errorKey: string }>();
        const errorService = {
            error$,
        };
        const messageService = {
            show: vi.fn(),
        };

        const controller = new ErrorController(errorService as any, messageService as any);
        error$.next({ errorKey: 'boom' });

        expect(messageService.show).toHaveBeenCalledWith(
            expect.objectContaining({
                content: 'boom',
            })
        );

        controller.dispose();
    });
});

describe('shortcut-display controllers', () => {
    it('should return shortcut panel menu item', () => {
        expect(ShortcutPanelMenuItemFactory()).toEqual({
            id: ToggleShortcutPanelOperation.id,
            title: 'toggle-shortcut-panel',
            tooltip: 'toggle-shortcut-panel',
            icon: 'ShortcutIcon',
            type: 0,
        });
    });

    it('should register panel component, command and shortcut', () => {
        const componentManager = {
            register: vi.fn(() => ({ dispose: vi.fn() })),
        };
        const shortcutService = {
            registerShortcut: vi.fn(() => ({ dispose: vi.fn() })),
        };
        const commandService = {
            registerCommand: vi.fn(() => ({ dispose: vi.fn() })),
        };

        const controller = new ShortcutPanelController(
            {} as any,
            componentManager as any,
            shortcutService as any,
            {} as any,
            commandService as any
        );

        expect(componentManager.register).toHaveBeenCalledTimes(1);
        expect(commandService.registerCommand).toHaveBeenCalledWith(ToggleShortcutPanelOperation);
        expect(shortcutService.registerShortcut).toHaveBeenCalledTimes(1);

        controller.dispose();
    });
});

describe('menu schema and ui token', () => {
    it('should expose static menu schema entries', () => {
        const groupedSchema = menuSchema as Record<RibbonStartGroup.HISTORY | RibbonStartGroup.OTHERS, Record<string, unknown>>;
        const history = groupedSchema[RibbonStartGroup.HISTORY];
        const others = groupedSchema[RibbonStartGroup.OTHERS];

        expect(history).toBeDefined();
        expect(others).toBeDefined();
        expect(Object.keys(history).length).toBeGreaterThanOrEqual(2);
        expect(Object.keys(others).length).toBeGreaterThanOrEqual(1);
    });

    it('should expose ui controller identifier', () => {
        expect(IUIController).toBeDefined();
    });
});
