import { NumfmtModel, NumfmtValue } from '../Model/NumfmtModel';

export class NumfmtController {
    protected _model: NumfmtModel;

    constructor() {
        this._model = new NumfmtModel();
    }

    setNumfmt(row: number, column: number, numfmt: string): void {
        this._model.setNumfmtValue(row, column, new NumfmtValue(numfmt));
    }

    getColor(row: number, column: number): string {
        const numfmt = this._model.getNumfmtValue(row, column);
        return numfmt ? numfmt.getColor() : '';
    }

    getValue(row: number, column: number): string {
        const numfmt = this._model.getNumfmtValue(row, column);
        return numfmt ? numfmt.getValue() : '';
    }
}
