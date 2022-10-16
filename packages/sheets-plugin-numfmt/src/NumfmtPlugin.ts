import { Context, Plugin } from '@univer/core';
import { NUMFMT_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { NumfmtController } from './Controller/NumfmtController';

export class NumfmtPlugin extends Plugin {
    protected _controller: NumfmtController;

    constructor() {
        super(NUMFMT_PLUGIN_NAME);
    }

    onMounted(ctx: Context): void {
        this._controller = new NumfmtController(this);
    }

    getValue(row: number, column: number): string {
        return this._controller.getValue(row, column);
    }

    getColor(row: number, column: number): string {
        return this._controller.getColor(row, column);
    }

    setNumfmt(row: number, column: number, numfmt: string): void {
        this._controller.setNumfmt(row, column, numfmt);
    }
}
