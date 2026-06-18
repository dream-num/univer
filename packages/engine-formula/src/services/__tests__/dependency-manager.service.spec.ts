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

import type { AstRootNode } from '../../engine/ast-node';
import { Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { FormulaDependencyTree } from '../../engine/dependency/dependency-tree';
import { DependencyManagerBaseService, DependencyManagerService, IDependencyManagerService } from '../dependency-manager.service';

class TestDependencyManagerBaseService extends DependencyManagerBaseService {
    protected override _addAllTreeMap() {
        // The base-service test exercises state handled by the base class; tree-map indexing belongs to the concrete service.
    }
}

class TestBuildDependencyManagerService extends DependencyManagerService {
    trees: FormulaDependencyTree[] = [];

    override getAllTree() {
        return this.trees;
    }

    override getTreeById(treeId: number) {
        return this.trees.find((tree) => tree.treeId === treeId);
    }

    override updateDependencyTreeDirtyState(treeId: number, isDirty: boolean): void {
        const tree = this.getTreeById(treeId);
        if (tree) {
            tree.isDirty = isDirty;
        }
    }
}

function createTree(treeId: number, row: number, column: number) {
    const tree = new FormulaDependencyTree(treeId);
    tree.unitId = 'unit-1';
    tree.subUnitId = 'sheet-1';
    tree.row = row;
    tree.column = column;
    tree.rangeList = [
        {
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            range: {
                startRow: row,
                startColumn: column,
                endRow: row,
                endColumn: column + 1,
            },
        },
    ];
    return tree;
}

function createService(): IDependencyManagerService {
    const injector = new Injector();
    injector.add([IDependencyManagerService, { useClass: DependencyManagerService }]);
    return injector.get(IDependencyManagerService);
}

describe('DependencyManagerService', () => {
    it('should keep base dependency manager state through DI-created subclass', () => {
        const injector = new Injector();
        injector.add([DependencyManagerBaseService, { useClass: TestDependencyManagerBaseService }]);
        const service = injector.get(DependencyManagerBaseService);

        service.addOtherFormulaDependencyMainData('feature-formula');

        expect(service.hasOtherFormulaDataMainData('feature-formula')).toBe(true);
        expect(service.getLastTreeId()).toBe(0);
        expect(service.getLastTreeId()).toBe(1);
        expect(service.getOtherFormulaDependency('missing', 'sheet-1', 'f-1')).toBeUndefined();
        expect(service.getFeatureFormulaDependency('missing', 'sheet-1', 'feature-1')).toBeUndefined();
        expect(service.getFormulaDependency('missing', 'sheet-1', 0, 0)).toBeUndefined();
        expect(() => service.reset()).toThrow('Method not implemented.');
        expect(() => service.getTreeById(1)).toThrow('Method not implemented.');
        expect(() => service.getAllTree()).toThrow('Method not implemented.');
        expect(() => service.addOtherFormulaDependency('u', 's', 'f', createTree(1, 0, 0))).toThrow('Method not implemented.');
        expect(() => service.removeOtherFormulaDependency('u', 's', ['f'])).toThrow('Method not implemented.');
        expect(() => service.clearOtherFormulaDependency('u')).toThrow('Method not implemented.');
        expect(() => service.addFeatureFormulaDependency('u', 's', 'f', createTree(2, 0, 0))).toThrow('Method not implemented.');
        expect(() => service.removeFeatureFormulaDependency('u', 's', ['f'])).toThrow('Method not implemented.');
        expect(() => service.clearFeatureFormulaDependency('u')).toThrow('Method not implemented.');
        expect(() => service.addFormulaDependency('u', 's', 0, 0, createTree(3, 0, 0))).toThrow('Method not implemented.');
        expect(() => service.removeFormulaDependency('u', 's', 0, 0)).toThrow('Method not implemented.');
        expect(() => service.clearFormulaDependency('u')).toThrow('Method not implemented.');
        expect(() => service.updateDependencyTreeDirtyState(1, true)).toThrow('Method not implemented.');
    });

    it('should track formula dependencies and remove their search cache by location', () => {
        const service = createService();
        const treeA = createTree(1, 0, 0);
        const treeB = createTree(2, 1, 1);
        const searchA = [
            {
                unitId: 'unit-1',
                sheetId: 'sheet-1',
                range: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
                    endColumn: 1,
                },
            },
        ];
        const searchB = [
            {
                unitId: 'unit-1',
                sheetId: 'sheet-1',
                range: {
                    startRow: 1,
                    startColumn: 1,
                    endRow: 1,
                    endColumn: 2,
                },
            },
        ];

        service.addFormulaDependency('unit-1', 'sheet-1', 0, 0, treeA);
        service.addFormulaDependency('unit-1', 'sheet-1', 1, 1, treeB);
        service.addDependencyRTreeCache(treeA);
        service.addDependencyRTreeCache(treeB);

        expect(service.getFormulaDependency('unit-1', 'sheet-1', 0, 0)).toBe(1);
        expect(service.getFormulaDependency('unit-1', 'sheet-1', 1, 1)).toBe(2);
        expect(service.searchDependency(searchA)).toEqual(new Set([1]));
        expect(service.searchDependency(searchB)).toEqual(new Set([2]));

        service.removeFormulaDependency('unit-1', 'sheet-1', 0, 0);
        expect(service.getFormulaDependency('unit-1', 'sheet-1', 0, 0)).toBeUndefined();
        expect(service.searchDependency(searchA)).toEqual(new Set());
        expect(service.searchDependency(searchB)).toEqual(new Set([2]));

        service.clearFormulaDependency('unit-1', 'sheet-1');
        expect(service.getFormulaDependency('unit-1', 'sheet-1', 1, 1)).toBeUndefined();
        expect(service.searchDependency(searchB)).toEqual(new Set());
    });

    it('should manage other-formula dependency matrices and main-data flag', () => {
        const service = createService();
        const tree = createTree(10, 0, 0);
        tree.refOffsetX = 3;
        tree.refOffsetY = 4;

        service.addOtherFormulaDependency('unit-1', 'sheet-1', 'f-1', tree);
        service.addOtherFormulaDependencyMainData('f-1');

        expect(service.getOtherFormulaDependency('unit-1', 'sheet-1', 'f-1')?.getValue(3, 4)).toBe(10);
        expect(service.hasOtherFormulaDataMainData('f-1')).toBe(true);

        service.removeOtherFormulaDependency('unit-1', 'sheet-1', ['f-1']);
        expect(service.getOtherFormulaDependency('unit-1', 'sheet-1', 'f-1')).toBeUndefined();
        expect(service.hasOtherFormulaDataMainData('f-1')).toBe(false);
    });

    it('should clear other-formula dependencies for a sheet or an entire workbook', () => {
        const service = createService();
        const treeA = createTree(11, 0, 0);
        const treeB = createTree(12, 1, 1);
        treeA.refOffsetX = 0;
        treeA.refOffsetY = 0;
        treeB.refOffsetX = 1;
        treeB.refOffsetY = 1;

        service.addOtherFormulaDependency('unit-1', 'sheet-1', 'f-1', treeA);
        service.addOtherFormulaDependency('unit-1', 'sheet-2', 'f-2', treeB);
        service.addDependencyRTreeCache(treeA);
        service.addDependencyRTreeCache(treeB);
        service.addOtherFormulaDependencyMainData('f-1');
        service.addOtherFormulaDependencyMainData('f-2');

        service.clearOtherFormulaDependency('unit-1', 'sheet-1');
        expect(service.getOtherFormulaDependency('unit-1', 'sheet-1', 'f-1')?.getValue(0, 0)).toBeUndefined();
        expect(service.getOtherFormulaDependency('unit-1', 'sheet-2', 'f-2')?.getValue(1, 1)).toBe(12);
        expect(service.hasOtherFormulaDataMainData('f-1')).toBe(false);

        service.clearOtherFormulaDependency('unit-1');
        expect(service.getOtherFormulaDependency('unit-1', 'sheet-2', 'f-2')).toBeUndefined();
        expect(service.hasOtherFormulaDataMainData('f-2')).toBe(false);
    });

    it('should manage feature formula dependencies', () => {
        const service = createService();
        const tree = createTree(20, 2, 2);

        service.addFeatureFormulaDependency('unit-1', 'sheet-1', 'feature-a', tree);
        expect(service.getFeatureFormulaDependency('unit-1', 'sheet-1', 'feature-a')).toBe(20);

        service.removeFeatureFormulaDependency('unit-1', 'sheet-1', ['feature-a']);
        expect(service.getFeatureFormulaDependency('unit-1', 'sheet-1', 'feature-a')).toBeUndefined();
    });

    it('should clear feature dependencies by sheet or workbook', () => {
        const service = createService();
        const treeA = createTree(21, 2, 2);
        const treeB = createTree(22, 3, 3);

        service.addFeatureFormulaDependency('unit-1', 'sheet-1', 'feature-a', treeA);
        service.addFeatureFormulaDependency('unit-1', 'sheet-2', 'feature-b', treeB);
        service.addDependencyRTreeCache(treeA);
        service.addDependencyRTreeCache(treeB);

        service.clearFeatureFormulaDependency('unit-1', 'sheet-1');
        expect(service.getFeatureFormulaDependency('unit-1', 'sheet-1', 'feature-a')).toBeUndefined();
        expect(service.getFeatureFormulaDependency('unit-1', 'sheet-2', 'feature-b')).toBe(22);

        service.clearFeatureFormulaDependency('unit-1');
        expect(service.getFeatureFormulaDependency('unit-1', 'sheet-2', 'feature-b')).toBeUndefined();
    });

    it('should clear dependencies by defined name', () => {
        const service = createService();
        const tree = createTree(30, 3, 3);
        const search = [
            {
                unitId: 'unit-1',
                sheetId: 'sheet-1',
                range: {
                    startRow: 3,
                    startColumn: 3,
                    endRow: 3,
                    endColumn: 4,
                },
            },
        ];
        service.addFormulaDependency('unit-1', 'sheet-1', 3, 3, tree);
        service.addDependencyRTreeCache(tree);

        const node = {
            getDefinedNames: () => ['MY_NAME'],
        } as AstRootNode;
        service.addFormulaDependencyByDefinedName(tree, node);

        expect(service.searchDependency(search)).toEqual(new Set([30]));

        service.removeFormulaDependencyByDefinedName('unit-1', 'MY_NAME');
        expect(service.searchDependency(search)).toEqual(new Set());
    });

    it('should support tree id allocation and reset', () => {
        const service = createService();
        expect(service.getLastTreeId()).toBe(0);
        expect(service.getLastTreeId()).toBe(1);

        const tree = createTree(60, 6, 6);
        service.addDependencyRTreeCache(tree);

        service.reset();
        expect(service.searchDependency([
            {
                unitId: 'unit-1',
                sheetId: 'sheet-1',
                range: {
                    startRow: 6,
                    startColumn: 6,
                    endRow: 6,
                    endColumn: 7,
                },
            },
        ])).toEqual(new Set());
        expect(service.getLastTreeId()).toBe(0);
    });

    it('should clear formula dependencies across the whole workbook and dispose cached state', () => {
        const service = createService();
        const treeA = createTree(70, 7, 7);
        const treeB = createTree(71, 8, 8);

        service.addFormulaDependency('unit-1', 'sheet-1', 7, 7, treeA);
        service.addFormulaDependency('unit-1', 'sheet-2', 8, 8, treeB);
        service.addDependencyRTreeCache(treeA);
        service.addDependencyRTreeCache(treeB);

        service.clearFormulaDependency('unit-1');
        expect(service.getFormulaDependency('unit-1', 'sheet-1', 7, 7)).toBeUndefined();
        expect(service.getFormulaDependency('unit-1', 'sheet-2', 8, 8)).toBeUndefined();

        service.addDependencyRTreeCache(treeA);
        service.openKdTree();
        service.closeKdTree();
        service.dispose();
        expect(service.searchDependency([{
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            range: {
                startRow: 7,
                startColumn: 7,
                endRow: 7,
                endColumn: 8,
            },
        }])).toEqual(new Set());
    });

    it('should build dependency relationships for selected trees and reverse dependencies for all trees', () => {
        const injector = new Injector();
        injector.add([TestBuildDependencyManagerService]);
        const service = injector.get(TestBuildDependencyManagerService);
        const parent = createTree(80, 1, 1);
        const child = createTree(81, 0, 0);
        parent.rangeList = [{
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
        }];
        service.trees = [parent, child];
        service.addDependencyRTreeCache(parent);

        expect(service.buildDependencyTree([parent])).toEqual([parent, child]);

        service.updateDependencyTreeDirtyState(parent.treeId, true);
        expect(service.getTreeById(parent.treeId)?.isDirty).toBe(true);
    });

    it('should build reverse dependencies when no selected trees are provided', () => {
        const injector = new Injector();
        injector.add([TestBuildDependencyManagerService]);
        const service = injector.get(TestBuildDependencyManagerService);
        const parent = createTree(90, 1, 1);
        const child = createTree(91, 0, 0);
        parent.rangeList = [{
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
        }];
        service.trees = [parent, child];
        service.addDependencyRTreeCache(parent);

        expect(service.buildDependencyTree([], [child])).toEqual([parent, child]);
    });
});
