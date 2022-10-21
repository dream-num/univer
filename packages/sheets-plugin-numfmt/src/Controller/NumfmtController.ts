import { Command, Range, IRangeData, ObjectMatrix, Plugin } from '@univer/core';
import { ACTION_NAMES } from '../Const';
import { NumfmtModel } from '../Model/NumfmtModel';

export class NumfmtController {
    protected _model: NumfmtModel;

    protected _plugin: Plugin;

    constructor(plugin: Plugin) {
        this._model = new NumfmtModel();
        this._plugin = plugin;
    }

    setNumfmtByRange(sheetId: string, numfmtRange: IRangeData, numfmtValue: string): void {
        const numfmtMatrix = new ObjectMatrix<string>();
        Range.foreach(numfmtRange, (row, column) => {
            numfmtMatrix.setValue(row, column, numfmtValue);
        });
        this._model.setNumfmtMatrix(sheetId, numfmtMatrix);
        const pluginContext = this._plugin.getContext();
        const commandManager = pluginContext.getCommandManager();
        const config = {
            actionName: ACTION_NAMES.SET_NUMFMT_RANGE_ACTION,
            sheetId,
            numfmtMatrix,
            numfmtValue,
        };
        const command = new Command(pluginContext.getWorkBook(), config);
        commandManager.invoke(command);
    }

    setNumfmtByCoords(sheetId: string, row: number, column: number, numfmt: string): void {
        this._model.setNumfmtCoords(sheetId, row, column, numfmt);
        const pluginContext = this._plugin.getContext();
        const commandManager = pluginContext.getCommandManager();
        const config = {
            actionName: ACTION_NAMES.SET_NUMFMT_COORDS_ACTION,
            sheetId,
            row,
            column,
            numfmt,
        };
        const command = new Command(pluginContext.getWorkBook(), config);
        commandManager.invoke(command);
    }
}
