import { SheetContext, IRangeData, ObjectMatrixPrimitiveType, Plugin, UniverSheet } from '@univerjs/core';
import { NumfmtPluginObserve, install } from './Basics/Observer';
import { NUMFMT_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { NumfmtController } from './Controller/NumfmtController';
import { NumfmtModalController } from './Controller/NumfmtModalController';
import { NumfmtActionExtensionFactory } from './Basics/Register/NumfmtActionExtension';

export interface INumfmtPluginConfig {}

export class NumfmtPlugin extends Plugin<NumfmtPluginObserve, SheetContext> {
    protected _numfmtController: NumfmtController;

    protected _numfmtModalController: NumfmtModalController;

    protected _numfmtActionExtensionFactory: NumfmtActionExtensionFactory;

    constructor(config?: INumfmtPluginConfig) {
        super(NUMFMT_PLUGIN_NAME);
    }

    static create(config?: INumfmtPluginConfig): NumfmtPlugin {
        return new NumfmtPlugin(config);
    }

    installTo(universheetInstance: UniverSheet): void {
        this._numfmtController = new NumfmtController(this);
        this._numfmtModalController = new NumfmtModalController(this);
    }

    onMounted(context: SheetContext): void {
        install(this);

        this._numfmtActionExtensionFactory = new NumfmtActionExtensionFactory(this);
        this._numfmtModalController = new NumfmtModalController(this);
        this._numfmtController = new NumfmtController(this);
        const actionRegister = this.context.getCommandManager().getActionExtensionManager().getRegister();
        actionRegister.add(this._numfmtActionExtensionFactory);
    }

    onDestroy(): void {
        super.onDestroy();
        const actionRegister = this.context.getCommandManager().getActionExtensionManager().getRegister();
        actionRegister.delete(this._numfmtActionExtensionFactory);
    }

    getNumfmtBySheetIdConfig(sheetId: string): ObjectMatrixPrimitiveType<string> {
        return this._numfmtController.getNumfmtBySheetIdConfig(sheetId);
    }

    setNumfmtByRange(sheetId: string, range: IRangeData, format: string): void {
        this._numfmtController.setNumfmtByRange(sheetId, range, format);
    }

    setNumfmtByCoords(sheetId: string, row: number, column: number, format: string): void {
        this._numfmtController.setNumfmtByCoords(sheetId, row, column, format);
    }

    getNumfmtModalController(): NumfmtModalController {
        return this._numfmtModalController;
    }
}
