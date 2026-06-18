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

import type { ReactNode } from 'react';
import { Injector, LocaleService, LocaleType } from '@univerjs/core';
import { ConfigContext } from '@univerjs/design';
import enUS from '@univerjs/design/locale/en-US';
import { act, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmbedRuntimeProviders } from './EmbedRuntimeProviders';

let container: HTMLElement | undefined;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@univerjs/ui', async () => {
    const { createContext, useContext } = await import('react');
    const MockRediContext = createContext<Injector | null>(null);

    return {
        RediProvider: ({ children, value }: { children?: ReactNode; value: { injector: Injector } }) => (
            <MockRediContext.Provider value={value.injector}>
                {children}
            </MockRediContext.Provider>
        ),
        useDependency: <T,>(token: Parameters<Injector['get']>[0]): T => {
            const injector = useContext(MockRediContext);
            if (!injector) {
                throw new Error('MockRediContext is missing an injector');
            }

            return injector.get(token) as T;
        },
    };
});

afterEach(() => {
    container?.remove();
    container = undefined;
});

describe('EmbedRuntimeProviders', () => {
    it('provides design locale and mount container for embed child roots', () => {
        const injector = new Injector();
        const localeService = new LocaleService();
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        injector.add([LocaleService, { useValue: localeService }]);

        container = document.createElement('div');
        document.body.appendChild(container);
        const mountContainer = document.createElement('div');
        document.body.appendChild(mountContainer);
        let calendarAriaLabel: string | undefined;
        let resolvedMountContainer: HTMLElement | null | undefined;

        function Probe() {
            const { locale, mountContainer } = useContext(ConfigContext);
            calendarAriaLabel = locale?.Calendar?.ariaLabels.previousMonth;
            resolvedMountContainer = mountContainer;
            return null;
        }

        const root = createRoot(container);
        act(() => {
            root.render(
                <EmbedRuntimeProviders injector={injector} mountContainer={mountContainer}>
                    <Probe />
                </EmbedRuntimeProviders>
            );
        });

        expect(calendarAriaLabel).toBe(enUS.design.Calendar.ariaLabels.previousMonth);
        expect(resolvedMountContainer).toBe(mountContainer);

        act(() => root.unmount());
        document.body.removeChild(mountContainer);
    });
});
