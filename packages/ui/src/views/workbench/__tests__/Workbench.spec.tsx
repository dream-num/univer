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

import type { IDisposable } from '@univerjs/core';
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
import { BehaviorSubject, of, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IUIPartsService, UIPartsService } from '../../../services/parts/parts.service';
import { ISidebarService } from '../../../services/sidebar/sidebar.service';
import { ThemeSwitcherService } from '../../../services/theme-switcher/theme-switcher.service';
import { IWorkbenchService, WorkbenchService } from '../../../services/workbench/workbench.service';
import { connectInjector } from '../../../utils/di';
import { DesktopWorkbenchContent } from '../Workbench';

describe('DesktopWorkbenchContent lifecycle', () => {
    afterEach(cleanup);

    it('renders lifecycle and externally requested skeletons without unmounting ready content', () => {
        const lifecycle$ = new BehaviorSubject(LifecycleStages.Starting);
        const lifecycleService = {
            lifecycle$: lifecycle$.asObservable(),
            stage: LifecycleStages.Starting,
        };
        const injector = new Injector([
            [LifecycleService, { useValue: lifecycleService }],
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
        const ConnectedWorkbench = connectInjector(DesktopWorkbenchContent, injector) as ComponentType<{
            mountContainer: HTMLElement;
            contextMenu: boolean;
            onRendered: (containerElement: HTMLElement) => void;
        }>;
        const mountContainer = document.createElement('div');
        const onRendered = vi.fn();
        const result = render(
            <ConnectedWorkbench
                mountContainer={mountContainer}
                contextMenu={false}
                onRendered={onRendered}
            />
        );

        expect(result.container.querySelector('[aria-busy="true"]')).not.toBeNull();
        expect(result.container.querySelector('[data-u-comp="workbench-layout"]')).not.toBeNull();
        expect(onRendered).not.toHaveBeenCalled();

        lifecycleService.stage = LifecycleStages.Ready;
        act(() => lifecycle$.next(LifecycleStages.Ready));

        expect(result.container.querySelector('[aria-busy="true"]')).toBeNull();
        expect(result.container.querySelector('[data-u-comp="workbench-layout"]')).not.toBeNull();
        expect(onRendered).toHaveBeenCalledTimes(1);

        lifecycleService.stage = LifecycleStages.Rendered;
        act(() => lifecycle$.next(LifecycleStages.Rendered));

        expect(onRendered).toHaveBeenCalledTimes(1);

        const workbenchService = injector.get(IWorkbenchService);
        let loadingToken!: IDisposable;
        act(() => {
            loadingToken = workbenchService.acquireSkeleton();
        });

        expect(result.container.querySelector('[aria-busy="true"]')).not.toBeNull();
        expect(result.container.querySelector('[data-u-comp="workbench-layout"]')).not.toBeNull();

        act(() => loadingToken.dispose());

        expect(result.container.querySelector('[aria-busy="true"]')).toBeNull();
        expect(result.container.querySelector('[data-u-comp="workbench-layout"]')).not.toBeNull();
    });
});
