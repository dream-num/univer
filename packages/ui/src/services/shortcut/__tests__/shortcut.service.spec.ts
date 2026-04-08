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

import type { IContextService } from '@univerjs/core';
import type { ILayoutService } from '../../layout/layout.service';
import { describe, expect, it, vi } from 'vitest';
import { KeyCode, MetaKeys } from '../keycode';
import { ShortcutService } from '../shortcut.service';

function createKeyboardEvent(
    keyCode: number,
    options?: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean }
): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        ctrlKey: options?.ctrlKey,
        metaKey: options?.metaKey,
        shiftKey: options?.shiftKey,
        altKey: options?.altKey,
    });

    Object.defineProperty(event, 'keyCode', {
        configurable: true,
        get: () => keyCode,
    });

    return event;
}

function createService(options?: {
    isMac?: boolean;
    isWindows?: boolean;
    isLinux?: boolean;
    layoutAllowed?: boolean;
}) {
    const executeCommand = vi.fn();
    const commandService = { executeCommand };
    const platformService = {
        isMac: options?.isMac ?? false,
        isWindows: options?.isWindows ?? true,
        isLinux: options?.isLinux ?? false,
    };
    const contextService = {} as IContextService;
    const layoutService = options?.layoutAllowed === undefined
        ? undefined
        : ({
            checkElementInCurrentContainers: vi.fn(() => options.layoutAllowed),
        } as unknown as ILayoutService);

    const service = new ShortcutService(commandService as any, platformService as any, contextService, layoutService);

    return { service, executeCommand, layoutService };
}

describe('ShortcutService', () => {
    it('should register and unregister shortcuts', () => {
        const { service } = createService();
        const changed = vi.fn();
        const sub = service.shortcutChanged$.subscribe(changed);

        const disposable = service.registerShortcut({
            id: 'cmd.save',
            binding: KeyCode.S | MetaKeys.CTRL_COMMAND,
        });

        expect(service.getAllShortcuts()).toHaveLength(1);
        expect(changed).toHaveBeenCalledTimes(1);

        disposable.dispose();
        expect(service.getAllShortcuts()).toHaveLength(0);
        expect(changed).toHaveBeenCalledTimes(2);

        sub.unsubscribe();
        service.dispose();
    });

    it('should ignore invalid shortcuts without binding', () => {
        const { service } = createService();

        service.registerShortcut({
            id: 'cmd.invalid',
        });

        expect(service.getAllShortcuts()).toHaveLength(0);
        service.dispose();
    });

    it('should resolve candidate by priority and preconditions', () => {
        const { service } = createService();
        const low = {
            id: 'cmd.low',
            binding: KeyCode.A | MetaKeys.CTRL_COMMAND,
            priority: 1,
        };
        const highBlocked = {
            id: 'cmd.blocked',
            binding: KeyCode.A | MetaKeys.CTRL_COMMAND,
            priority: 10,
            preconditions: () => false,
        };
        const highAllowed = {
            id: 'cmd.high',
            binding: KeyCode.A | MetaKeys.CTRL_COMMAND,
            priority: 9,
            preconditions: () => true,
        };

        service.registerShortcut(low);
        service.registerShortcut(highBlocked);
        service.registerShortcut(highAllowed);

        const event = createKeyboardEvent(KeyCode.A, { ctrlKey: true });
        const candidate = service.dispatch(event);

        expect(candidate?.id).toBe('cmd.high');
        service.dispose();
    });

    it('should ignore dispatch when escaped, disabled, or target not in layout container', () => {
        const escapedService = createService().service;
        escapedService.registerShortcut({
            id: 'cmd.esc',
            binding: KeyCode.A | MetaKeys.CTRL_COMMAND,
        });
        const escapedDisposable = escapedService.forceEscape();
        expect(escapedService.dispatch(createKeyboardEvent(KeyCode.A, { ctrlKey: true }))).toBeUndefined();
        escapedDisposable.dispose();
        escapedService.dispose();

        const disabledService = createService().service;
        disabledService.registerShortcut({
            id: 'cmd.disabled',
            binding: KeyCode.A | MetaKeys.CTRL_COMMAND,
        });
        const disableDisposable = disabledService.forceDisable();
        expect(disabledService.dispatch(createKeyboardEvent(KeyCode.A, { ctrlKey: true }))).toBeUndefined();
        disableDisposable.dispose();
        disabledService.dispose();

        const withLayout = createService({ layoutAllowed: false }).service;
        withLayout.registerShortcut({
            id: 'cmd.layout',
            binding: KeyCode.A | MetaKeys.CTRL_COMMAND,
        });
        const layoutEvent = createKeyboardEvent(KeyCode.A, { ctrlKey: true });
        Object.defineProperty(layoutEvent, 'target', {
            configurable: true,
            value: document.createElement('div'),
        });
        expect(withLayout.dispatch(layoutEvent)).toBeUndefined();
        withLayout.dispose();
    });

    it('should format shortcut display according to platform-specific bindings', () => {
        const mac = createService({ isMac: true, isWindows: false }).service;
        const macItem = {
            id: 'cmd.mac',
            binding: KeyCode.C,
            mac: KeyCode.C | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT | MetaKeys.ALT | MetaKeys.MAC_CTRL,
        };
        expect(mac.getShortcutDisplay(macItem)).toBe('⌘+⇧+⌥+⌃+C');
        mac.dispose();

        const win = createService({ isWindows: true }).service;
        const winItem = {
            id: 'cmd.win',
            binding: KeyCode.C | MetaKeys.CTRL_COMMAND | MetaKeys.ALT,
            win: KeyCode.C | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
        };
        expect(win.getShortcutDisplay(winItem)).toBe('Ctrl+Shift+C');
        win.dispose();
    });

    it('should return display string of command id and null when not found', () => {
        const { service } = createService();
        service.registerShortcut({
            id: 'cmd.find',
            binding: KeyCode.Z | MetaKeys.CTRL_COMMAND,
        });

        expect(service.getShortcutDisplayOfCommand('cmd.find')).toBe('Ctrl+Z');
        expect(service.getShortcutDisplayOfCommand('cmd.none')).toBeNull();
        service.dispose();
    });

    it('should execute command when native keydown matches registered shortcut', () => {
        const { service, executeCommand } = createService();
        service.registerShortcut({
            id: 'cmd.native',
            binding: KeyCode.V | MetaKeys.CTRL_COMMAND,
            staticParameters: { from: 'test' },
        });

        const event = createKeyboardEvent(KeyCode.V, { ctrlKey: true });
        window.dispatchEvent(event);

        expect(executeCommand).toHaveBeenCalledWith('cmd.native', { from: 'test' });
        expect(event.defaultPrevented).toBe(true);
        service.dispose();
    });
});
