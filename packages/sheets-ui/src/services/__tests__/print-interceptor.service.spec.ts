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
import { beforeEach, describe, expect, it } from 'vitest';
import { SheetPrintInterceptorService } from '../print-interceptor.service';

describe('SheetPrintInterceptorService', () => {
    let service: SheetPrintInterceptorService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([SheetPrintInterceptorService]);
        service = injector.get(SheetPrintInterceptorService);
    });

    it('maps runtime components to printable component implementations', () => {
        service.registerPrintComponent('sheet-chart', 'print-sheet-chart');

        expect(service.getPrintComponent('sheet-chart')).toBe('print-sheet-chart');
        expect(service.getPrintComponent('unknown-component')).toBeUndefined();
    });
});
