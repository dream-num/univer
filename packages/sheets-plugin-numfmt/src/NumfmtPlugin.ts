import { ActionExtensionManager, SheetContext, IRangeData, ObjectMatrixPrimitiveType, Plugin } from '@univer/core';
import { NumfmtPluginObserve, install } from './Basic/Observer';
import { NUMFMT_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { NumfmtController } from './Controller/NumfmtController';
import { NumftmModalController } from './Controller/NumfmtModalController';
import { en, zh } from './Locale';
import { NumfmtActionExtensionFactory } from './NumfmtActionExtensionFactory';

export class NumfmtPlugin extends Plugin<NumfmtPluginObserve, SheetContext> {
    protected _controller: NumfmtController;

    private _numftmModalController: NumftmModalController;

    protected _numfmtActionExtensionFactory: NumfmtActionExtensionFactory;

    constructor() {
        super(NUMFMT_PLUGIN_NAME);
    }

    onMounted(context: SheetContext): void {
        install(this);

        context.getLocale().load({
            en,
            zh,
        });

        this._numfmtActionExtensionFactory = new NumfmtActionExtensionFactory(this);
        this._numftmModalController = new NumftmModalController(this);
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

    getNumfmtModalController() {
        return this._numftmModalController;
    }
}
