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

/**
 * @vitest-environment jsdom
 */

import type { ComponentType } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import {
    ContextService,
    DesktopLogService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    LocaleService,
    ThemeService,
    UniverInstanceService,
} from '@univerjs/core';
import { connectInjector } from '@wendellhu/redi/react-bindings';
import { useContext } from 'react';
import { createPortal } from 'react-dom';
import { of, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BuiltInUIPart, IUIPartsService, UIPartsService } from '../../../services/parts/parts.service';
import { ISidebarService } from '../../../services/sidebar/sidebar.service';
import { ThemeSwitcherService } from '../../../services/theme-switcher/theme-switcher.service';
import { IWorkbenchService, WorkbenchService } from '../../../services/workbench/workbench.service';
import { MobileKeyboardInsetContext } from '../mobile-keyboard-inset-context';
import { MobileWorkbench, resolveMobileKeyboardInset, shouldUpdateMobileStableHeight } from '../MobileWorkbench';

function KeyboardBar() {
    const bottom = useContext(MobileKeyboardInsetContext);
    return <div data-testid="keyboard-bar" style={{ bottom }} />;
}

describe('MobileWorkbench keyboard positioning', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('shares viewport changes with footer and portal bars per instance and removes listeners on unmount', () => {
        const viewport = Object.assign(new EventTarget(), { height: 800, offsetTop: 0 });
        vi.stubGlobal('visualViewport', viewport);
        const removeViewportListener = vi.spyOn(viewport, 'removeEventListener');
        const removeWindowListener = vi.spyOn(window, 'removeEventListener');
        const injector = new Injector([
            [LifecycleService, { useValue: { lifecycle$: of(LifecycleStages.Ready), stage: LifecycleStages.Ready } }],
            [LocaleService, {
                useValue: {
                    direction$: of('ltr'),
                    getDirection: () => 'ltr',
                    getLocales: () => ({ design: {} }),
                    localeChanged$: new Subject<void>(),
                    t: (key: string) => key,
                },
            }],
            [ThemeService, {
                useValue: {
                    currentTheme$: of({}),
                    darkMode$: of(false),
                    darkMode: false,
                },
            }],
            [ThemeSwitcherService, { useValue: { injectThemeToHead: () => {} } }],
            [IConfigService, { useValue: { getConfig: () => ({ popupRootId: 'test-popup-root' }) } }],
            [IContextService, { useClass: ContextService }],
            [ILogService, { useClass: DesktopLogService }],
            [IUniverInstanceService, { useClass: UniverInstanceService }],
            [IUIPartsService, { useClass: UIPartsService }],
            [IWorkbenchService, { useClass: WorkbenchService }],
            [ISidebarService, {
                useValue: {
                    sidebarOptions$: of(null),
                    scrollEvent$: new Subject<Event>(),
                    visible: false,
                    close: () => {},
                    setContainer: () => {},
                    setWidth: () => {},
                },
            }],
        ]);
        const partsService = injector.get(IUIPartsService);
        partsService.registerComponent(BuiltInUIPart.FOOTER, () => KeyboardBar);
        const portal = document.createElement('div');
        partsService.registerComponent(BuiltInUIPart.GLOBAL, () => () => createPortal(<KeyboardBar />, portal));
        const ConnectedWorkbench = connectInjector(MobileWorkbench, injector) as ComponentType<{
            mountContainer: HTMLElement;
            contextMenu: boolean;
        }>;
        const firstMount = document.createElement('div');
        const secondMount = document.createElement('div');
        vi.spyOn(firstMount, 'getBoundingClientRect').mockReturnValue({ height: 800, width: 400 } as DOMRect);
        vi.spyOn(secondMount, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 400 } as DOMRect);
        const first = render(<ConnectedWorkbench mountContainer={firstMount} contextMenu={false} />);
        const second = render(<ConnectedWorkbench mountContainer={secondMount} contextMenu={false} />);
        const firstBar = first.container.querySelector<HTMLElement>('[data-testid="keyboard-bar"]')!;
        const secondBar = second.container.querySelector<HTMLElement>('[data-testid="keyboard-bar"]')!;
        const portalBars = portal.querySelectorAll<HTMLElement>('[data-testid="keyboard-bar"]');
        const rootStyle = document.documentElement.getAttribute('style');
        const bodyStyle = document.body.getAttribute('style');
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();

        act(() => {
            viewport.height = 500;
            viewport.dispatchEvent(new Event('resize'));
        });
        expect(firstBar.style.bottom).toBe('300px');
        expect(secondBar.style.bottom).toBe('100px');
        expect(portalBars[0].style.bottom).toBe('300px');
        expect(portalBars[1].style.bottom).toBe('100px');

        act(() => {
            viewport.offsetTop = 20;
            viewport.dispatchEvent(new Event('scroll'));
        });
        expect(firstBar.style.bottom).toBe('280px');
        expect(secondBar.style.bottom).toBe('80px');

        act(() => {
            viewport.height = 800;
            viewport.offsetTop = 0;
            viewport.dispatchEvent(new Event('resize'));
        });
        expect(firstBar.style.bottom).toBe('0px');
        expect(secondBar.style.bottom).toBe('0px');
        expect(document.documentElement.getAttribute('style')).toBe(rootStyle);
        expect(document.body.getAttribute('style')).toBe(bodyStyle);
        input.remove();
        first.unmount();
        second.unmount();
        expect(removeViewportListener.mock.calls.map(([event]) => event)).toEqual(['resize', 'scroll', 'resize', 'scroll']);
        expect(removeWindowListener).toHaveBeenCalledWith('resize', expect.any(Function));
        injector.dispose();
    });
});

describe('resolveMobileKeyboardInset', () => {
    it('excludes persistent browser chrome and reports only keyboard occlusion', () => {
        expect(resolveMobileKeyboardInset(900, 700, 200)).toBe(0);
        expect(resolveMobileKeyboardInset(900, 400, 200)).toBe(300);
    });

    it('uses the visual viewport bottom without displacing the canvas by offsetTop', () => {
        expect(resolveMobileKeyboardInset(932, 180 + 500, 0)).toBe(252);
    });
});

describe('shouldUpdateMobileStableHeight', () => {
    it('fills newly available height without treating viewport growth as keyboard occlusion', () => {
        expect(shouldUpdateMobileStableHeight(780, 860, 390, 390, false, false)).toBe(true);
        expect(shouldUpdateMobileStableHeight(780, 870, 390, 390, false, false)).toBe(true);
        expect(shouldUpdateMobileStableHeight(870, 780, 390, 390, false, false)).toBe(false);
        expect(shouldUpdateMobileStableHeight(780, 870, 390, 390, true, false)).toBe(false);
        expect(shouldUpdateMobileStableHeight(780, 870, 390, 390, false, true)).toBe(false);
    });

    it('does not capture an iOS keyboard-height viewport after focus is lost', () => {
        expect(shouldUpdateMobileStableHeight(900, 520, 430, 430, false, true)).toBe(false);
        expect(shouldUpdateMobileStableHeight(900, 520, 430, 430, false, false)).toBe(false);
        expect(shouldUpdateMobileStableHeight(900, 860, 430, 430, false, false)).toBe(true);
        expect(shouldUpdateMobileStableHeight(900, 430, 430, 900, false, true)).toBe(true);
    });
});
