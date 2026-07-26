import { describe, expect, it, vi } from 'vitest';
import { ReferenceNode } from '../reference-node';
import { ReferenceObjectType } from '../../utils/value-object';
import { BaseAstNode } from '../base-ast-node';
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
        };
        const left = new ReferenceNode(
            currentConfig as never,
            runtime as never,
            "'[Sales]Data'!A1",
            ReferenceObjectType.CELL,
            resolver as never,
            {} as never,
            { load } as never,
            true
        );
        const right = new BaseAstNode('B2');
        const union = new UnionNode(':');
        left.setParent(union);
        right.setParent(union);

        await left.executeAsync();

        expect(load).toHaveBeenCalledWith(expect.objectContaining({
            token: "'[Sales]Data'!A1:B2",
        }));
    });
});
