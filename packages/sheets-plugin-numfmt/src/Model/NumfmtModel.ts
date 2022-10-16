import { Nullable, ObjectMatrix } from '@univer/core';
import { numfmt } from '@univer/base-numfmt-engine';

export class NumfmtValue {
    numfmt: string;

    color: string;

    value: string;

    status: boolean;

    constructor(numfmt: string) {
        this.numfmt = numfmt;
        this.value = '';
        this.color = '';
        this.status = true;
    }

    getValue() {
        this.calculate();
        return this.value;
    }

    getColor() {
        this.calculate();
        return this.color;
    }

    calculate(): void {
        if (this.status) {
            const formatter = numfmt(this.numfmt);
            this.value = formatter(this.value);
            this.color = formatter.color(this.value);
            this.status = false;
        }
    }
}

export class NumfmtModel {
    protected _matrix: ObjectMatrix<NumfmtValue>;

    constructor() {
        this._matrix = new ObjectMatrix<NumfmtValue>();
    }

    setNumfmtValue(row: number, column: number, numfmt: NumfmtValue): void {
        this._matrix.setValue(row, column, numfmt);
    }

    getNumfmtValue(row: number, column: number): Nullable<NumfmtValue> {
        return this._matrix.getValue(row, column);
    }
}
