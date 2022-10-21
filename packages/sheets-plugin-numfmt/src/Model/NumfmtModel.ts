import { ObjectMatrix } from '@univer/core';

export class NumfmtModel {
    protected _sheetNumfmtMatrix: Map<string, ObjectMatrix<string>>;

    protected _fromMatrix(sheetId: string): ObjectMatrix<string> {
        let sheetNumfmtMatrix = this._sheetNumfmtMatrix.get(sheetId);
        if (sheetNumfmtMatrix) {
            return sheetNumfmtMatrix;
        }
        sheetNumfmtMatrix = new ObjectMatrix<string>();
        this._sheetNumfmtMatrix.set(sheetId, sheetNumfmtMatrix);
        return sheetNumfmtMatrix;
    }

    constructor() {
        this._sheetNumfmtMatrix = new Map();
    }

    setNumfmtMatrix(sheetId: string, matrix: ObjectMatrix<string>): void {
        const numfmtMatrix = this._fromMatrix(sheetId);
        matrix.forValue((row: number, col: number, numfmt) => {
            numfmtMatrix.setValue(row, col, numfmt);
        });
    }

    setNumfmtCoords(sheetId: string, row: number, col: number, numfmt: string): void {
        const numfmtMatrix = this._fromMatrix(sheetId);
        numfmtMatrix.setValue(row, col, numfmt);
    }
}
