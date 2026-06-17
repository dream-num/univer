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

import { DrawingTypeEnum, Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DrawingManagerService } from '../drawing-manager-impl.service';

function createService(): DrawingManagerService {
    const injector = new Injector();
    injector.add([DrawingManagerService]);
    return injector.get(DrawingManagerService);
}

describe('DrawingManagerService', () => {
    it('uses the shared drawing manager behavior to register and remove drawings by unit', () => {
        const service = createService();
        const removed: unknown[] = [];
        service.remove$.subscribe((value) => removed.push(value));

        service.registerDrawingData('unit-1', {
            'sheet-1': {
                data: {
                    image1: { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'image1', drawingType: DrawingTypeEnum.DRAWING_IMAGE },
                },
                order: ['image1'],
            },
        });
        expect(service.getDrawingData('unit-1', 'sheet-1')).toHaveProperty('image1');

        service.removeDrawingDataForUnit('unit-1');
        expect(service.getDrawingDataForUnit('unit-1')).toEqual({});
        expect(removed).toEqual([[{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'image1' }]]);
    });
});
