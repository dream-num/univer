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
import { DocDrawingService, IDocDrawingService } from '../doc-drawing.service';

describe('DocDrawingService', () => {
    let service: IDocDrawingService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IDocDrawingService, { useClass: DocDrawingService }]);
        service = injector.get(IDocDrawingService);
    });

    it('initializes document drawing data and notifies renderers about existing drawings', () => {
        const added: unknown[] = [];
        service.add$.subscribe((items) => added.push(items));
        service.registerDrawingData('doc-1', {
            page1: {
                data: {
                    image1: { drawingId: 'image1' },
                },
                order: ['image1'],
            },
        } as never);

        service.initializeNotification('doc-1');

        expect(service.getDrawingData('doc-1', 'page1')?.image1.drawingId).toBe('image1');
        expect(added).toEqual([[{ drawingId: 'image1', unitId: 'doc-1', subUnitId: 'page1' }]]);
    });
});
