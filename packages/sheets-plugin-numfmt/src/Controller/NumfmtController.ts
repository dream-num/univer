import { ObjectMatrixPrimitiveType, Plugin } from '@univer/core';
import { NumfmtModel, NumfmtValue } from '../Model/NumfmtModel';

export class NumfmtController {
    protected _model: NumfmtModel;

    protected _plugin: Plugin;

    constructor(plugin: Plugin) {
        this._model = new NumfmtModel();
        this._plugin = plugin;
    }

    getConfig(): ObjectMatrixPrimitiveType<NumfmtValue> {
        return this._model.getNumfmtConfig();
    }

    getColor(row: number, column: number): string {
        return this._model.getNumfmtColor(row, column);
    }

    getValue(row: number, column: number): string {
        return this._model.getNumfmtValue(row, column);
    }

    setNumfmt(row: number, column: number, numfmt: string): void {
        this._model.setNumfmtValue(row, column, numfmt);
    }
}
