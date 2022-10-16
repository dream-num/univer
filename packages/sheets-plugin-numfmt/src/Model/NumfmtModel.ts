import { ObjectMatrix, ObjectMatrixPrimitiveType } from '@univer/core';
import { numfmt } from '@univer/base-numfmt-engine';

export interface NumfmtValue {
    numfmt: string;

    color: string;

    value: string;

    change: boolean;
}

export class NumfmtModel {
    protected _matrix: ObjectMatrix<NumfmtValue>;

    protected _calculate(primeval: NumfmtValue): void {
        if (primeval.change) {
            const formatter = numfmt(primeval.numfmt);
            primeval.value = formatter(primeval.value);
            primeval.color = formatter.color(primeval.value);
            primeval.change = false;
        }
    }

    constructor() {
        this._matrix = new ObjectMatrix<NumfmtValue>();
    }

    getNumfmtConfig(): ObjectMatrixPrimitiveType<NumfmtValue> {
        return this._matrix.toJSON();
    }

    setNumfmtValue(row: number, column: number, value: string): void {
        this._matrix.setValue(row, column, {
            numfmt: value,
            change: true,
            value: String(),
            color: String(),
        });
    }

    getNumfmtValue(row: number, column: number): string {
        const primeval = this._matrix.getValue(row, column);
        if (primeval) {
            this._calculate(primeval);
            return primeval.value;
        }
        return String();
    }

    getNumfmtColor(row: number, column: number): string {
        const primeval = this._matrix.getValue(row, column);
        if (primeval) {
            this._calculate(primeval);
            return primeval.color;
        }
        return String();
    }
}
