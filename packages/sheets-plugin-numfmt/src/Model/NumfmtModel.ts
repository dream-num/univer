import { Nullable, ObjectMatrix } from '@univer/core';
import { numfmt } from '@univer/base-numfmt-engine';

export class NumfmtValue {
    _numfmt: string;

    _color: string;

    _value: string;

    _status: boolean;

    constructor(numfmt: string) {
        this._numfmt = numfmt;
        this._status = true;
        this._value = String();
        this._color = String();
    }

    calculate(): void {
        if (this._status) {
            const formatter = numfmt(this._numfmt);
            this._value = formatter(this._value);
            this._color = formatter.color(this._value);
            this._status = false;
        }
    }

    getValue(): string {
        this.calculate();
        return this._value;
    }

    getColor(): string {
        this.calculate();
        return this._color;
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
