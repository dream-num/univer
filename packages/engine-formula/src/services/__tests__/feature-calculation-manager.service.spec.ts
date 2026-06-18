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
import { FeatureCalculationManagerService, IFeatureCalculationManagerService } from '../feature-calculation-manager.service';

describe('FeatureCalculationManagerService', () => {
    let service: IFeatureCalculationManagerService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IFeatureCalculationManagerService, { useClass: FeatureCalculationManagerService }]);
        service = injector.get(IFeatureCalculationManagerService);
    });

    it('stores feature executors per workbook and notifies recalculation listeners', () => {
        const changes: Array<{ unitId: string; subUnitId: string; featureIds: string[] }> = [];
        service.onChanged$.subscribe((change) => changes.push(change));
        const executor = {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            dependencyRanges: [{ unitId: 'book-1', sheetId: 'sheet-1', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } }],
            getDirtyData: () => ({ runtimeCellData: {}, dirtyRanges: {} }),
        };

        service.register('book-1', 'sheet-1', 'sparkline-1', executor as never);
        expect(service.has('book-1', 'sheet-1', 'sparkline-1')).toBe(true);
        expect(service.get('book-1', 'sheet-1', 'sparkline-1')).toBe(executor);
        expect(service.getReferenceExecutorMap().get('book-1')?.get('sheet-1')?.get('sparkline-1')).toBe(executor);

        service.remove('book-1', 'sheet-1', ['sparkline-1']);

        expect(service.get('book-1', 'sheet-1', 'sparkline-1')).toBeUndefined();
        expect(service.has('book-1', 'sheet-1', 'sparkline-1')).toBe(false);
        expect(service.has('missing', 'sheet-1', 'sparkline-1')).toBe(false);
        expect(service.has('book-1', 'missing', 'sparkline-1')).toBe(false);
        expect(changes).toEqual([
            { unitId: 'book-1', subUnitId: 'sheet-1', featureIds: ['sparkline-1'] },
            { unitId: 'book-1', subUnitId: 'sheet-1', featureIds: ['sparkline-1'] },
        ]);
    });

    it('keeps feature maps isolated per sheet and releases them on dispose', () => {
        const executorA = {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            dependencyRanges: [],
            getDirtyData: () => ({ runtimeCellData: {}, dirtyRanges: {} }),
        };
        const executorB = {
            unitId: 'book-1',
            subUnitId: 'sheet-2',
            dependencyRanges: [],
            getDirtyData: () => ({ runtimeCellData: {}, dirtyRanges: {} }),
        };
        const changes: unknown[] = [];

        service.onChanged$.subscribe((change) => changes.push(change));
        service.register('book-1', 'sheet-1', 'feature-1', executorA as never);
        service.register('book-1', 'sheet-2', 'feature-1', executorB as never);

        expect(service.get('book-1', 'sheet-1', 'feature-1')).toBe(executorA);
        expect(service.get('book-1', 'sheet-2', 'feature-1')).toBe(executorB);

        service.dispose();
        expect(service.getReferenceExecutorMap().size).toBe(0);
        expect(changes).toEqual([
            { unitId: 'book-1', subUnitId: 'sheet-1', featureIds: ['feature-1'] },
            { unitId: 'book-1', subUnitId: 'sheet-2', featureIds: ['feature-1'] },
        ]);
    });
});
