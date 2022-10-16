import { Plugin } from '@univer/core';
import { NumfmtModel, NumfmtValue } from '../Model/NumfmtModel';

export class NumfmtController {
    protected _model: NumfmtModel;

    protected _plugin: Plugin;

    constructor(plugin: Plugin) {
        this._model = new NumfmtModel();
        this._plugin = plugin;
    }

    getColor(row: number, column: number): string {
        const numfmt = this._model.getNumfmtValue(row, column);
        return numfmt ? numfmt.getColor() : String();
    }

    getValue(row: number, column: number): string {
        const numfmt = this._model.getNumfmtValue(row, column);
        return numfmt ? numfmt.getValue() : String();
    }

    setNumfmt(row: number, column: number, numfmt: string): void {
        this._model.setNumfmtValue(row, column, new NumfmtValue(numfmt));
    }
}
