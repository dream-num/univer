import { ActionExtensionManager, Context, IRangeData, Plugin } from '@univer/core';
import { NUMFMT_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { NumfmtController } from './Controller/NumfmtController';
import { NumfmtActionExtensionFactory } from './NumfmtActionExtensionFactory';

export class NumfmtPlugin extends Plugin {
    protected _controller: NumfmtController;

    constructor() {
        super(NUMFMT_PLUGIN_NAME);
    }

    onMounted(context: Context): void {
        this._controller = new NumfmtController(this);
    }

    intercepted(): void {
        const register = ActionExtensionManager.create();
        register.add(new NumfmtActionExtensionFactory(this));
    }

    setNumfmtByRange(sheetId: string, range: IRangeData, format: string): void {
        this._controller.setNumfmtByRange(sheetId, range, format);
    }

    setNumfmtByCoords(sheetId: string, row: number, column: number, format: string): void {
        this._controller.setNumfmtByCoords(sheetId, row, column, format);
    }
}
