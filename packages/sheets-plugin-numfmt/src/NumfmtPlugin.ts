import { Context, IRangeData, Plugin } from '@univer/core';
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

    intercepted(): void {}

    setNumfmtByRange(sheetId: string, range: IRangeData, format: string): void {}

    setNumfmtByCoords(row: number, column: number, format: string): void {}
}
