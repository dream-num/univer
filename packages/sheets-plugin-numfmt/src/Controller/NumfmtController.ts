import { Command, ObjectMatrixPrimitiveType, Plugin } from '@univer/core';
import { ACTION_NAMES } from '../Const';
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

    setNumfmtByCoords(sheetId: string, row: number, column: number, numfmt: string): void {
        const pluginContext = this._plugin.getContext();
        const commandManager = pluginContext.getCommandManager();
        const config = {
            actionName: ACTION_NAMES.SET_NUMFMT_ACTION,
            sheetId,
            row,
            column,
            numfmt,
        };
        const command = new Command(pluginContext.getWorkBook(), config);
        commandManager.invoke(command);
    }
}
