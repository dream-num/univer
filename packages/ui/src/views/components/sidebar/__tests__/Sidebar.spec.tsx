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

import type { ReactElement } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DesktopLogService, ILogService, Injector, LocaleService, LocaleType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { ComponentManager, IconManager } from '../../../../common';
import enUS from '../../../../locale/en-US';
import { DesktopSidebarService } from '../../../../services/sidebar/desktop-sidebar.service';
import { ISidebarService } from '../../../../services/sidebar/sidebar.service';
import { RediProvider } from '../../../../utils/di';
import { Sidebar } from '../Sidebar';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestState {
    static closes = 0;

    static reset(): void {
        this.closes = 0;
    }
}

function renderWithDependencies(element: ReactElement) {
    const injector = new Injector();
    injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([LocaleService]);
    injector.get(LocaleService).load({ [LocaleType.EN_US]: enUS });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);
    injector.add([ComponentManager]);
    injector.add([IconManager]);

    const result = render(
        <RediProvider value={{ injector }}>
            {element}
        </RediProvider>
    );

    return {
        ...result,
        injector,
        dispose: () => {
            result.unmount();
            injector.get(ISidebarService).close();
        },
    };
}

describe('Sidebar', () => {
    afterEach(() => {
        cleanup();
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        TestState.reset();
    });

    it('closes the active panel through the close button and reports the service state', () => {
        const rendered = renderWithDependencies(<Sidebar />);
        const sidebarService = rendered.injector.get(ISidebarService);

        act(() => {
            sidebarService.open({
                id: 'inspector',
                header: { title: <span>Inspector</span> },
                children: { title: <span>Cell details</span> },
                onClose: () => {
                    TestState.closes += 1;
                },
            });
        });

        expect(sidebarService.visible).toBe(true);

        fireEvent.click(screen.getByRole('button', { name: 'Close sidebar' }));

        expect(sidebarService.visible).toBe(false);
        expect(TestState.closes).toBe(1);
        const hiddenSidebar = screen.getByRole('complementary', { hidden: true });
        expect(hiddenSidebar.getAttribute('aria-expanded')).toBe('false');
        expect(hiddenSidebar.getAttribute('aria-hidden')).toBe('true');
        rendered.dispose();
    });

    it('persists the clamped drag width in the sidebar service', () => {
        const rendered = renderWithDependencies(<Sidebar />);
        const sidebarService = rendered.injector.get(ISidebarService);

        act(() => {
            sidebarService.open({
                id: 'formatting',
                header: { title: <span>Formatting</span> },
                width: 384,
            });
        });

        fireEvent.mouseDown(screen.getByRole('separator', { name: 'Resize sidebar' }));
        fireEvent.mouseMove(document, { clientX: -960 });
        fireEvent.mouseUp(document);

        expect(sidebarService.width).toBe(800);
        rendered.dispose();
    });

    it('removes retained panel controls from keyboard navigation after closing', () => {
        const rendered = renderWithDependencies(<Sidebar />);
        const sidebarService = rendered.injector.get(ISidebarService);

        act(() => {
            sidebarService.open({
                id: 'image-format',
                header: { title: <span>Format image</span> },
                children: { title: <button type="button">Start Crop</button> },
            });
        });

        const sidebar = screen.getByRole('complementary', { name: 'Sidebar panel' });
        expect(sidebar.getAttribute('aria-hidden')).toBe('false');
        expect(sidebar.classList.contains('univer-hidden')).toBe(false);

        act(() => sidebarService.close('image-format'));

        expect(sidebar.getAttribute('aria-hidden')).toBe('true');
        expect(sidebar.classList.contains('univer-hidden')).toBe(true);
        expect(screen.getByRole('button', { name: 'Start Crop', hidden: true })).not.toBeNull();
        rendered.dispose();
    });
});
