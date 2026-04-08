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

import type { IUnitExcludedCell } from '../../../basics/common';
import { ObjectMatrix } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import {
    FormulaDependencyTree,
    FormulaDependencyTreeModel,
    FormulaDependencyTreeType,
    FormulaDependencyTreeVirtual,
} from '../dependency-tree';

function createTree(treeId: number) {
    const tree = new FormulaDependencyTree(treeId);
    tree.unitId = 'unit-1';
    tree.subUnitId = 'sheet-1';
    tree.formula = '=A1+B1';
    tree.row = 2;
    tree.column = 3;
    tree.rowCount = 20;
    tree.columnCount = 10;
    tree.rangeList = [
        {
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            range: {
                startRow: 1,
                startColumn: 1,
                endRow: 2,
                endColumn: 2,
            },
        },
    ];
    return tree;
}

describe('FormulaDependencyTree', () => {
    it('should track tree state and parent child relations', () => {
        const parent = createTree(1);
        const child = createTree(2);

        parent.setAdded();
        expect(parent.isAdded()).toBe(true);
        parent.resetState();
        expect(parent.isAdded()).toBe(false);

        parent.setSkip();
        expect(parent.isSkip()).toBe(true);

        parent.pushChildren(child);
        expect(parent.hasChildren(2)).toBe(true);
        expect(child.parents.has(1)).toBe(true);
    });

    it('should handle basic range and dependency checks', () => {
        const tree = createTree(10);

        expect(tree.inRangeData({ startRow: 2, startColumn: 3, endRow: 2, endColumn: 3 })).toBe(true);
        expect(tree.inRangeData({ startRow: 5, startColumn: 5, endRow: 6, endColumn: 6 })).toBe(false);

        expect(tree.dependencySheetName()).toBe(false);
        expect(tree.dependencySheetName({ 'unit-1': { 'sheet-1': 'Main' } })).toBe(true);

        tree.pushRangeList([
            {
                unitId: 'unit-1',
                sheetId: 'sheet-1',
                range: { startRow: 8, startColumn: 8, endRow: 8, endColumn: 8 },
            },
        ]);
        expect(tree.rangeList.length).toBe(2);
        expect(tree.shouldBePushRangeList()).toBe(false);
    });

    it('should use feature ranges when tree is feature formula', () => {
        const tree = createTree(12);
        tree.featureId = 'feature-1';
        tree.featureDirtyRanges = [
            {
                unitId: 'u',
                sheetId: 's',
                range: { startRow: 9, startColumn: 9, endRow: 10, endColumn: 10 },
            },
        ];
        tree.type = FormulaDependencyTreeType.FEATURE_FORMULA;
        tree.rangeList = [];

        expect(tree.shouldBePushRangeList()).toBe(false);
        expect(tree.toRTreeItem()).toEqual(tree.featureDirtyRanges);
    });

    it('should detect excluded range with finite and NaN boundaries', () => {
        const tree = createTree(13);
        tree.rangeList = [
            {
                unitId: 'unit-1',
                sheetId: 'sheet-1',
                range: { startRow: Number.NaN, startColumn: Number.NaN, endRow: Number.NaN, endColumn: Number.NaN },
            },
        ];

        const excluded: IUnitExcludedCell = {
            'unit-1': {
                'sheet-1': new ObjectMatrix<boolean>({
                    0: { 0: true },
                }),
            },
        };

        expect(tree.isExcludeRange(excluded)).toBe(true);
    });

    it('should clear internals on dispose', () => {
        const tree = createTree(14);
        tree.featureDirtyRanges = [
            {
                unitId: 'u',
                sheetId: 's',
                range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 },
            },
        ];
        tree.getDirtyData = (() => ({
            runtimeCellData: {},
            dirtyRanges: {},
        })) as never;

        tree.dispose();

        expect(tree.featureDirtyRanges).toEqual([]);
        expect(tree.rangeList).toEqual([]);
        expect(tree.getDirtyData).toBeNull();
    });
});

describe('FormulaDependencyTreeVirtual', () => {
    it('should expose defaults when no ref tree exists', () => {
        const tree = new FormulaDependencyTreeVirtual();

        expect(tree.row).toBe(-1);
        expect(tree.column).toBe(-1);
        expect(tree.rowCount).toBe(0);
        expect(tree.columnCount).toBe(0);
        expect(tree.unitId).toBe('');
        expect(tree.subUnitId).toBe('');
        expect(tree.formula).toBe('');
        expect(tree.formulaId).toBe('');
        expect(tree.rangeList).toEqual([]);
        expect(tree.toRTreeItem()[0]?.range.startRow).toBe(-1);
    });

    it('should proxy properties and offset ranges from ref tree', () => {
        const refTree = createTree(30);
        refTree.formulaId = 'formula-id-1';
        const virtualTree = new FormulaDependencyTreeVirtual();
        virtualTree.treeId = 31;
        virtualTree.refTree = refTree;
        virtualTree.refOffsetX = 2;
        virtualTree.refOffsetY = 3;

        expect(virtualTree.row).toBe(5);
        expect(virtualTree.column).toBe(5);
        expect(virtualTree.rowCount).toBe(refTree.rowCount);
        expect(virtualTree.columnCount).toBe(refTree.columnCount);
        expect(virtualTree.unitId).toBe('unit-1');
        expect(virtualTree.subUnitId).toBe('sheet-1');
        expect(virtualTree.formula).toBe('=A1+B1');
        expect(virtualTree.formulaId).toBe('formula-id-1');
        expect(virtualTree.nodeData.refOffsetX).toBe(2);
        expect(virtualTree.nodeData.refOffsetY).toBe(3);
        expect(virtualTree.rangeList[0]?.range).toEqual({
            startRow: 4,
            startColumn: 3,
            endRow: 5,
            endColumn: 4,
        });

        expect(virtualTree.inRangeData({ startRow: 5, startColumn: 5, endRow: 6, endColumn: 6 })).toBe(true);
        expect(virtualTree.dependencySheetName({ 'unit-1': { 'sheet-1': 'Main' } })).toBe(true);

        virtualTree.dispose();
        expect(virtualTree.refTree).toBeNull();
    });
});

describe('FormulaDependencyTreeModel', () => {
    it('should serialize normal and virtual trees', () => {
        const tree = createTree(100);
        tree.formulaId = 'fid';
        tree.featureId = 'feature-1';
        tree.type = FormulaDependencyTreeType.NORMAL_FORMULA;

        const childTree = createTree(101);

        const model = new FormulaDependencyTreeModel(tree);
        const childModel = new FormulaDependencyTreeModel(childTree);
        model.addChild(childModel);
        childModel.addParent(model);

        const json = model.toJson();
        expect(json.treeId).toBe(100);
        expect(json.children).toEqual([101]);
        expect(json.parents).toEqual([]);
        expect(json.formulaId).toBe('fid');
        expect(json.featureId).toBe('feature-1');

        const fullJson = childModel.toFullJson();
        expect(fullJson.parents[0]?.treeId).toBe(100);

        const virtual = new FormulaDependencyTreeVirtual();
        virtual.treeId = 200;
        virtual.refTree = tree;
        const virtualModel = new FormulaDependencyTreeModel(virtual);
        expect(virtualModel.refTreeId).toBe(100);
        expect(virtualModel.formula).toBe('');
    });
});
