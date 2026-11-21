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

// @vitest-environment jsdom

import {
    CommandService,
    CommandType,
    ConfigService,
    ContextService,
    DesktopLogService,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
} from '@univerjs/core';
import { expect, it, vi } from 'vitest';
import { IPlatformService, PlatformService } from '../../platform/platform.service';
import { IUIRuntimeScopeService, UIRuntimeScopeService } from '../../runtime-scope/ui-runtime-scope.service';
import { KeyCode, MetaKeys } from '../../shortcut/keycode';
import { IShortcutService, ShortcutService } from '../../shortcut/shortcut.service';
import { ContextMenuShortcutService } from '../contextmenu-shortcut.service';
import { ContextMenuService, IContextMenuService } from '../contextmenu.service';

it('opens only for the focused surface and preserves higher-priority shortcuts and shortcut suspension', () => {
    const injector = new Injector([
        [ICommandService, { useClass: CommandService }],
        [IConfigService, { useClass: ConfigService }],
        [IContextService, { useClass: ContextService }],
        [ILogService, { useClass: DesktopLogService }],
        [IPlatformService, { useClass: PlatformService }],
        [IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }],
        [IShortcutService, { useClass: ShortcutService }],
        [IContextMenuService, { useClass: ContextMenuService }],
        [ContextMenuShortcutService],
    ]);
    const canvas = document.body.appendChild(document.createElement('canvas'));
    canvas.tabIndex = 0;
    const input = document.body.appendChild(document.createElement('input'));
    const press = (key: string, keyCode: number, shiftKey = false) =>
        document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key, keyCode, shiftKey, bubbles: true, cancelable: true }));

    try {
        const shortcut = injector.get(IShortcutService);
        const contextMenu = injector.get(ContextMenuShortcutService);
        const openMenu = vi.fn(() => true);
        const registration = contextMenu.register((target) => target === canvas ? openMenu : undefined);

        input.focus();
        expect(press('F10', KeyCode.F10, true)).toBe(true);
        expect(openMenu).not.toHaveBeenCalled();

        canvas.focus();
        expect(press('F10', KeyCode.F10, true)).toBe(false);
        expect(press('F10', KeyCode.F10)).toBe(true);
        expect(openMenu).toHaveBeenCalledOnce();

        const openObjectMenu = vi.fn(() => true);
        const id = 'test.operation.open-object-menu';
        injector.get(ICommandService).registerCommand({ id, type: CommandType.OPERATION, handler: openObjectMenu });
        const objectShortcut = shortcut.registerShortcut({ id, binding: KeyCode.F10 | MetaKeys.SHIFT, priority: 1000 });
        expect(press('F10', KeyCode.F10, true)).toBe(false);
        expect(openObjectMenu).toHaveBeenCalledOnce();
        expect(openMenu).toHaveBeenCalledOnce();
        objectShortcut.dispose();

        const suspension = shortcut.forceDisable();
        expect(press('F10', KeyCode.F10, true)).toBe(true);
        expect(openMenu).toHaveBeenCalledOnce();
        suspension.dispose();

        const menuService = injector.get(IContextMenuService);
        menuService.disable();
        expect(press('F10', KeyCode.F10, true)).toBe(true);
        expect(openMenu).toHaveBeenCalledOnce();
        menuService.enable();

        const openTableCell = vi.fn(() => true);
        const table = contextMenu.register((target) => target === canvas ? openTableCell : undefined, 100);
        press('F10', KeyCode.F10, true);
        expect(openTableCell).toHaveBeenCalledOnce();
        expect(openMenu).toHaveBeenCalledOnce();
        table.dispose();

        const field = document.createElement('label');
        field.setAttribute('data-u-context-menu-trigger', '');
        input.before(field);
        field.appendChild(input);
        const openFieldMenu = vi.fn((event: MouseEvent) => event.preventDefault());
        field.addEventListener('contextmenu', openFieldMenu);
        input.focus();
        expect(press('F10', KeyCode.F10, true)).toBe(true);
        input.type = 'checkbox';
        expect(press('F10', KeyCode.F10, true)).toBe(false);
        expect(openFieldMenu).toHaveBeenCalledOnce();
        field.replaceWith(input);
        canvas.focus();

        registration.dispose();
        expect(press('F10', KeyCode.F10, true)).toBe(true);
    } finally {
        canvas.remove();
        input.remove();
        injector.dispose();
    }
});
