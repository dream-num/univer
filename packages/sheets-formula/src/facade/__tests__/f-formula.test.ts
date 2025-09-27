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

import type { Mocked } from 'vitest';

import type { IFormulaCellAndFeatureItem } from '../../services/remote/remote-formula-dependency-generator.service';
import { describe, expect, it, vi } from 'vitest';
import { IRemoteFormulaDependencyGenerator } from '../../services/remote/remote-formula-dependency-generator.service';
import { createFacadeTestBed } from './create-test-bed';

describe('FFormula', () => {
    describe('getFormulaCellsAndFeatures', () => {
        it('should return formula cells and features from dependency tree', async () => {
            const testBed = createFacadeTestBed();
            const mockDependencyGenerator: Mocked<IRemoteFormulaDependencyGenerator> = {
                generate: vi.fn(),
            };

            testBed.injector.add([IRemoteFormulaDependencyGenerator, { useValue: mockDependencyGenerator }]);

            const mockTrees: Array<IFormulaCellAndFeatureItem> = [
                { unitId: 'unit1', subUnitId: 'sheet1', row: 0, column: 0 },
                { unitId: 'unit1', subUnitId: 'sheet1', featureId: 'feature1' },
            ];
            mockDependencyGenerator.generate.mockResolvedValue(mockTrees);

            const fFormula = testBed.univerAPI.getFormula();
            const result = await fFormula.getFormulaCellsAndFeatures();

            expect(result).toEqual([
                { unitId: 'unit1', subUnitId: 'sheet1', row: 0, column: 0 },
                { unitId: 'unit1', subUnitId: 'sheet1', featureId: 'feature1' },
            ]);
        });
    });
});
