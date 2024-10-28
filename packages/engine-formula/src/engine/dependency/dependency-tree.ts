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

import type {
    IDirtyUnitSheetNameMap,
    IFeatureDirtyRangeType,
    IRuntimeUnitDataType,
    IUnitExcludedCell,
} from '../../basics/common';
import type { IFormulaDirtyData } from '../../services/current-data.service';
import type { IAllRuntimeData } from '../../services/runtime.service';

import type { AstRootNode } from '../ast-node/ast-root-node';
import type { IExecuteAstNodeData } from '../utils/ast-node-tool';

import { type IRange, type IUnitRange, moveRangeByOffset, type Nullable } from '@univerjs/core';

export enum FDtreeStateType {
    DEFAULT,
    ADDED,
    SKIP,
}

export class FormulaDependencyTreeShareData {
    formulaId: Nullable<string>;

    subUnitId: string = '';

    unitId: string = '';

    node: Nullable<AstRootNode>;
    rangeList: IUnitRange[] = [];

    formula: string = '';

    row: number = -1;

    column: number = -1;

    rowCount: number = Number.NEGATIVE_INFINITY;

    columnCount: number = Number.NEGATIVE_INFINITY;

    dispose(): void {
        // this.children.forEach((tree) => {
        //     tree.dispose();
        // });

        this.rangeList = [];

        // this.nodeData?.node.dispose();

        this.node = null;
    }
}

export enum FormulaDependencyTreeType {
    NORMAL_FORMULA,
    OTHER_FORMULA,
    FEATURE_FORMULA,
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
    treeId: number = -1;

    featureId: Nullable<string>;
    featureDirtyRanges: IUnitRange[] = [];

    isCache: boolean = false;

    share: Nullable<FormulaDependencyTreeShareData>;

    refOffsetX: number = 0;
    refOffsetY: number = 0;

    type: FormulaDependencyTreeType = FormulaDependencyTreeType.NORMAL_FORMULA;

    constructor(treeId: number) {
        this.treeId = treeId;
    }

    get row() {
        if (this.share == null) {
            return -1;
        }
        return this.share.row + this.refOffsetY;
    }

    get column() {
        if (this.share == null) {
            return -1;
        }
        return this.share.column + this.refOffsetX;
    }

    get unitId() {
        return this.share?.unitId || '';
    }

    get subUnitId() {
        return this.share?.subUnitId || '';
    }

    get rowCount() {
        return this.share?.rowCount || Number.NEGATIVE_INFINITY;
    }

    get columnCount() {
        return this.share?.columnCount || Number.NEGATIVE_INFINITY;
    }

    get formulaId() {
        return this.share?.formulaId;
    }

    get formula() {
        return this.share?.formula || '';
    }

    get rangeList() {
        const rangeList = this.share?.rangeList || [];
        const results = [];
        for (let r = 0, len = rangeList.length; r < len; r++) {
            const unitRange = rangeList[r];
            const { unitId, sheetId, range } = unitRange;

            const newRange = moveRangeByOffset(range, this.refOffsetX, this.refOffsetY);

            results.push({
                unitId,
                sheetId,
                range: newRange,
            });
        }

        return results;
    }

    get nodeData(): IExecuteAstNodeData {
        return {
            node: this.share?.node,
            refOffsetX: this.refOffsetX,
            refOffsetY: this.refOffsetY,
        };
    }

    toJson() {
        return {
            formula: this.share?.formula,
            refOffsetX: this.refOffsetX,
            refOffsetY: this.refOffsetY,
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
        this.share = null;
        this.featureDirtyRanges = [];
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

        if (this.share == null) {
            return false;
        }

        const currentRow = this.share.row + this.refOffsetY;
        const currentColumn = this.share.column + this.refOffsetX;

        if (currentRow < startRow || currentRow > endRow || currentColumn < startColumn || currentColumn > endColumn) {
            return false;
        }

        return true;
    }

    dependencySheetName(dirtyUnitSheetNameMap?: IDirtyUnitSheetNameMap) {
        if (this.share == null) {
            return false;
        }

        const rangeList = this.share.rangeList;

        if (rangeList.length === 0 || dirtyUnitSheetNameMap == null) {
            return false;
        }

        for (let r = 0, len = rangeList.length; r < len; r++) {
            const unitRange = rangeList[r];
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
        if (this.share == null) {
            return false;
        }

        const rangeList = this.rangeList;

        if (rangeList.length === 0) {
            return false;
        }

        for (let r = 0, len = rangeList.length; r < len; r++) {
            const unitRange = rangeList[r];
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

    // pushChildren(tree: FormulaDependencyTree) {
    //     this.children.add(tree.treeId);
    //     tree._pushParent(this);
    // }

    /**
     * Add the range corresponding to the current ast node.
     * @param range
     */
    pushRangeList(ranges: IUnitRange[]) {
        this.share?.rangeList.push(...ranges);
    }

    shouldBePushRangeList() {
        return this.share?.rangeList.length === 0 && this.type !== FormulaDependencyTreeType.FEATURE_FORMULA;
    }

    // hasChildren(treeId: number) {
    //     return this.children.has(treeId);
    // }

    toRTreeItem(): IUnitRange[] {
        if (this.featureId != null) {
            return this.featureDirtyRanges;
        }

        if (this.share == null) {
            return [];
        }

        const currentRow = this.row;
        const currentColumn = this.column;

        return [{
            unitId: this.unitId,
            sheetId: this.subUnitId,
            range: {
                startRow: currentRow,
                startColumn: currentColumn,
                endRow: currentRow,
                endColumn: currentColumn,
            },
        }];
    }

    /**
     * Determine whether it is dependent on other trees.
     * @param dependenceTree
     */
    // dependency(dependenceTree: FormulaDependencyTree) {
    //     if (this.rangeList.length === 0) {
    //         return false;
    //     }

    //     for (let r = 0, len = this.rangeList.length; r < len; r++) {
    //         const unitRange = this.rangeList[r];
    //         const unitId = unitRange.unitId;
    //         const sheetId = unitRange.sheetId;
    //         const range = unitRange.range;

    //         if (
    //             dependenceTree.unitId === unitId &&
    //             dependenceTree.subUnitId === sheetId &&
    //             dependenceTree.inRangeData(range)
    //         ) {
    //             return true;
    //         }
    //     }

    //     return false;
    // }

    // private _pushParent(tree: FormulaDependencyTree) {
    //     this.parents.add(tree.treeId);
    // }
}
