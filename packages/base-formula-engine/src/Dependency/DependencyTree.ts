import { IRange, IUnitRange, Nullable } from '@univerjs/core';

import { BaseAstNode } from '../AstNode/BaseAstNode';
import { IFormulaData } from '../Basics/Common';

export enum FDtreeStateType {
    DEFAULT,
    ADDED,
    SKIP,
}

export class FormulaDependencyTree implements IFormulaData {
    node: Nullable<BaseAstNode>;

    children: FormulaDependencyTree[] = [];

    parents: FormulaDependencyTree[] = [];

    formula: string = '';

    row: number = -1;

    column: number = -1;

    sheetId: string = '';

    unitId: string = '';

    rangeList: IUnitRange[] = [];

    private _state = FDtreeStateType.DEFAULT;

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

    dependencyRange(dependencyRangeList: Map<string, Map<string, IRange>>) {
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

            const dependencyRange = sheetRangeMap.get(sheetId)!;

            const { startRow, startColumn, endRow, endColumn } = dependencyRange;

            if (
                range.startRow > endRow ||
                range.endRow < startRow ||
                range.startColumn > endColumn ||
                range.endColumn < startColumn
            ) {
                continue;
            } else {
                return true;
            }
        }

        return false;
    }

    pushChildren(tree: FormulaDependencyTree) {
        this.children.push(tree);
        tree._pushParent(this);
    }

    pushRangeList(range: IUnitRange) {
        this.rangeList.push(range);
    }

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
                dependenceTree.sheetId === sheetId &&
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
