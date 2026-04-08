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
import { describe, expect, it } from 'vitest';
import { FormulaDependencyTree } from '../../engine/dependency/dependency-tree';
import { DependencyManagerService } from '../dependency-manager.service';

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
                endColumn: column,
            },
        },
    ];
    return tree;
}

describe('DependencyManagerService', () => {
    it('should track formula dependencies and clear by location', () => {
        const service = new DependencyManagerService();
        const treeA = createTree(1, 0, 0);
        const treeB = createTree(2, 1, 1);

        service.addFormulaDependency('unit-1', 'sheet-1', 0, 0, treeA);
        service.addFormulaDependency('unit-1', 'sheet-1', 1, 1, treeB);
        service.addDependencyRTreeCache(treeA);
        service.addDependencyRTreeCache(treeB);

        expect(service.getFormulaDependency('unit-1', 'sheet-1', 0, 0)).toBe(1);
        expect(service.getFormulaDependency('unit-1', 'sheet-1', 1, 1)).toBe(2);
        expect(service.getTreeById(1)).toBe(treeA);
        expect(service.getTreeById(2)).toBe(treeB);

        service.removeFormulaDependency('unit-1', 'sheet-1', 0, 0);
        expect(service.getFormulaDependency('unit-1', 'sheet-1', 0, 0)).toBeUndefined();
        expect(service.getTreeById(1)).toBeUndefined();

        service.clearFormulaDependency('unit-1', 'sheet-1');
        expect(service.getTreeById(2)).toBeUndefined();
    });

    it('should manage other-formula dependency matrices and main-data flag', () => {
        const service = new DependencyManagerService();
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

    it('should manage feature formula dependencies', () => {
        const service = new DependencyManagerService();
        const tree = createTree(20, 2, 2);

        service.addFeatureFormulaDependency('unit-1', 'sheet-1', 'feature-a', tree);
        expect(service.getFeatureFormulaDependency('unit-1', 'sheet-1', 'feature-a')).toBe(20);

        service.removeFeatureFormulaDependency('unit-1', 'sheet-1', ['feature-a']);
        expect(service.getFeatureFormulaDependency('unit-1', 'sheet-1', 'feature-a')).toBeUndefined();
    });

    it('should clear dependencies by defined name', () => {
        const service = new DependencyManagerService();
        const tree = createTree(30, 3, 3);
        service.addFormulaDependency('unit-1', 'sheet-1', 3, 3, tree);
        service.addDependencyRTreeCache(tree);

        const node = {
            getDefinedNames: () => ['MY_NAME'],
        } as AstRootNode;
        service.addFormulaDependencyByDefinedName(tree, node);

        service.removeFormulaDependencyByDefinedName('unit-1', 'MY_NAME');
        expect(service.getTreeById(30)).toBeUndefined();
    });

    it('should build dependency graph and reverse dependencies', () => {
        const service = new DependencyManagerService();
        const dependantTree = createTree(40, 0, 0);
        dependantTree.rangeList = [
            {
                unitId: 'unit-1',
                sheetId: 'sheet-1',
                range: {
                    startRow: 0,
                    startColumn: 1,
                    endRow: 0,
                    endColumn: 1,
                },
            },
        ];

        const sourceTree = createTree(41, 0, 1);

        service.addDependencyRTreeCache(dependantTree);
        service.addDependencyRTreeCache(sourceTree);

        service.buildDependencyTree([dependantTree], [dependantTree]);

        expect(dependantTree.children.has(41)).toBe(true);
        expect(sourceTree.parents.has(40)).toBe(true);
    });

    it('should clear parent-child links when tree is removed', () => {
        const service = new DependencyManagerService();
        const parent = createTree(50, 5, 5);
        const child = createTree(51, 5, 6);
        parent.pushChildren(child);

        service.addDependencyRTreeCache(parent);
        service.addDependencyRTreeCache(child);

        service.clearDependencyForTree(child);
        expect(parent.children.has(51)).toBe(false);
        expect(child.rangeList).toEqual([]);
    });

    it('should support tree id allocation, dirty state update and reset', () => {
        const service = new DependencyManagerService();
        expect(service.getLastTreeId()).toBe(0);
        expect(service.getLastTreeId()).toBe(1);

        const tree = createTree(60, 6, 6);
        service.addDependencyRTreeCache(tree);
        service.updateDependencyTreeDirtyState(60, true);
        expect(service.getTreeById(60)?.isDirty).toBe(true);

        service.reset();
        expect(service.getTreeById(60)).toBeUndefined();
        expect(service.getLastTreeId()).toBe(0);
    });
});
