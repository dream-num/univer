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
import { DocPrintInterceptorService } from '../doc-print-interceptor.service';

function createService(): DocPrintInterceptorService {
    const injector = new Injector();
    injector.add([DocPrintInterceptorService]);
    return injector.get(DocPrintInterceptorService);
}

describe('DocPrintInterceptorService', () => {
    it('maps editor components to print components and keeps default interceptors pass-through', () => {
        const service = createService();
        const interceptPoints = service.interceptor.getInterceptPoints();
        const domCollection = { dispose: () => {} };

        service.registerPrintComponent('doc-component', 'print-doc-component');

        expect(service.getPrintComponent('doc-component')).toBe('print-doc-component');
        expect(service.interceptor.fetchThroughInterceptors(interceptPoints.PRINTING_COMPONENT_COLLECT)(undefined, { unitId: 'doc-1' } as never)).toBeUndefined();
        expect(service.interceptor.fetchThroughInterceptors(interceptPoints.PRINTING_DOM_COLLECT)(domCollection as never, { unitId: 'doc-1' } as never)).toBe(domCollection);
    });
});
