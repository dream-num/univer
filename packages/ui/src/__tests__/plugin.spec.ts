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

import { render } from '@testing-library/react';
import { ErrorService, LocaleService, LocaleType, Univer } from '@univerjs/core';
import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import enUS from '../locale/en-US';
import { UniverMobileUIPlugin } from '../mobile-plugin';
import { UniverUIPlugin } from '../plugin';
import { BuiltInUIPart, IUIPartsService } from '../services/parts/parts.service';

describe.each([{ label: 'desktop', UIPlugin: UniverUIPlugin }, { label: 'mobile', UIPlugin: UniverMobileUIPlugin }])('$label initial feedback', ({ UIPlugin }) => {
    it('renders the first error before the browser has run idle initialization', async () => {
        vi.stubGlobal('requestIdleCallback', () => 1);
        vi.stubGlobal('cancelIdleCallback', () => {});
        const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
        try {
            univer.registerPlugin(UIPlugin);
            const injector = univer.__getInjector();
            injector.get(LocaleService).setDirection('ltr');
            const parts = injector.get(IUIPartsService).getComponents(BuiltInUIPart.GLOBAL);
            const view = render(createElement('div', {}, ...[...parts].map((Part) => createElement(Part))));
            try {
                injector.get(ErrorService).emit('Rejected before idle');
                expect(await view.findByText('Rejected before idle')).toBeTruthy();
            } finally {
                view.unmount();
            }
        } finally {
            univer.dispose();
            vi.unstubAllGlobals();
        }
    });
});
