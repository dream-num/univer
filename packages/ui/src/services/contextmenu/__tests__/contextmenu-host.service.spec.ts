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

import { Injector } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContextMenuHostService, IContextMenuHostService } from '../contextmenu-host.service';

const injectors: Injector[] = [];

function createService() {
    const injector = new Injector([[IContextMenuHostService, { useClass: ContextMenuHostService }]]);
    injectors.push(injector);
    return injector.get(IContextMenuHostService);
}

afterEach(() => injectors.splice(0).forEach((injector) => injector.dispose()));

describe('ContextMenuHostService', () => {
    it('hides the previously active menu when another menu becomes active', () => {
        const service = createService();
        const hideMainMenu = vi.fn();
        const hideFooterMenu = vi.fn();
        service.registerMenu('main', hideMainMenu);
        service.registerMenu('footer', hideFooterMenu);

        service.activateMenu('main');
        service.activateMenu('footer');

        expect(hideMainMenu).toHaveBeenCalledTimes(1);
        expect(hideFooterMenu).not.toHaveBeenCalled();
        expect(service.activeMenuId).toBe('footer');
    });

    it('clears active menu state when a registered menu is disposed', () => {
        const service = createService();
        const disposable = service.registerMenu('main', vi.fn());
        service.activateMenu('main');

        disposable.dispose();

        expect(service.activeMenuId).toBeNull();
    });

    it('publishes active menu changes', () => {
        const service = createService();
        const activeMenuIds: Array<string | null> = [];
        service.registerMenu('main', vi.fn());
        const subscription = service.activeMenuId$.subscribe((menuId) => activeMenuIds.push(menuId));

        service.activateMenu('main');
        service.deactivateMenu('main');

        expect(activeMenuIds).toEqual([null, 'main', null]);
        subscription.unsubscribe();
    });

    it('closes registered menus and blocks reopening until all host suspension owners release', () => {
        const host = createService();
        const other = createService();
        const closeContextMenu = vi.fn();
        const closeDropdown = vi.fn();
        host.registerMenu('context', closeContextMenu);
        host.registerMenu(Symbol('dropdown'), closeDropdown);
        host.activateMenu('context');

        const history = host.suspend();
        const preview = host.suspend();
        expect(closeContextMenu).toHaveBeenCalledWith(false);
        expect(closeDropdown).toHaveBeenCalledWith(false);
        other.activateMenu('other');
        expect(other.activeMenuId).toBe('other');

        history.dispose();
        history.dispose();
        host.activateMenu('context');
        expect(host.activeMenuId).toBeNull();
        preview.dispose();
        host.activateMenu('context');
        expect(host.activeMenuId).toBe('context');
    });

    it('releases a suspension if a registered menu fails to close', () => {
        const host = createService();
        const registration = host.registerMenu('custom', () => {
            throw new Error('Cannot close');
        });
        expect(() => host.suspend()).toThrow('Cannot close');
        registration.dispose();
        host.activateMenu('context');
        expect(host.activeMenuId).toBe('context');
    });
});
