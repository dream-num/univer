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

import type { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import type { IFormulaUnitReferenceResolver } from '../../../services/unit-reference-resolver.service';
import type { BaseValueObject } from '../../value-object/base-value-object';
import { describe, expect, it, vi } from 'vitest';
import { ErrorType } from '../../../basics/error-type';
import { ReferenceObjectType } from '../../utils/value-object';
import { ErrorValueObject } from '../../value-object/base-value-object';
import { BaseAstNode } from '../base-ast-node';
import { ReferenceNode, ReferenceNodeFactory } from '../reference-node';
import { UnionNode } from '../union-node';

describe('ReferenceNode external range loading', () => {
    it('loads the full colon range from the qualified left reference', async () => {
        const load = vi.fn(async () => undefined);
        const currentConfig = {
            getSheetNameMap: () => ({}),
            getUnitData: () => ({}),
            getArrayFormulaCellData: () => ({}),
            getArrayFormulaRange: () => ({}),
            getUnitStylesData: () => ({}),
        };
        const runtime = {
            markExternalReferenceUnavailable: vi.fn(),
            currentUnitId: 'host',
            currentSubUnitId: 'host-sheet',
            currentRow: 0,
            currentColumn: 0,
            getUnitData: () => ({}),
            getRuntimeArrayFormulaCellData: () => ({}),
            getUnitArrayFormula: () => ({}),
            getRuntimeFeatureCellData: () => ({}),
        };
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
        const superTableService = {
            getTableMap: () => null,
            getTableOptionMap: () => new Map(),
        };
        const left = new ReferenceNode(
            currentConfig,
            runtime,
            "'[Sales]Data'!A1",
            ReferenceObjectType.CELL,
            resolver,
            superTableService,
            { load },
            true
        );
        const right = new BaseAstNode('B2');
        const union = new UnionNode(':', {
            getSheetsInfo: () => ({
                sheetNameMap: {},
                sheetOrder: [],
            }),
        } satisfies Pick<IFormulaCurrentConfigService, 'getSheetsInfo'>);
        left.setParent(union);
        right.setParent(union);

        await left.executeAsync();

        expect(load).toHaveBeenCalledWith(expect.objectContaining({
            token: "'[Sales]Data'!A1:B2",
        }));
    });

    it('returns REF for a missing local structured table reference', () => {
        const currentConfig = {
            getSheetNameMap: () => ({}),
            getUnitData: () => ({}),
            getArrayFormulaCellData: () => ({}),
            getArrayFormulaRange: () => ({}),
            getUnitStylesData: () => ({}),
        };
        const runtime = {
            markExternalReferenceUnavailable: vi.fn(),
            currentUnitId: 'host',
            currentSubUnitId: 'host-sheet',
            currentRow: 0,
            currentColumn: 0,
            getUnitData: () => ({}),
            getRuntimeArrayFormulaCellData: () => ({}),
            getUnitArrayFormula: () => ({}),
            getRuntimeFeatureCellData: () => ({}),
        };
        const factory = new ReferenceNodeFactory(
            currentConfig as never,
            runtime as never,
            {} as never,
            {
                getTableMap: () => null,
                getTableOptionMap: () => new Map(),
            } as never,
            { resolve: () => ({ unitId: 'host' }) } as IFormulaUnitReferenceResolver,
            { load: vi.fn() } as never
        );

        const node = factory.checkAndCreateNodeType('Tout[Quantity]');
        expect(node).toBeInstanceOf(ReferenceNode);
        node?.execute();
        expect((node?.getValue() as BaseValueObject).getValue()).toBe(ErrorType.REF);
    });

    it('keeps ordinary cell references out of the structured-table path', () => {
        const currentConfig = {
            getSheetNameMap: () => ({}),
            getUnitData: () => ({}),
            getArrayFormulaCellData: () => ({}),
            getArrayFormulaRange: () => ({}),
            getUnitStylesData: () => ({}),
        };
        const runtime = {
            markExternalReferenceUnavailable: vi.fn(),
            currentUnitId: 'host',
            currentSubUnitId: 'host-sheet',
            currentRow: 0,
            currentColumn: 0,
            getUnitData: () => ({}),
            getRuntimeArrayFormulaCellData: () => ({}),
            getUnitArrayFormula: () => ({}),
            getRuntimeFeatureCellData: () => ({}),
        };
        const factory = new ReferenceNodeFactory(
            currentConfig as never,
            runtime as never,
            {} as never,
            {
                getTableMap: () => null,
                getTableOptionMap: () => new Map(),
            } as never,
            { resolve: () => ({ unitId: 'host' }) } as IFormulaUnitReferenceResolver,
            { load: vi.fn() } as never
        );

        const node = factory.checkAndCreateNodeType('G2');
        expect(node).toBeInstanceOf(ReferenceNode);
        node?.execute();
        expect(node?.getValue()).not.toBeInstanceOf(ErrorValueObject);
    });
});
