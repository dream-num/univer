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

import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { DesktopLogService, ILogService, Injector, LocaleService, LocaleType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { ComponentManager } from '../../../../common/component-manager';
import { IconManager } from '../../../../common/icon-manager';
import enUS from '../../../../locale/en-US';
import { DesktopSidebarService } from '../../../../services/sidebar/desktop-sidebar.service';
import { ISidebarService } from '../../../../services/sidebar/sidebar.service';
import { RediProvider } from '../../../../utils/di';
import { MobileSidebar } from '../MobileSidebar';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('MobileSidebar', () => {
    let injector: Injector;

    afterEach(() => {
        cleanup();
        injector.dispose();
    });

    it('renders sidebar content in a modal drawer that can be closed', () => {
        injector = new Injector([
            [ISidebarService, { useClass: DesktopSidebarService }],
            [ILogService, { useClass: DesktopLogService }],
            [LocaleService],
            [ComponentManager],
            [IconManager],
        ]);
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        const sidebarService = injector.get(ISidebarService);
        render(<RediProvider value={{ injector }}><MobileSidebar /></RediProvider>);

        act(() => {
            sidebarService.open({
                id: 'comments',
                header: { title: <span>Comments</span> },
                children: { title: <span>Comment list</span> },
            });
        });

        const drawer = screen.getByRole('dialog', { name: 'Sidebar panel' });
        expect(drawer.getAttribute('aria-modal')).toBe('true');
        expect(within(drawer).getByText('Comment list')).toBeTruthy();

        fireEvent.click(within(drawer).getByRole('button', { name: 'Close sidebar' }));

        expect(sidebarService.visible).toBe(false);
        expect(screen.queryByRole('dialog', { name: 'Sidebar panel' })).toBeNull();
    });
});
