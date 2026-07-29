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
import { cleanup, render } from '@testing-library/react';
import { Injector, LocaleService } from '@univerjs/core';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentManager } from '../../../../common';
import { IRibbonOverrideService } from '../../../../services/ribbon/ribbon-override.service';
import { IRibbonService } from '../../../../services/ribbon/ribbon.service';
import { connectInjector } from '../../../../utils/di';
import { Ribbon } from '../Ribbon';

describe('Ribbon override chrome', () => {
    let observeCount = 0;

    beforeEach(() => {
        observeCount = 0;
        vi.stubGlobal('ResizeObserver', class {
            observe() {
                observeCount += 1;
            }

            disconnect() {}
        });
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it('renders a centered title-only placeholder without the empty toolbar row', () => {
        const injector = new Injector([
            [ComponentManager],
            [LocaleService, { useValue: { t: (key: string) => key } }],
            [IRibbonService, { useValue: createEmptyRibbonService() }],
            [IRibbonOverrideService, {
                useValue: {
                    override$: of({
                        id: 'embed-1',
                        ribbonService: createEmptyRibbonService(),
                        placeholderTitle: 'Bases',
                        hideToolbar: true,
                    }),
                    getOverride: () => ({
                        id: 'embed-1',
                        ribbonService: createEmptyRibbonService(),
                        placeholderTitle: 'Bases',
                        hideToolbar: true,
                    }),
                    activate: () => {},
                    clear: () => {},
                },
            }],
        ]);

        const ConnectedRibbon = connectInjector(Ribbon, injector) as ComponentType<{ ribbonType: 'classic' }>;
        const { container, getByText } = render(<ConnectedRibbon ribbonType="classic" />);

        const placeholder = getByText('Bases');
        expect(placeholder?.parentElement?.className).toContain('univer-justify-center');
        expect(container.querySelectorAll('[data-embed-ribbon-override="true"]')).toHaveLength(1);
        expect(observeCount).toBe(0);
    });
});

function createEmptyRibbonService() {
    return {
        ribbon$: of([]),
        activatedTab$: of(''),
        collapsedIds$: of([]),
        fakeToolbarVisible$: of(false),
        setActivatedTab: () => {},
        showContextualTab: () => {},
        hideContextualTab: () => {},
        hideAllContextualTabs: () => {},
        setCollapsedIds: () => {},
        setFakeToolbarVisible: () => {},
    };
}
