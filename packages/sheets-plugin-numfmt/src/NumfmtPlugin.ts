import { SheetContext, IRangeData, ObjectMatrixPrimitiveType, Plugin } from '@univer/core';
import { NumfmtPluginObserve, install } from './Basic/Observer';
import { NUMFMT_PLUGIN_NAME } from './Basic/Const/PLUGIN_NAME';
import { NumfmtController } from './Controller/NumfmtController';
import { NumfmtModalController } from './Controller/NumfmtModalController';
import { en, zh } from './Locale';
import { NumfmtActionExtensionFactory } from './Basic/Register/NumfmtActionExtension';

export class NumfmtPlugin extends Plugin<NumfmtPluginObserve, SheetContext> {
    protected _controller: NumfmtController;

    private _NumfmtModalController: NumfmtModalController;

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
        this._NumfmtModalController = new NumfmtModalController(this);
        this._controller = new NumfmtController(this);
        const actionRegister = this.context.getCommandManager().getActionExtensionManager().getRegister();
        actionRegister.add(this._numfmtActionExtensionFactory);
    }

    onDestroy() {
        super.onDestroy();
        const actionRegister = this.context.getCommandManager().getActionExtensionManager().getRegister();
        actionRegister.delete(this._numfmtActionExtensionFactory);
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
        return this._NumfmtModalController;
    }
}
