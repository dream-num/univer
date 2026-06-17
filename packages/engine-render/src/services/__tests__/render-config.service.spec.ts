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
import { describe, expect, it } from 'vitest';
import { UniverRenderConfigService } from '../render-config.service';

function createService(): UniverRenderConfigService {
    const injector = new Injector();
    injector.add([UniverRenderConfigService]);
    return injector.get(UniverRenderConfigService);
}

describe('UniverRenderConfigService', () => {
    it('stores renderer options and removes options when callers clear them', () => {
        const service = createService();

        expect(service.getRenderConfig()).toEqual({ ok: '111' });

        service.setRenderConfig('font', '12px');
        expect(service.getRenderConfig()).toEqual({ ok: '111', font: '12px' });

        service.setRenderConfig('font', null);
        expect(service.getRenderConfig()).toEqual({ ok: '111' });

        service.setRenderConfig('lineWidth', 2);
        service.setRenderConfig('lineWidth', undefined);
        expect(service.getRenderConfig()).toEqual({ ok: '111' });
    });
});
