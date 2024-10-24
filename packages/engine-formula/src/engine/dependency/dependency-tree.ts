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

import type { IRange, IRTreeItem, IUnitRange, Nullable } from '@univerjs/core';
import type {
    IDirtyUnitSheetNameMap,
    IFeatureDirtyRangeType,
    IRuntimeUnitDataType,
    IUnitExcludedCell,
} from '../../basics/common';

import type { IFormulaDirtyData } from '../../services/current-data.service';
import type { IAllRuntimeData } from '../../services/runtime.service';

import type { IExecuteAstNodeData } from '../utils/ast-node-tool';
import { generateRandomId } from '@univerjs/core';

export enum FDtreeStateType {
    DEFAULT,
    ADDED,
    SKIP,
}

// export interface IUnitRangeWithToken {
//     gridRange: IUnitRange;
//     token: string;
// }

/**
 * A dependency tree, capable of calculating mutual dependencies,
 * is used to determine the order of formula calculations.
 */
export class FormulaDependencyTree {
    treeId: string = '';

    nodeData: Nullable<IExecuteAstNodeData>;

    children: Set<string> = new Set();

    parents: Set<string> = new Set();

    formula: string = '';

    row: number = -1;

    column: number = -1;

    rowCount: number = Number.NEGATIVE_INFINITY;

    columnCount: number = Number.NEGATIVE_INFINITY;

    subUnitId: string = '';

    unitId: string = '';

    rangeList: IUnitRange[] = [];

    formulaId: Nullable<string>;

    featureId: Nullable<string>;

    isCache: boolean = false;

    constructor(treeId?: string) {
        if (treeId != null) {
            this.treeId = treeId;
        } else {
            this.treeId = generateRandomId(8);
        }
    }

    toJson() {
        return {
            formula: this.formula,
            row: this.row,
            column: this.column,
            subUnitId: this.subUnitId,
            unitId: this.unitId,
            formulaId: this.formulaId,
            featureId: this.featureId,
        };
    }

    getDirtyData: Nullable<
        (dirtyData: IFormulaDirtyData, runtimeData: IAllRuntimeData) => {
            runtimeCellData: IRuntimeUnitDataType;
            dirtyRanges: IFeatureDirtyRangeType;
        }
    >;

    private _state = FDtreeStateType.DEFAULT;

    dispose(): void {
        // this.children.forEach((tree) => {
        //     tree.dispose();
        // });

        this.children.clear();

        this.rangeList = [];

        this.parents.clear();

        this.nodeData?.node.dispose();

        this.nodeData = null;
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

    dependencySheetName(dirtyUnitSheetNameMap?: IDirtyUnitSheetNameMap) {
        if (this.rangeList.length === 0 || dirtyUnitSheetNameMap == null) {
            return false;
        }

        for (let r = 0, len = this.rangeList.length; r < len; r++) {
            const unitRange = this.rangeList[r];
            const { unitId, sheetId } = unitRange;

            /**
             * When a worksheet is inserted or deleted,
             * the formulas that depend on these worksheets need to be calculated.
             */
            if (dirtyUnitSheetNameMap[unitId]?.[sheetId] != null) {
                return true;
            }
        }

        return false;
    }

    isExcludeRange(unitExcludedCell: Nullable<IUnitExcludedCell>) {
        if (this.rangeList.length === 0) {
            return false;
        }

        for (let r = 0, len = this.rangeList.length; r < len; r++) {
            const unitRange = this.rangeList[r];
            const { unitId, sheetId, range } = unitRange;

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

            let isInclude = false;

            excludedCell?.forValue((row, column) => {
                if (row >= rangeStartRow && row <= rangeEndRow && column >= rangeStartColumn && column <= rangeEndColumn) {
                    isInclude = true;
                    return false;
                }
            });

            if (isInclude) {
                return true;
            }
        }
        return false;
    }

    pushChildren(tree: FormulaDependencyTree) {
        this.children.add(tree.treeId);
        tree._pushParent(this);
    }

    /**
     * Add the range corresponding to the current ast node.
     * @param range
     */
    pushRangeList(ranges: IUnitRange[]) {
        this.rangeList.push(...ranges);
    }

    hasChildren(treeId: string) {
        return this.children.has(treeId);
    }

    toRTreeItem(): IRTreeItem {
        return {
            unitId: this.unitId,
            sheetId: this.subUnitId,
            range: {
                startRow: this.row,
                startColumn: this.column,
                endRow: this.row,
                endColumn: this.column,
            },
            id: this.treeId,
        };
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
            const unitId = unitRange.unitId;
            const sheetId = unitRange.sheetId;
            const range = unitRange.range;

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
        this.parents.add(tree.treeId);
    }
}
