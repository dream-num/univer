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
import { ContextMenuHostService, IContextMenuHostService } from '../../contextmenu/contextmenu-host.service';
import { DesktopSidebarService } from '../desktop-sidebar.service';
import { ISidebarService } from '../sidebar.service';

const injectors: Injector[] = [];

function createInjector(): Injector {
    const injector = new Injector();
    injector.add([IContextMenuHostService, { useClass: ContextMenuHostService }]);
    injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
    injectors.push(injector);
    return injector;
}

describe('DesktopSidebarService', () => {
    afterEach(() => {
        injectors.splice(0).forEach((injector) => injector.dispose());
        vi.unstubAllGlobals();
    });

    it('opens and closes the requested sidebar panel', () => {
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            callback(1);
            return 1;
        });
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
        const injector = createInjector();
        const service = injector.get(ISidebarService);
        const snapshots: unknown[] = [];
        const opened: string[] = [];
        const closed: string[] = [];
        const sub = service.sidebarOptions$.subscribe((value) => snapshots.push(value));

        service.open({ id: 'inspector', onOpen: () => opened.push('inspector'), onClose: (id) => closed.push(id ?? '') });
        service.close('inspector');

        expect(service.visible).toBe(false);
        expect(opened).toEqual(['inspector']);
        expect(closed).toEqual(['']);
        expect(snapshots).toMatchObject([{ id: 'inspector', visible: true }, { id: 'inspector', visible: false }]);
        sub.unsubscribe();
    });

    it('dismisses menus before publishing an opened panel, but preserves them when the panel closes', () => {
        vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
        const injector = createInjector();
        const service = injector.get(ISidebarService);
        const menuHost = injector.get(IContextMenuHostService);
        const hide = vi.fn();
        menuHost.registerMenu('format', hide);
        const activeMenus: Array<string | null> = [];
        service.sidebarOptions$.subscribe(() => activeMenus.push(menuHost.activeMenuId));

        menuHost.activateMenu('format');
        service.open({ id: 'format-panel' });
        expect(hide).toHaveBeenCalledExactlyOnceWith(false);
        expect(activeMenus).toEqual([null]);

        menuHost.activateMenu('format');
        service.close();
        expect(hide).toHaveBeenCalledTimes(1);
        expect(menuHost.activeMenuId).toBe('format');
    });

    it('ignores close requests for a different sidebar id', () => {
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            callback(1);
            return 1;
        });
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
        const injector = createInjector();
        const service = injector.get(ISidebarService);

        service.open({ id: 'inspector' });
        service.close('other');

        expect(service.visible).toBe(true);
    });
});
