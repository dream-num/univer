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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContextMenuHostService, IContextMenuHostService } from '../contextmenu-host.service';

describe('ContextMenuHostService', () => {
    let service: IContextMenuHostService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IContextMenuHostService, { useClass: ContextMenuHostService }]);
        service = injector.get(IContextMenuHostService);
    });

    it('hides the previously active menu when another menu becomes active', () => {
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
        const disposable = service.registerMenu('main', vi.fn());
        service.activateMenu('main');

        disposable.dispose();

        expect(service.activeMenuId).toBeNull();
    });
});
