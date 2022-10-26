import { ActionExtensionManager, Context, IRangeData, ObjectMatrixPrimitiveType, Plugin } from '@univer/core';
import { NUMFMT_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { NumfmtController } from './Controller/NumfmtController';
import { NumfmtActionExtensionFactory } from './NumfmtActionExtensionFactory';

export class NumfmtPlugin extends Plugin {
    protected _controller: NumfmtController;

    protected _numfmtActionExtensionFactory: NumfmtActionExtensionFactory;

    constructor() {
        super(NUMFMT_PLUGIN_NAME);
    }

    onMounted(context: Context): void {
        this._numfmtActionExtensionFactory = new NumfmtActionExtensionFactory(this);
        this._controller = new NumfmtController(this);
        ActionExtensionManager.create().add(this._numfmtActionExtensionFactory);
    }

    onDestroy() {
        super.onDestroy();
        ActionExtensionManager.create().delete(this._numfmtActionExtensionFactory);
    }

    getNumfmtBySheetIdConfig(sheetId: string): ObjectMatrixPrimitiveType<string> {
        return this._controller.getNumfmtBySheetIdConfig(sheetId);
    }

    setNumfmtByRange(sheetId: string, range: IRangeData, format: string): void {
        this._controller.setNumfmtByRange(sheetId, range, format);
    }

    setNumfmtByCoords(sheetId: string, row: number, column: number, format: string): void {
        this._controller.setNumfmtByCoords(sheetId, row, column, format);
    }
}
