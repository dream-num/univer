/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IRange, IUnitRange, Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';

import type {
    IDirtyUnitSheetNameMap,
    IFeatureDirtyRangeType,
    IRuntimeUnitDataType,
    IUnitExcludedCell,
} from '../../basics/common';
import type { BaseAstNode } from '../ast-node/base-ast-node';
import type { IFormulaDirtyData } from '../../services/current-data.service';
import type { IAllRuntimeData } from '../../services/runtime.service';

export enum FDtreeStateType {
    DEFAULT,
    ADDED,
    SKIP,
}

export interface IUnitRangeWithToken {
    gridRange: IUnitRange;
    token: string;
}

/**
 * A dependency tree, capable of calculating mutual dependencies,
 * is used to determine the order of formula calculations.
 */
export class FormulaDependencyTree extends Disposable {
    node: Nullable<BaseAstNode>;

    children: FormulaDependencyTree[] = [];

    parents: FormulaDependencyTree[] = [];

    formula: string = '';

    row: number = -1;

    column: number = -1;

    rowCount: number = Number.NEGATIVE_INFINITY;

    columnCount: number = Number.NEGATIVE_INFINITY;

    subUnitId: string = '';

    unitId: string = '';

    rangeList: IUnitRangeWithToken[] = [];

    formulaId: Nullable<string>;

    featureId: Nullable<string>;

    isPassive: boolean = true;

    _childIds: Set<string> = new Set();

    // the left top cell , which means the position of the FormulaDependencyTree
    anchorToken: string = '';

    getDirtyData: Nullable<
        (dirtyData: IFormulaDirtyData, runtimeData: IAllRuntimeData) => {
            runtimeCellData: IRuntimeUnitDataType;
            dirtyRanges: IFeatureDirtyRangeType;
        }
    >;

    private _state = FDtreeStateType.DEFAULT;

    private _id: string;
    constructor() {
        super();
        this._id = `${Math.random().toString(36).slice(3)}-${Math.random().toString(36).slice(3)}`;
    }

    get id() {
        return this._id;
    }

    override dispose(): void {
        super.dispose();

        // this.children.forEach((tree) => {
        //     tree.dispose();
        // });

        this.children = [];

        this.rangeList = [];

        this.parents = [];

        this.node?.dispose();
    }

    disposeWithChildren() {
        this.children.forEach((tree) => {
            tree.disposeWithChildren();
        });

        this.dispose();
    }

    resetState() {
        this._state = FDtreeStateType.DEFAULT;
    }

    setAdded() {
        this._state = FDtreeStateType.ADDED;
    }

    isAdded() {
        return this._state === FDtreeStateType.ADDED;
    }

    setSkip() {
        this._state = FDtreeStateType.SKIP;
    }

    isSkip() {
        return this._state === FDtreeStateType.SKIP;
    }

    inRangeData(range: IRange) {
        const startRow = range.startRow;
        const startColumn = range.startColumn;
        const endRow = range.endRow;
        const endColumn = range.endColumn;

        if (this.row < startRow || this.row > endRow || this.column < startColumn || this.column > endColumn) {
            return false;
        }

        return true;
    }

