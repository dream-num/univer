import { Context, Plugin } from '@univer/core';
import { NUMFMT_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { NumfmtController } from './Controller/NumfmtController';

export class NumfmtPlugin extends Plugin {
    protected _controller: NumfmtController;

    constructor() {
        super(NUMFMT_PLUGIN_NAME);
    }

    onMounted(context: Context): void {
        this._controller = new NumfmtController(this);
    }

    getConfig(sheetId: string) {
        this._controller.getConfig(sheetId);
    }

    getValue(sheetId: string, row: number, column: number): string {
        return this._controller.getValue(sheetId, row, column);
    }

    getColor(sheetId: string, row: number, column: number): string {
        return this._controller.getColor(sheetId, row, column);
    }

    setNumfmt(sheetId: string, row: number, column: number, numfmt: string): void {
        this._controller.setNumfmt(sheetId, row, column, numfmt);
    }
}
