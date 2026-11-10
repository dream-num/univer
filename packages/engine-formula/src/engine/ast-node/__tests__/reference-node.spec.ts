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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IFormulaUnitReferenceResolver } from '../../../services/unit-reference-resolver.service';
import { ErrorType } from '../../../basics/error-type';
import { createFunctionTestBed } from '../../../functions/__tests__/create-function-test-bed';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
import { ISuperTableService } from '../../../services/super-table.service';
import { ReferenceObjectType } from '../../utils/value-object';
import { ErrorValueObject } from '../../value-object/base-value-object';
import { BaseAstNode } from '../base-ast-node';
import { ReferenceNode, ReferenceNodeFactory } from '../reference-node';
import { UnionNode } from '../union-node';

describe('ReferenceNode external range loading', () => {
    let testBed: ReturnType<typeof createFunctionTestBed>;

    beforeEach(() => {
        testBed = createFunctionTestBed();
        testBed.get(IFormulaCurrentConfigService).load({
            allUnitData: { [testBed.unitId]: testBed.sheetData },
            formulaData: {},
            arrayFormulaCellData: {},
            arrayFormulaRange: {},
            forceCalculate: false,
            dirtyRanges: [],
            dirtyNameMap: {},
            dirtyDefinedNameMap: {},
            dirtyUnitFeatureMap: {},
            dirtyUnitOtherFormulaMap: {},
        });
        testBed.get(IFormulaRuntimeService).setCurrent(0, 0, 100, 100, testBed.sheetId, testBed.unitId);
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('loads the full colon range from the qualified left reference', async () => {
        const load = vi.fn(async () => undefined);
        const resolver = {
            resolve: () => ({
                unitId: 'source',
                externalReference: {
                    kind: 'host',
                    qualifier: 'Sales',
                    referenceId: 'sales',
                },
            }),
        } satisfies IFormulaUnitReferenceResolver;
        const currentConfig = testBed.get(IFormulaCurrentConfigService);
        const left = new ReferenceNode(
            currentConfig,
            testBed.get(IFormulaRuntimeService),
            "'[Sales]Data'!A1",
            ReferenceObjectType.CELL,
            resolver,
            testBed.get(ISuperTableService),
            { load },
            true
        );
        const right = new BaseAstNode('B2');
        const union = new UnionNode(':', currentConfig);
        left.setParent(union);
        right.setParent(union);

        await left.executeAsync();

        expect(load).toHaveBeenCalledWith(expect.objectContaining({
            token: "'[Sales]Data'!A1:B2",
        }));
    });

    it('returns REF for a missing local structured table reference', () => {
        const factory = testBed.get(ReferenceNodeFactory);

        const node = factory.checkAndCreateNodeType('Tout[Quantity]');
        expect(node).toBeInstanceOf(ReferenceNode);
        node?.execute();
        const value = node?.getValue();
        expect(value instanceof ErrorValueObject && value.getValue()).toBe(ErrorType.REF);
    });

    it('keeps ordinary cell references out of the structured-table path', () => {
        const factory = testBed.get(ReferenceNodeFactory);

        const node = factory.checkAndCreateNodeType('G2');
        expect(node).toBeInstanceOf(ReferenceNode);
        node?.execute();
        expect(node?.getValue()).not.toBeInstanceOf(ErrorValueObject);
    });
});