    /**
     * "Determine whether all ranges of the current node exist within the dirty area.
     *  If they are within the dirty area, return true, indicating that this node needs to be calculated.
     * @param dependencyRangeList
     */
    dependencyRange(
        dependencyRangeList: Map<string, Map<string, IRange[]>>,
        dirtyUnitSheetNameMap: IDirtyUnitSheetNameMap,
        unitExcludedCell: Nullable<IUnitExcludedCell>
    ) {
        if (this.rangeList.length === 0) {
            return false;
        }

        for (let r = 0, len = this.rangeList.length; r < len; r++) {
            const unitRange = this.rangeList[r];
            const { unitId, sheetId, range } = unitRange.gridRange;

            /**
             * When a worksheet is inserted or deleted,
             * the formulas that depend on these worksheets need to be calculated.
             */
            if (dirtyUnitSheetNameMap[unitId]?.[sheetId] != null) {
                return true;
            }

            if (!dependencyRangeList.has(unitId)) {
                continue;
            }

            const sheetRangeMap = dependencyRangeList.get(unitId)!;
            if (!sheetRangeMap.has(sheetId)) {
                continue;
            }

            const dependencyRanges = sheetRangeMap.get(sheetId)!;
            const excludedCell = unitExcludedCell?.[unitId]?.[sheetId];
            let { startRow: rangeStartRow, endRow: rangeEndRow, startColumn: rangeStartColumn, endColumn: rangeEndColumn } = range;

            if (Number.isNaN(rangeStartRow)) {
                rangeStartRow = 0;
            }
            if (Number.isNaN(rangeStartColumn)) {
                rangeStartColumn = 0;
            }
            if (Number.isNaN(rangeEndRow)) {
                rangeEndRow = Number.POSITIVE_INFINITY;
            }
            if (Number.isNaN(rangeEndColumn)) {
                rangeEndColumn = Number.POSITIVE_INFINITY;
            }

            for (const dependencyRange of dependencyRanges) {
                const { startRow, startColumn, endRow, endColumn } = dependencyRange;

                if (rangeStartRow > endRow || rangeEndRow < startRow || rangeStartColumn > endColumn || rangeEndColumn < startColumn) {
                    continue;
                } else {
                    let isInclude = true;
                    /**
                     * The position of the primary cell in the array formula needs to be excluded when calculating the impact of the array formula on dependencies.
                     * This is because its impact was already considered during the first calculation.
                     */
                    excludedCell?.forValue((row, column) => {
                        if (row >= rangeStartRow && row <= rangeEndRow && column >= rangeStartColumn && column <= rangeEndColumn) {
                            isInclude = false;
                            return false;
                        }
                    });

                    if (isInclude) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    pushChildren(tree: FormulaDependencyTree) {
        this.children.push(tree);
        tree._pushParent(this);
        this._childIds.add(tree.id);
    }

    hasChild(tree: FormulaDependencyTree) {
        return this._childIds.has(tree.id);
    }

    /**
     * Add the range corresponding to the current ast node.
     * @param range
     */
    pushRangeList(range: IUnitRangeWithToken) {
        this.rangeList.push(range);
    }

    /**
     * Determine whether it is dependent on other trees.
     * @param dependenceTree
     */
    dependency(dependenceTree: FormulaDependencyTree) {
        if (this.rangeList.length === 0) {
            return false;
        }

        for (let r = 0, len = this.rangeList.length; r < len; r++) {
            const unitRange = this.rangeList[r];
            const unitId = unitRange.gridRange.unitId;
            const sheetId = unitRange.gridRange.sheetId;
            const range = unitRange.gridRange.range;

            if (
                dependenceTree.unitId === unitId &&
                dependenceTree.subUnitId === sheetId &&
                dependenceTree.inRangeData(range)
            ) {
                return true;
            }
        }

        return false;
    }

    private _pushParent(tree: FormulaDependencyTree) {
        this.parents.push(tree);
    }
}

interface IFormulaDependencyTreeCacheItem {
    unitRangeWithToken: IUnitRangeWithToken;
    treeList: FormulaDependencyTree[];
    ids: Set<string>;
}

export class FormulaDependencyTreeCache extends Disposable {
    private _cacheItems = new Map<string, IFormulaDependencyTreeCacheItem>();
    private _map = new Map<string, Map<string, Set<string>>>();
    private _dependencyMap = new Map<string, FormulaDependencyTree>();
    private _parentIdMap = new Map<string, string[]>();
    // use for mark the first cell of the range
    private _rangeTokens = new Set<string>();

    override dispose(): void {
        this.clear();
    }

    size() {
        return this._cacheItems.size;
    }

    getDependencyMap() {
        return this._dependencyMap;
    }

    getDependencyTree(id: string) {
        return this._dependencyMap.get(id);
    }

    get length() {
        return this._cacheItems.size;
    }

    add(unitRangeWithToken: IUnitRangeWithToken, tree: FormulaDependencyTree) {
        const { token } = unitRangeWithToken;
        if (!this._cacheItems.has(token)) {
            this._cacheItems.set(token, {
                unitRangeWithToken,
                treeList: [tree],
                ids: new Set<string>([tree.id]),
            });
            return;
        }

        const cacheItem = this._cacheItems.get(token)!;
        cacheItem.treeList.push(tree);
        cacheItem.ids.add(tree.id);

        const { gridRange } = unitRangeWithToken;

        const { range } = gridRange;
        if (!(range.startRow === range.endRow && range.startColumn === range.endColumn)) {
            this._rangeTokens.add(token);
        }
    }

    addDependencyMap(tree: FormulaDependencyTree) {
        this._dependencyMap.set(tree.id, tree);
    }

    updateParent(tree: FormulaDependencyTree) {
        const ids = new Set<string>();
        const unitId = tree.unitId;
        const sheetId = tree.subUnitId;
        const testCacheItems = this._cacheItems.get(tree.anchorToken);

        if (testCacheItems) {
            this._parentIdMap.set(tree.id, [...testCacheItems.ids]);
            return;
        }
        for (const token of this._rangeTokens) {
            const cacheItem = this._cacheItems.get(token);
            if (cacheItem) {
                const { unitRangeWithToken, treeList } = cacheItem;
                const { gridRange } = unitRangeWithToken;
                if (gridRange.unitId === unitId && gridRange.sheetId === sheetId && tree.inRangeData(gridRange.range)) {
                    for (const tree of treeList) {
                        ids.add(tree.id);
                    }
                }
            }
        }
        this._parentIdMap.set(tree.id, [...ids]);
    }

    clear() {
        this._cacheItems.clear();
        this._map.clear();
        this._dependencyMap.clear();
    }

    remove(token: string, tree: FormulaDependencyTree) {
        if (!this._cacheItems.has(token)) {
            return;
        }

        const cacheItem = this._cacheItems.get(token)!;
        const index = cacheItem.treeList.indexOf(tree);
        if (index !== -1) {
            cacheItem.treeList.splice(index, 1);
        }
    }

    delete(token: string) {
        this._cacheItems.delete(token);
    }

    getDependencyId(dependenceTree: FormulaDependencyTree, ids: Set<string>) {
        const parentIdList = this._parentIdMap.get(dependenceTree.id);
        if (parentIdList) {
            const list = [...parentIdList];
            for (const parentId of list) {
                ids.add(parentId);
                const tree = this._dependencyMap.get(parentId);
                if (tree && parentId !== dependenceTree.id) {
                    this.getDependencyId(tree, ids);
                }
            }
        }
    }

    /**
     * Determine whether range is dependent on other trees.
     * @param dependenceTree
     */

    dependencyUseParentId(dependenceTree: FormulaDependencyTree) {
        let ids = new Set<string>();

        this.getDependencyId(dependenceTree, ids);
        for (const parentId of ids) {
            const tree = this._dependencyMap.get(parentId);
            if (tree) {
                const notExist = tree.hasChild(dependenceTree);
                if (notExist && tree.rangeList) {
                    for (const rangeItem of tree.rangeList) {
                        if (rangeItem.gridRange.unitId === dependenceTree.unitId && rangeItem.gridRange.sheetId === dependenceTree.subUnitId) {
                            tree.pushChildren(dependenceTree);
                            break;
                        }
                    }
                }
            }

            if (tree && !tree.hasChild(dependenceTree)) {
                tree.pushChildren(dependenceTree);
            }
        }
        ids.clear();

        // @ts-ignore
        ids = null;
    }

    /**
     * Determine whether range is dependent on other trees.
     * @param dependenceTree
     */
    dependency(dependenceTree: FormulaDependencyTree) {
        this._cacheItems.forEach((cacheItem) => {
            const { unitRangeWithToken, treeList } = cacheItem;
            const { gridRange } = unitRangeWithToken;
            const { unitId, sheetId, range } = gridRange;

            if (
                dependenceTree.unitId === unitId &&
                dependenceTree.subUnitId === sheetId &&
                dependenceTree.inRangeData(range)
            ) {
                treeList.forEach((tree) => {
                    if (tree === dependenceTree || tree.children.includes(dependenceTree)) {
                        return true;
                    }
                    tree.pushChildren(dependenceTree);
                });
            }
        });
    }
}
