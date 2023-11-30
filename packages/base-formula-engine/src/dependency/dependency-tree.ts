import { Disposable, IRange, IUnitRange, Nullable } from '@univerjs/core';

import { BaseAstNode } from '../ast-node/base-ast-node';
import { IUnitExcludedCell } from '../basics/common';

export enum FDtreeStateType {
    DEFAULT,
    ADDED,
    SKIP,
}

export class FormulaDependencyTree extends Disposable {
    node: Nullable<BaseAstNode>;

    children: FormulaDependencyTree[] = [];

    parents: FormulaDependencyTree[] = [];

    formula: string = '';

    row: number = -1;

    column: number = -1;

    subComponentId: string = '';

    unitId: string = '';

    rangeList: IUnitRange[] = [];

    formulaId: Nullable<string>;

    private _state = FDtreeStateType.DEFAULT;

    override dispose(): void {
        this.children.forEach((tree) => {
            tree.dispose();
        });
        this.rangeList = [];

        this.parents = [];

        this.node?.dispose();
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

    compareRangeData(range: IRange) {
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
     * @returns
     */
    dependencyRange(
        dependencyRangeList: Map<string, Map<string, IRange[]>>,
        unitExcludedCell: Nullable<IUnitExcludedCell>
    ) {
        if (this.rangeList.length === 0) {
            return false;
        }

        for (let r = 0, len = this.rangeList.length; r < len; r++) {
            const unitRange = this.rangeList[r];
            const unitId = unitRange.unitId;
            const sheetId = unitRange.sheetId;
            const range = unitRange.range;

            if (!dependencyRangeList.has(unitId)) {
                continue;
            }

            const sheetRangeMap = dependencyRangeList.get(unitId)!;

            if (!sheetRangeMap.has(sheetId)) {
                continue;
            }

            const dependencyRanges = sheetRangeMap.get(sheetId)!;

            const excludedCell = unitExcludedCell?.[unitId]?.[sheetId];

            for (const dependencyRange of dependencyRanges) {
                const { startRow, startColumn, endRow, endColumn } = dependencyRange;

                if (
                    range.startRow > endRow ||
                    range.endRow < startRow ||
                    range.startColumn > endColumn ||
                    range.endColumn < startColumn
                ) {
                    continue;
                } else {
                    let isInclude = true;
                    /**
                     * The position of the primary cell in the array formula needs to be excluded when calculating the impact of the array formula on dependencies.
                     * This is because its impact was already considered during the first calculation.
                     */
                    excludedCell?.forValue((row, column) => {
                        if (
                            row >= range.startRow &&
                            row <= range.endRow &&
                            column >= range.startColumn &&
                            column <= range.endColumn
                        ) {
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
    }

    /**
     * Add the range corresponding to the current ast node.
     * @param range
     */
    pushRangeList(range: IUnitRange) {
        this.rangeList.push(range);
    }

    /**
     * Determine whether it is dependent on other trees.
     * @param dependenceTree
     * @returns
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
                dependenceTree.subComponentId === sheetId &&
                dependenceTree.compareRangeData(range)
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
