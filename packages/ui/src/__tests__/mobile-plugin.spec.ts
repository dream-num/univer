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

import { ConfigService, ContextService, IConfigService, IContextService, Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { MOBILE_UI_MODE } from '../const';
import { UniverMobileUIPlugin } from '../mobile-plugin';

describe('UniverMobileUIPlugin', () => {
    it('exposes mobile interaction mode to consumers without changing another runtime', () => {
        const injector = new Injector([
            [IConfigService, { useClass: ConfigService }],
            [IContextService, { useClass: ContextService }],
            [UniverMobileUIPlugin, {
                useFactory: (injector: Injector) => injector.createInstance(UniverMobileUIPlugin, {}),
                deps: [Injector],
            }],
        ]);
        const peerInjector = new Injector([[IContextService, { useClass: ContextService }]]);
        try {
            const contextService = injector.get(IContextService);
            expect(contextService.getContextValue(MOBILE_UI_MODE)).toBeFalsy();
            injector.get(UniverMobileUIPlugin);
            expect(contextService.getContextValue(MOBILE_UI_MODE)).toBe(true);
            expect(peerInjector.get(IContextService).getContextValue(MOBILE_UI_MODE)).toBeFalsy();
        } finally {
            injector.dispose();
            peerInjector.dispose();
        }
    });
});
