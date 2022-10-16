import { ObjectMatrixPrimitiveType, Plugin } from '@univer/core';
import { NumfmtModel, NumfmtValue } from '../Model/NumfmtModel';

export class NumfmtController {
    protected _model: NumfmtModel;

    protected _plugin: Plugin;

    constructor(plugin: Plugin) {
        this._model = new NumfmtModel();
        this._plugin = plugin;
    }

    getConfig(sheetId: string): ObjectMatrixPrimitiveType<NumfmtValue> {
        return this._model.getNumfmtConfig(sheetId);
    }

    getColor(sheetId: string, row: number, column: number): string {
        return this._model.getNumfmtColor(sheetId, row, column);
    }

    getValue(sheetId: string, row: number, column: number): string {
        return this._model.getNumfmtValue(sheetId, row, column);
    }

    setNumfmt(sheetId: string, row: number, column: number, numfmt: string): void {
        this._model.setNumfmtValue(sheetId, row, column, numfmt);
    }
}
