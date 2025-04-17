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

import type { IRange, IUnitRange, Nullable } from '@univerjs/core';
import type {
    IDirtyUnitSheetNameMap,
    IFeatureDirtyRangeType,
    IRuntimeUnitDataType,
    IUnitExcludedCell,
} from '../../basics/common';
import type { IFormulaDirtyData } from '../../services/current-data.service';

import type { IAllRuntimeData } from '../../services/runtime.service';
import type { AstRootNode, FunctionNode } from '../ast-node';
import { moveRangeByOffset } from '@univerjs/core';

export enum FDtreeStateType {
    DEFAULT,
    ADDED,
    SKIP,
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

class FormulaDependencyTreeCalculator {
    private _state = FDtreeStateType.DEFAULT;

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

    treeId: number;

    children: Set<number> = new Set();

    parents: Set<number> = new Set();

    pushChildren(tree: FormulaDependencyTreeCalculator) {
        this.children.add(tree.treeId);
        tree._pushParent(this);
    }

    hasChildren(treeId: number) {
        return this.children.has(treeId);
    }

    private _pushParent(tree: FormulaDependencyTreeCalculator) {
        this.parents.add(tree.treeId);
    }
}

type GetDirtyDataType = Nullable<
    (dirtyData: IFormulaDirtyData, runtimeData: IAllRuntimeData) => {
        runtimeCellData: IRuntimeUnitDataType;
        dirtyRanges: IFeatureDirtyRangeType;
    }
>;
export type IFormulaDependencyTree = FormulaDependencyTree | FormulaDependencyTreeVirtual;

export class FormulaDependencyTreeVirtual extends FormulaDependencyTreeCalculator {
    refTree: Nullable<FormulaDependencyTree>;
    refOffsetX: number = -1;
    refOffsetY: number = -1;
    isCache: boolean = false;
    isDirty: boolean = false;

    addressFunctionNodes: FunctionNode[] = [];

    get isVirtual() {
        return true;
    }

    get row() {
        if (this.refTree == null) {
            return -1;
        }
        return this.refTree.row + this.refOffsetY;
    }

    get column() {
        if (this.refTree == null) {
            return -1;
        }
        return this.refTree.column + this.refOffsetX;
    }

    get rowCount() {
        if (this.refTree == null) {
            return 0;
        }
        return this.refTree.rowCount;
    }

    get columnCount() {
        if (this.refTree == null) {
            return 0;
        }
        return this.refTree.columnCount;
    }

    get unitId() {
        if (this.refTree == null) {
            return '';
        }
        return this.refTree.unitId;
    }

    get subUnitId() {
        if (this.refTree == null) {
            return '';
        }
        return this.refTree.subUnitId;
    }

    get formula() {
        return this.refTree?.formula ?? '';
    }

    get nodeData() {
        return {
            node: this.node,
            refOffsetX: this.refOffsetX,
            refOffsetY: this.refOffsetY,
        };
    }

    get node() {
        return this.refTree?.node;
    }

    dispose() {
        this.refTree = null;
    }

    get rangeList() {
        const unitRangeList = [];
        if (this.refTree == null) {
            return [];
        }
        for (let i = 0; i < this.refTree.rangeList.length; i++) {
            const range = this.refTree.rangeList[i];
            unitRangeList.push({
                unitId: range.unitId,
                sheetId: range.sheetId,
                range: moveRangeByOffset(range.range, this.refOffsetX, this.refOffsetY),
            });
        }
        return unitRangeList;
    }

    toRTreeItem(): IUnitRange[] {
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

    inRangeData(range: IRange) {
        const startRow = range.startRow;
        const startColumn = range.startColumn;
        const endRow = range.endRow;
        const endColumn = range.endColumn;

        const currentRow = this.row;
        const currentColumn = this.column;

        if (currentRow < startRow || currentRow > endRow || currentColumn < startColumn || currentColumn > endColumn) {
            return false;
        }

        return true;
    }

    dependencySheetName(dirtyUnitSheetNameMap?: IDirtyUnitSheetNameMap) {
        if (this.refTree == null) {
            return false;
        }
        return this.refTree.dependencySheetName(dirtyUnitSheetNameMap);
    }

    isExcludeRange(unitExcludedCell: Nullable<IUnitExcludedCell>) {
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

    getDirtyData: GetDirtyDataType;

    featureId: Nullable<string>;
    get formulaId() {
        if (this.refTree == null) {
            return '';
        }
        return this.refTree.formulaId;
    }
}

/**
 * A dependency tree, capable of calculating mutual dependencies,
 * is used to determine the order of formula calculations.
 */
export class FormulaDependencyTree extends FormulaDependencyTreeCalculator {
    isCache: boolean = false;

    featureId: Nullable<string>;
    featureDirtyRanges: IUnitRange[] = [];

    refOffsetX: number = 0;
    refOffsetY: number = 0;

    type: FormulaDependencyTreeType = FormulaDependencyTreeType.NORMAL_FORMULA;

    formulaId: Nullable<string>;

    subUnitId: string = '';

    unitId: string = '';

    rangeList: IUnitRange[] = [];

    formula: string = '';

    row: number = -1;

    column: number = -1;

    rowCount: number = Number.NEGATIVE_INFINITY;

    columnCount: number = Number.NEGATIVE_INFINITY;

    isDirty: boolean = false;

    node: Nullable<AstRootNode>;

    addressFunctionNodes: FunctionNode[] = [];

    constructor(treeId: number) {
        super();
        this.treeId = treeId;
    }

    get isVirtual() {
        return false;
    }

    get nodeData() {
        return {
            node: this.node,
            refOffsetX: 0,
            refOffsetY: 0,
        };
    }

    toJson() {
        return {
            formula: this.formula,
            refOffsetX: this.refOffsetX,
            refOffsetY: this.refOffsetY,
        };
    }

    getDirtyData: GetDirtyDataType;

    dispose(): void {
        this.featureDirtyRanges = [];

        this.rangeList = [];

        this.addressFunctionNodes = [];

        // this.nodeData?.node.dispose();

        this.getDirtyData = null;
    }

    inRangeData(range: IRange) {
        const startRow = range.startRow;
        const startColumn = range.startColumn;
        const endRow = range.endRow;
        const endColumn = range.endColumn;

        const currentRow = this.row;
        const currentColumn = this.column;

        if (currentRow < startRow || currentRow > endRow || currentColumn < startColumn || currentColumn > endColumn) {
            return false;
        }

        return true;
    }

    dependencySheetName(dirtyUnitSheetNameMap?: IDirtyUnitSheetNameMap) {
        const rangeList = this.rangeList;

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
        this.rangeList.push(...ranges);
    }

    shouldBePushRangeList() {
        return this.rangeList.length === 0 && this.type !== FormulaDependencyTreeType.FEATURE_FORMULA;
    }

    // hasChildren(treeId: number) {
    //     return this.children.has(treeId);
    // }

    toRTreeItem(): IUnitRange[] {
        if (this.featureId != null) {
            return this.featureDirtyRanges;
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
