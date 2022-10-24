import { IGridRange, IRangeData, ObjectMatrix } from '@univer/core';
import { generateAstNode } from '../Analysis/Tools';
import { FormulaDataType, IInterpreterDatasetConfig } from '../Basics/Common';
import { Interpreter } from '../Interpreter/Interpreter';
import { FormulaDependencyTree } from './DependencyTree';

export class FormulaDependencyGenerator {
    private _updateRangeFlattenCache = new Map<string, ObjectMatrix<boolean>>();

    constructor(private _formulaData: FormulaDataType) {}

    updateRangeFlatten(updateRangeList: IGridRange[]) {
        for (let i = 0; i < updateRangeList.length; i++) {
            const gridRange = updateRangeList[i];
            const range = gridRange.rangeData;
            const sheetId = gridRange.sheetId;

            this._addFlattenCache(sheetId, range);
        }
    }

    private _addFlattenCache(sheetId: string, rangeData: IRangeData) {
        let matrix = this._updateRangeFlattenCache.get(sheetId);
        if (!matrix) {
            matrix = new ObjectMatrix<boolean>();
            this._updateRangeFlattenCache.set(sheetId, matrix);
        }

        // don't use destructuring assignment
        const startRow = rangeData.startRow;

        const startColumn = rangeData.startColumn;

        const endRow = rangeData.endRow;

        const endColumn = rangeData.endColumn;

        // don't use chained calls
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                matrix.setValue(r, c, true);
            }
        }
    }

    private _getRangeListByNode() {}

    generate(updateRangeList: IGridRange[] = [], interpreterDatasetConfig?: IInterpreterDatasetConfig) {
        this.updateRangeFlatten(updateRangeList);

        const FDtree = new FormulaDependencyTree();

        const formulaInterpreter = Interpreter.create(interpreterDatasetConfig);

        const formulaDataKeys = Object.keys(this._formulaData);

        for (let sheetId of formulaDataKeys) {
            const matrixData = new ObjectMatrix(this._formulaData[sheetId]);

            matrixData.forEach((row, rangeRow) => {
                rangeRow.forEach((column, formulaData) => {
                    const formulaString = formulaData.formula;
                    const node = generateAstNode(formulaString);
                });
            });
        }
    }

    static create(formulaData: FormulaDataType) {
        return new FormulaDependencyGenerator(formulaData);
    }
}
