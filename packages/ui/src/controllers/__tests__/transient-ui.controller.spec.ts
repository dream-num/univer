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

import { Injector } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesktopDialogService } from '../../services/dialog/desktop-dialog.service';
import { IDialogService } from '../../services/dialog/dialog.service';
import { IUIPartsService, UIPartsService } from '../../services/parts/parts.service';
import { DesktopSidebarService } from '../../services/sidebar/desktop-sidebar.service';
import { ISidebarService } from '../../services/sidebar/sidebar.service';
import { ITransientUIService, TransientUIService } from '../../services/transient-ui/transient-ui.service';
import { TransientUIController } from '../transient-ui.controller';

const injectors: Injector[] = [];
function createController() {
    const injector = new Injector([
        [TransientUIController],
        [IUIPartsService, { useClass: UIPartsService }],
        [IDialogService, { useClass: DesktopDialogService }],
        [ISidebarService, { useClass: DesktopSidebarService }],
        [ITransientUIService, { useClass: TransientUIService }],
    ]);
    injectors.push(injector);
    const controller = injector.get(TransientUIController);
    return { injector, controller };
}

afterEach(() => injectors.splice(0).forEach((injector) => injector.dispose()));

describe('TransientUIController', () => {
    it('dismisses menus when a sidebar opens and unsubscribes on disposal', () => {
        const { injector, controller } = createController();
        const service = injector.get(ITransientUIService);
        const dismissed = vi.fn();
        service.dismissed$.subscribe(dismissed);
        const sidebar = injector.get(ISidebarService);
        sidebar.open({ id: 'format' });
        sidebar.close();
        expect(dismissed).toHaveBeenCalledOnce();
        controller.dispose();
        sidebar.open({ id: 'search' });
        expect(dismissed).toHaveBeenCalledOnce();
    });

    it('dismisses on dialog opening, without treating updates or closing another dialog as opening', () => {
        const { injector } = createController();
        const dismissed = vi.fn();
        injector.get(ITransientUIService).dismissed$.subscribe(dismissed);
        const dialogs = injector.get(IDialogService);
        dialogs.open({ id: 'first' });
        dialogs.open({ id: 'second' });
        expect(dismissed).toHaveBeenCalledTimes(2);
        dialogs.open({ id: 'second', width: 500 });
        dialogs.close('first');
        expect(dismissed).toHaveBeenCalledTimes(2);
        dialogs.open({ id: 'first' });
        expect(dismissed).toHaveBeenCalledTimes(3);
    });
});
