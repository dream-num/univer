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
import { describe, expect, it, vi } from 'vitest';
import { ContextMenuService, IContextMenuService } from '../contextmenu.service';

function createService(): IContextMenuService {
    const injector = new Injector();
    injector.add([IContextMenuService, { useClass: ContextMenuService }]);
    return injector.get(IContextMenuService);
}

describe('ContextMenuService', () => {
    it('routes context menu requests to the registered handler while enabled', () => {
        const service = createService();
        const handled: string[] = [];
        let visible = false;
        const event = { stopPropagation: vi.fn() };

        service.registerContextMenuHandler({
            get visible() {
                return visible;
            },
            handleContextMenu: (_event, menuType) => {
                visible = true;
                handled.push(menuType);
            },
            hideContextMenu: () => {
                visible = false;
            },
        });

        service.triggerContextMenu(event as never, 'cell');
        expect(handled).toEqual(['cell']);
        expect(event.stopPropagation).toHaveBeenCalledTimes(1);
        expect(service.visible).toBe(true);

        service.hideContextMenu();
        expect(service.visible).toBe(false);
    });

    it('suppresses handler execution while disabled and resumes after enable', () => {
        const service = createService();
        const handled: string[] = [];
        const event = { stopPropagation: vi.fn() };

        service.registerContextMenuHandler({
            visible: false,
            handleContextMenu: (_event, menuType) => handled.push(menuType),
            hideContextMenu: () => {},
        });

        service.disable();
        service.triggerContextMenu(event as never, 'row');
        service.enable();
        service.triggerContextMenu(event as never, 'column');

        expect(handled).toEqual(['column']);
    });
});
