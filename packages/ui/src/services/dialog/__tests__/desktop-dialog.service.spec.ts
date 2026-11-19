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
import type { IDialogPartMethodOptions } from '../../../views/components/dialog-part/interface';
import { ContextMenuHostService, IContextMenuHostService } from '../../contextmenu/contextmenu-host.service';
import { BuiltInUIPart, IUIPartsService, UIPartsService } from '../../parts/parts.service';
import { DesktopDialogService } from '../desktop-dialog.service';
import { IDialogService } from '../dialog.service';

const injectors: Injector[] = [];

function createInjector(): Injector {
    const injector = new Injector();
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([IContextMenuHostService, { useClass: ContextMenuHostService }]);
    injector.add([IDialogService, { useClass: DesktopDialogService }]);
    injectors.push(injector);
    return injector;
}

describe('DesktopDialogService', () => {
    afterEach(() => {
        injectors.splice(0).forEach((injector) => injector.dispose());
    });

    it('tracks opened dialogs and closes only the requested dialog', () => {
        const injector = createInjector();
        const service = injector.get(IDialogService);
        const snapshots: IDialogPartMethodOptions[][] = [];
        const sub = service.getDialogs$().subscribe((options) => snapshots.push(options));

        service.open({ id: 'first' });
        service.open({ id: 'second' });
        service.close('first');

        expect(snapshots.at(-1)).toMatchObject([{ id: 'first', open: false }, { id: 'second', open: true }]);
        sub.unsubscribe();
    });

    it('keeps excepted dialogs open when closing all', () => {
        const injector = createInjector();
        const service = injector.get(IDialogService);
        const snapshots: IDialogPartMethodOptions[][] = [];
        const sub = service.getDialogs$().subscribe((options) => snapshots.push(options));

        service.open({ id: 'first' });
        service.open({ id: 'second' });
        service.closeAll(['second']);

        expect(snapshots.at(-1)).toMatchObject([{ id: 'first', open: false }, { id: 'second', open: true }]);
        sub.unsubscribe();
    });

    it('dismisses menus before opening or reopening a dialog, but preserves them during updates and closing', () => {
        const injector = createInjector();
        const service = injector.get(IDialogService);
        const menuHost = injector.get(IContextMenuHostService);
        const hide = vi.fn();
        menuHost.registerMenu('format', hide);
        const activeMenus: Array<string | null> = [];
        service.getDialogs$().subscribe(() => activeMenus.push(menuHost.activeMenuId));

        menuHost.activateMenu('format');
        service.open({ id: 'format-dialog' });
        expect(hide).toHaveBeenCalledExactlyOnceWith(false);
        expect(activeMenus).toEqual([null]);

        menuHost.activateMenu('format');
        service.open({ id: 'format-dialog', width: 500 });
        service.close('format-dialog');
        expect(hide).toHaveBeenCalledTimes(1);
        expect(menuHost.activeMenuId).toBe('format');

        service.open({ id: 'format-dialog' });
        expect(hide).toHaveBeenCalledTimes(2);
        expect(activeMenus.at(-1)).toBeNull();
    });

    it('registers the global dialog UI part when constructed', () => {
        const injector = createInjector();

        injector.get(IDialogService);
        expect(injector.get(IUIPartsService).getComponents(BuiltInUIPart.GLOBAL).size).toBe(1);
    });
});
