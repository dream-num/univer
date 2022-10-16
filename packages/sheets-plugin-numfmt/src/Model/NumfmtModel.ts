import { ObjectMatrix, ObjectMatrixPrimitiveType } from '@univer/core';
import { numfmt } from '@univer/base-numfmt-engine';

export interface NumfmtValue {
    numfmt: string;
    color: string;
    value: string;
    change: boolean;
}

export class NumfmtModel {
    protected _sheetNumfmtMatrix: Map<string, ObjectMatrix<NumfmtValue>>;

    protected _calculate(primeval: NumfmtValue): void {
        if (primeval.change) {
            const formatter = numfmt(primeval.numfmt);
            primeval.value = formatter(primeval.value);
            primeval.color = formatter.color(primeval.value);
            primeval.change = false;
        }
    }

    protected _fmtMatrix(sheetId: string): ObjectMatrix<NumfmtValue> {
        let sheetNumfmtMatrix = this._sheetNumfmtMatrix.get(sheetId);
        if (sheetNumfmtMatrix) {
            return sheetNumfmtMatrix;
        }
        sheetNumfmtMatrix = new ObjectMatrix<NumfmtValue>();
        this._sheetNumfmtMatrix.set(sheetId, sheetNumfmtMatrix);
        return sheetNumfmtMatrix;
    }

    constructor() {
        this._sheetNumfmtMatrix = new Map();
    }

    getNumfmtValue(sheetId: string, row: number, column: number): string {
        const primeval = this._fmtMatrix(sheetId).getValue(row, column);
        if (primeval) {
            this._calculate(primeval);
            return primeval.value;
        }
        return String();
    }

    getNumfmtColor(sheetId: string, row: number, column: number): string {
        const primeval = this._fmtMatrix(sheetId).getValue(row, column);
        if (primeval) {
            this._calculate(primeval);
            return primeval.color;
        }
        return String();
    }

    getNumfmtConfig(sheetId: string): ObjectMatrixPrimitiveType<NumfmtValue> {
        return this._fmtMatrix(sheetId).toJSON();
    }
}
